"""LangGraph node implementations for each phase."""

from __future__ import annotations

import uuid
from typing import Any

from langchain_community.chat_models import init_chat_model
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate

from agentic_goal.config import Config, load_config
from agentic_goal.events import EventType
from agentic_goal.graph import AgentState
from agentic_goal.tools import CODER_TOOLS


def _make_llm(role_name: str, cfg: Config) -> Any:
    """Create LLM instance based on role config and provider routing."""
    role_cfg = cfg.roles.get(role_name)
    if not role_cfg:
        raise ValueError(f"Missing role config: {role_name}")

    # Resolve provider from model string (e.g. "anthropic/claude-opus-4")
    provider_hint = (
        role_cfg.model.split("/")[0] if "/" in role_cfg.model else cfg.default_provider
    )
    provider = cfg.providers.get(provider_hint) or cfg.providers.get(cfg.default_provider)
    if not provider:
        raise ValueError(f"No provider config for role '{role_name}' (hint: {provider_hint})")

    # Use init_chat_model for multi-provider support
    # Model format: "provider:model" or just "model" (defaults to openai)
    model_str = role_cfg.model
    if "/" not in model_str:
        model_str = f"{provider_hint}:{model_str}"

    model_kwargs: dict[str, Any] = {}
    if role_cfg.max_tokens:
        model_kwargs["max_tokens"] = role_cfg.max_tokens

    llm = init_chat_model(
        model_str,
        model_provider=provider_hint,
        temperature=role_cfg.temperature,
        model_kwargs=model_kwargs,
    )

    return llm


def plan_node(state: AgentState) -> AgentState:
    """Generate a detailed plan from the idea using top-tier model."""
    cfg = load_config()
    llm = _make_llm("planner", cfg)
    event_bus = state.get("event_bus")

    if event_bus:
        event_bus.emit(
            phase="planning",
            node="plan",
            role="planner",
            model=cfg.roles["planner"].model,
            event_type=EventType.LLM_START,
            data={"idea": state["idea"]},
        )

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=(
                    "You are an expert software architect. Given a goal/idea, produce a detailed, "
                    "actionable plan for building it. Include:\n"
                    "- High-level architecture\n"
                    "- Key components and their responsibilities\n"
                    "- Data flow\n"
                    "- Technology considerations (but defer final stack decisions to rules phase)\n"
                    "- Potential risks and mitigations\n"
                    "- Success criteria\n\n"
                    "Output in Markdown format. Be thorough but concise."
                )
            ),
            HumanMessage(content=f"Goal: {state['idea']}"),
        ]
    )

    response = llm.invoke(prompt.format_messages())
    plan_content = str(response.content)

    if event_bus:
        event_bus.emit(
            phase="planning",
            node="plan",
            role="planner",
            model=cfg.roles["planner"].model,
            event_type=EventType.LLM_END,
            data={"plan_length": len(plan_content)},
        )

    # Ensure goal_id exists
    goal_id = state.get("goal_id") or f"g_{uuid.uuid4().hex[:12]}"

    return {
        **state,
        "goal_id": goal_id,
        "plan": plan_content,
        "phase": "planning",
        "messages": [AIMessage(content=plan_content)],
    }


def plan_approval_node(state: AgentState) -> AgentState:
    """Interrupt for user to approve the plan."""
    return {
        **state,
        "interrupt_reason": "plan_approval",
    }


def rules_node(state: AgentState) -> AgentState:
    """Generate questions for user to define rules/stack."""
    cfg = load_config()
    llm = _make_llm("rules_advisor", cfg)
    event_bus = state.get("event_bus")

    if event_bus:
        event_bus.emit(
            phase="rules",
            node="rules",
            role="rules_advisor",
            model=cfg.roles["rules_advisor"].model,
            event_type=EventType.LLM_START,
            data={"plan_length": len(state["plan"])},
        )

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=(
                    "You are a senior engineer helping define project rules and tech stack. "
                    "Given the plan, generate 5-10 targeted questions to ask the user about:\n"
                    "- Preferred programming language/framework\n"
                    "- Code style preferences (formatting, linting rules)\n"
                    "- Testing strategy\n"
                    "- Deployment target\n"
                    "- Any specific constraints or requirements\n\n"
                    "Output as a numbered list of questions, one per line."
                )
            ),
            HumanMessage(content=f"Plan:\n{state['plan']}"),
        ]
    )

    response = llm.invoke(prompt.format_messages())
    questions = str(response.content)

    if event_bus:
        event_bus.emit(
            phase="rules",
            node="rules",
            role="rules_advisor",
            model=cfg.roles["rules_advisor"].model,
            event_type=EventType.LLM_END,
            data={"questions_length": len(questions)},
        )

    return {
        **state,
        "rules": questions,
        "phase": "rules",
        "messages": [AIMessage(content=questions)],
    }


def rules_approval_node(state: AgentState) -> AgentState:
    """Interrupt for user to answer rules questions."""
    return {
        **state,
        "interrupt_reason": "rules_approval",
    }


def tasks_node(state: AgentState) -> AgentState:
    """Decompose plan into tickets/phases."""
    cfg = load_config()
    llm = _make_llm("task_decomposer", cfg)
    event_bus = state.get("event_bus")

    if event_bus:
        event_bus.emit(
            phase="tasks",
            node="tasks",
            role="task_decomposer",
            model=cfg.roles["task_decomposer"].model,
            event_type=EventType.LLM_START,
            data={"plan_length": len(state["plan"]), "rules_length": len(state["rules"])},
        )

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=(
                    "You are a project manager. Given the plan and rules, decompose the work into "
                    "executable tickets organized by phase. For each ticket, provide:\n"
                    "- id (e.g., ticket-001)\n"
                    "- title\n"
                    "- description\n"
                    "- acceptance criteria\n"
                    "- dependencies (other ticket ids)\n\n"
                    "Output in Markdown with sections for each phase."
                )
            ),
            HumanMessage(content=f"Plan:\n{state['plan']}\n\nRules:\n{state['rules']}"),
        ]
    )

    response = llm.invoke(prompt.format_messages())
    tasks_md = str(response.content)

    if event_bus:
        event_bus.emit(
            phase="tasks",
            node="tasks",
            role="task_decomposer",
            model=cfg.roles["task_decomposer"].model,
            event_type=EventType.LLM_END,
            data={"tasks_length": len(tasks_md)},
        )

    return {
        **state,
        "tasks": [{"raw": tasks_md}],  # Placeholder: will parse into structured list later
        "phase": "tasks",
        "messages": [AIMessage(content=tasks_md)],
    }


def tasks_approval_node(state: AgentState) -> AgentState:
    """Interrupt for user to approve the task decomposition."""
    return {
        **state,
        "interrupt_reason": "tasks_approval",
    }


def pick_ticket_node(state: AgentState) -> AgentState:
    """Pick the next pending ticket from kanban."""
    # Simple implementation: find first ticket not in 'done' status
    kanban = state.get("kanban", {})
    for ticket_id, ticket_info in kanban.items():
        if ticket_info.get("status") != "done":
            return {
                **state,
                "current_ticket_id": ticket_id,
                "phase": "execution",
            }
    # All tickets done
    return {
        **state,
        "current_ticket_id": None,
        "phase": "done",
    }


def ticket_plan_node(state: AgentState) -> AgentState:
    """Plan the current ticket implementation."""
    cfg = load_config()
    llm = _make_llm("ticket_planner", cfg)
    event_bus = state.get("event_bus")
    ticket_id = state.get("current_ticket_id") or "unknown"
    kanban = state.get("kanban", {})
    ticket = kanban.get(ticket_id, {}) if ticket_id in kanban else {}

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="ticket_plan",
            role="ticket_planner",
            model=cfg.roles["ticket_planner"].model,
            event_type=EventType.LLM_START,
            data={"ticket_id": ticket_id},
        )

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=(
                    "You are a senior engineer. Given a ticket from the task list, "
                    "produce a detailed implementation plan. Include:\n"
                    "- Files to create/modify\n"
                    "- Step-by-step implementation approach\n"
                    "- Testing strategy\n\n"
                    "Output in Markdown format."
                )
            ),
            HumanMessage(content=f"Ticket:\n{ticket}"),
        ]
    )

    response = llm.invoke(prompt.format_messages())
    plan = str(response.content)

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="ticket_plan",
            role="ticket_planner",
            model=cfg.roles["ticket_planner"].model,
            event_type=EventType.LLM_END,
            data={"plan_length": len(plan)},
        )

    # Save ticket plan
    return {
        **state,
        "messages": [AIMessage(content=plan)],
    }


def coder_node(state: AgentState) -> AgentState:
    """Implement the current ticket using tools."""
    cfg = load_config()
    llm = _make_llm("coder", cfg)
    event_bus = state.get("event_bus")
    ticket_id = state.get("current_ticket_id", "unknown")

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="coder",
            role="coder",
            model=cfg.roles["coder"].model,
            event_type=EventType.LLM_START,
            data={"ticket_id": ticket_id},
        )

    # Bind tools to LLM
    llm_with_tools = llm.bind_tools(CODER_TOOLS)

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=(
                    "You are a pragmatic engineer implementing a ticket. "
                    "Use the available tools (read_file, write_file, run_shell, git_*) "
                    "to implement the solution. Commit your changes when done."
                )
            ),
            HumanMessage(content="Implement the ticket based on the plan."),
        ]
    )

    response = llm_with_tools.invoke(prompt.format_messages())

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="coder",
            role="coder",
            model=cfg.roles["coder"].model,
            event_type=EventType.LLM_END,
            data={"has_tool_calls": len(response.tool_calls) > 0},
        )

    return {
        **state,
        "messages": [response],
    }


def reviewer_node(state: AgentState) -> AgentState:
    """Review the code and score it (0-10)."""
    cfg = load_config()
    llm = _make_llm("reviewer", cfg)
    event_bus = state.get("event_bus")
    ticket_id = state.get("current_ticket_id", "unknown")

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="reviewer",
            role="reviewer",
            model=cfg.roles["reviewer"].model,
            event_type=EventType.LLM_START,
            data={"ticket_id": ticket_id},
        )

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=(
                    "You are a strict code reviewer. Review the implementation and score it 0-10 "
                    "based on:\n"
                    "- Correctness\n"
                    "- Code quality\n"
                    "- Testing\n"
                    "- Documentation\n\n"
                    "Output JSON with keys: score (int), feedback (str), approved (bool)."
                )
            ),
            HumanMessage(content="Review the recent changes."),
        ]
    )

    response = llm.invoke(prompt.format_messages())
    review = str(response.content)

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="reviewer",
            role="reviewer",
            model=cfg.roles["reviewer"].model,
            event_type=EventType.LLM_END,
            data={"review_length": len(review)},
        )

    return {
        **state,
        "messages": [AIMessage(content=review)],
    }


def resume_analyzer_node(state: AgentState) -> AgentState:
    """Analyze checkpointed state to determine where to resume."""
    cfg = load_config()
    llm = _make_llm("resume_analyzer", cfg)
    event_bus = state.get("event_bus")

    if event_bus:
        event_bus.emit(
            phase="resume",
            node="resume_analyzer",
            role="resume_analyzer",
            model=cfg.roles["resume_analyzer"].model,
            event_type=EventType.LLM_START,
            data={"current_phase": state.get("phase")},
        )

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=(
                    "You are a resume analyzer. Given the current state, determine "
                    "where to resume execution. Output the next node name to execute.\n"
                    "Possible nodes: plan, rules, tasks, pick_ticket, ticket_plan, "
                    "coder, reviewer.\n"
                    "Output only the node name."
                )
            ),
            HumanMessage(
                content=f"Current phase: {state.get('phase')}\n"
                f"Interrupt reason: {state.get('interrupt_reason')}\n"
                f"Current ticket: {state.get('current_ticket_id')}"
            ),
        ]
    )

    response = llm.invoke(prompt.format_messages())
    next_node = str(response.content).strip()

    if event_bus:
        event_bus.emit(
            phase="resume",
            node="resume_analyzer",
            role="resume_analyzer",
            model=cfg.roles["resume_analyzer"].model,
            event_type=EventType.LLM_END,
            data={"next_node": next_node},
        )

    # Update phase based on analysis
    return {
        **state,
        "interrupt_reason": None,  # Clear interrupt
        "messages": [AIMessage(content=f"Resuming at: {next_node}")],
    }
