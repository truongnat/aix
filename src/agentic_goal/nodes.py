"""LangGraph node implementations for each phase."""

from __future__ import annotations

import re
import uuid
from typing import Any

from langchain_community.chat_models import init_chat_model
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt, wait_exponential

from agentic_goal.config import Config, load_config
from agentic_goal.events import EventType, get_event_bus
from agentic_goal.graph import AgentState
from agentic_goal.tools import CODER_TOOLS


class ReviewOutput(BaseModel):
    """Structured output for code review."""
    score: int = Field(description="Score from 0-10", ge=0, le=10)
    feedback: str = Field(description="Detailed feedback on the code")
    approved: bool = Field(description="Whether the code is approved")


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
def _invoke_llm_with_retry(llm: Any, messages: list[Any]) -> Any:
    """Invoke LLM with retry logic."""
    return llm.invoke(messages)


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
    else:
        # Strip provider prefix (e.g. "ollama/llama3.1:8b" -> "llama3.1:8b")
        # Ollama API requires bare model name; other providers tolerate this
        model_str = model_str.split("/", 1)[1]

    model_kwargs: dict[str, Any] = {}
    if role_cfg.max_tokens:
        model_kwargs["max_tokens"] = role_cfg.max_tokens

    # Pass base_url for ollama provider
    if provider_hint == "ollama" and provider.base_url:
        model_kwargs["base_url"] = provider.base_url

    llm = init_chat_model(
        model_str,
        model_provider=provider_hint,
        temperature=role_cfg.temperature,
        model_kwargs=model_kwargs,
    )

    return llm


def _get_usage_metadata(response: Any) -> tuple[int, int]:
    """Extract token usage from response, defaulting to 0."""
    if hasattr(response, "usage_metadata"):
        return (
            response.usage_metadata.get("input_tokens", 0),
            response.usage_metadata.get("output_tokens", 0),
        )
    return 0, 0


def _parse_tasks_to_kanban(tasks_md: str) -> dict[str, dict[str, Any]]:
    """Parse tasks markdown into structured kanban dict."""
    kanban: dict[str, dict[str, Any]] = {}
    # Simple regex to extract ticket info from markdown
    # Pattern: ## ticket-001: Title
    ticket_pattern = re.compile(r"##\s+(ticket-\d+):\s*(.+)")
    current_ticket = None

    for line in tasks_md.split("\n"):
        match = ticket_pattern.match(line)
        if match:
            ticket_id = match.group(1)
            title = match.group(2)
            kanban[ticket_id] = {
                "title": title,
                "status": "todo",
                "description": "",
            }
            current_ticket = ticket_id
        elif current_ticket and line.strip():
            if kanban[current_ticket]["description"]:
                kanban[current_ticket]["description"] += "\n" + line
            else:
                kanban[current_ticket]["description"] = line

    return kanban


def plan_node(state: AgentState) -> AgentState:
    """Generate a detailed plan from the idea using top-tier model."""
    cfg = load_config()
    llm = _make_llm("planner", cfg)
    event_bus = get_event_bus()

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

    response = _invoke_llm_with_retry(llm, prompt.format_messages())
    plan_content = str(response.content)

    # Track tokens and cost
    tokens_in, tokens_out = _get_usage_metadata(response)
    total_tokens = state.get("cumulative_tokens", 0) + tokens_in + tokens_out
    # Simple cost estimation: $0.001/1K tokens (placeholder)
    cost_usd = (tokens_in + tokens_out) / 1000 * 0.001
    total_cost = state.get("cumulative_cost_usd", 0.0) + cost_usd

    if event_bus:
        event_bus.emit(
            phase="planning",
            node="plan",
            role="planner",
            model=cfg.roles["planner"].model,
            event_type=EventType.LLM_END,
            data={"plan_length": len(plan_content)},
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
        )

    # Ensure goal_id exists
    goal_id = state.get("goal_id") or f"g_{uuid.uuid4().hex[:12]}"

    return {
        **state,
        "goal_id": goal_id,
        "plan": plan_content,
        "phase": "planning",
        "messages": [AIMessage(content=plan_content)],
        "cumulative_tokens": total_tokens,
        "cumulative_cost_usd": total_cost,
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
    event_bus = get_event_bus()

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

    response = _invoke_llm_with_retry(llm, prompt.format_messages())
    questions = str(response.content)

    # Track tokens and cost
    tokens_in, tokens_out = _get_usage_metadata(response)
    total_tokens = state.get("cumulative_tokens", 0) + tokens_in + tokens_out
    cost_usd = (tokens_in + tokens_out) / 1000 * 0.001
    total_cost = state.get("cumulative_cost_usd", 0.0) + cost_usd

    if event_bus:
        event_bus.emit(
            phase="rules",
            node="rules",
            role="rules_advisor",
            model=cfg.roles["rules_advisor"].model,
            event_type=EventType.LLM_END,
            data={"questions_length": len(questions)},
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
        )

    return {
        **state,
        "rules": questions,
        "phase": "rules",
        "messages": [AIMessage(content=questions)],
        "cumulative_tokens": total_tokens,
        "cumulative_cost_usd": total_cost,
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
    event_bus = get_event_bus()

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

    response = _invoke_llm_with_retry(llm, prompt.format_messages())
    tasks_md = str(response.content)

    # Track tokens and cost
    tokens_in, tokens_out = _get_usage_metadata(response)
    total_tokens = state.get("cumulative_tokens", 0) + tokens_in + tokens_out
    cost_usd = (tokens_in + tokens_out) / 1000 * 0.001
    total_cost = state.get("cumulative_cost_usd", 0.0) + cost_usd

    if event_bus:
        event_bus.emit(
            phase="tasks",
            node="tasks",
            role="task_decomposer",
            model=cfg.roles["task_decomposer"].model,
            event_type=EventType.LLM_END,
            data={"tasks_length": len(tasks_md)},
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
        )

    # Parse tasks into kanban
    kanban = _parse_tasks_to_kanban(tasks_md)

    return {
        **state,
        "tasks": [{"raw": tasks_md}],
        "kanban": kanban,
        "phase": "tasks",
        "messages": [AIMessage(content=tasks_md)],
        "cumulative_tokens": total_tokens,
        "cumulative_cost_usd": total_cost,
    }


def tasks_approval_node(state: AgentState) -> AgentState:
    """Interrupt for user to approve the task decomposition."""
    return {
        **state,
        "interrupt_reason": "tasks_approval",
    }


def pick_ticket_node(state: AgentState) -> AgentState:
    """Pick the next pending ticket from kanban."""
    kanban = state.get("kanban", {})
    for ticket_id, ticket_info in kanban.items():
        if ticket_info.get("status") == "todo":
            # Mark as in_progress
            kanban[ticket_id]["status"] = "in_progress"
            return {
                **state,
                "kanban": kanban,
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
    event_bus = get_event_bus()
    ticket_id = state.get("current_ticket_id") or "unknown"
    kanban = state.get("kanban", {})
    ticket = kanban.get(ticket_id, {}) if ticket_id and ticket_id in kanban else {}

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

    response = _invoke_llm_with_retry(llm, prompt.format_messages())
    plan = str(response.content)

    # Track tokens and cost
    tokens_in, tokens_out = _get_usage_metadata(response)
    total_tokens = state.get("cumulative_tokens", 0) + tokens_in + tokens_out
    cost_usd = (tokens_in + tokens_out) / 1000 * 0.001
    total_cost = state.get("cumulative_cost_usd", 0.0) + cost_usd

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="ticket_plan",
            role="ticket_planner",
            model=cfg.roles["ticket_planner"].model,
            event_type=EventType.LLM_END,
            data={"plan_length": len(plan)},
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
        )

    # Save ticket plan
    return {
        **state,
        "messages": [AIMessage(content=plan)],
        "cumulative_tokens": total_tokens,
        "cumulative_cost_usd": total_cost,
    }


def coder_node(state: AgentState) -> AgentState:
    """Implement the current ticket using tools."""
    cfg = load_config()
    llm = _make_llm("coder", cfg)
    event_bus = get_event_bus()
    ticket_id = state.get("current_ticket_id") or "unknown"
    kanban = state.get("kanban", {})
    ticket = kanban.get(ticket_id, {}) if ticket_id in kanban else {}

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

    # Build tool map for execution
    tool_map = {tool.name: tool for tool in CODER_TOOLS}

    # Initial messages
    messages = [
        SystemMessage(
            content=(
                "You are a pragmatic engineer implementing a ticket. "
                "Use the available tools (read_file, write_file, run_shell, git_*) "
                "to implement the solution. Commit your changes when done."
            )
        ),
        HumanMessage(
            content=(
                f"Project Plan:\n{state.get('plan', 'N/A')}\n\n"
                f"Project Rules:\n{state.get('rules', 'N/A')}\n\n"
                f"Ticket:\n{ticket}\n\n"
                "Implement this ticket based on the plan and rules."
            )
        ),
    ]

    # Tool execution loop
    max_iterations = 10
    total_tokens_in = 0
    total_tokens_out = 0

    for _ in range(max_iterations):
        response = _invoke_llm_with_retry(llm_with_tools, messages)
        messages.append(response)

        # Track tokens
        if hasattr(response, "usage_metadata"):
            total_tokens_in += response.usage_metadata.get("input_tokens", 0)
            total_tokens_out += response.usage_metadata.get("output_tokens", 0)

        # If no tool calls, we're done
        if not response.tool_calls:
            break

        # Execute tool calls - MUST append a ToolMessage for every tool_call
        # or the next LLM call will fail with API error.
        for tool_call in response.tool_calls:
            tool_name = tool_call.get("name")
            tool_args = tool_call.get("args", {})
            tool_call_id = tool_call.get("id", "")

            if tool_name in tool_map:
                tool = tool_map[tool_name]
                try:
                    result = tool.invoke(tool_args)
                    messages.append(
                        ToolMessage(content=str(result), tool_call_id=tool_call_id)
                    )
                except Exception as e:
                    messages.append(
                        ToolMessage(
                            content=f"Error: {str(e)}",
                            tool_call_id=tool_call_id,
                        )
                    )
            else:
                # Unknown tool - still append ToolMessage to satisfy API contract
                messages.append(
                    ToolMessage(
                        content=f"Error: unknown tool '{tool_name}'",
                        tool_call_id=tool_call_id,
                    )
                )

    # Update cumulative tokens/cost
    cumulative_tokens = state.get("cumulative_tokens", 0) + total_tokens_in + total_tokens_out
    cost_usd = (total_tokens_in + total_tokens_out) / 1000 * 0.001
    cumulative_cost = state.get("cumulative_cost_usd", 0.0) + cost_usd

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="coder",
            role="coder",
            model=cfg.roles["coder"].model,
            event_type=EventType.LLM_END,
            data={"message_count": len(messages)},
            tokens_in=total_tokens_in,
            tokens_out=total_tokens_out,
            cost_usd=cost_usd,
        )

    return {
        **state,
        "messages": messages,
        "cumulative_tokens": cumulative_tokens,
        "cumulative_cost_usd": cumulative_cost,
    }


def reviewer_node(state: AgentState) -> AgentState:
    """Review the code and score it (0-10)."""
    cfg = load_config()
    llm = _make_llm("reviewer", cfg)
    event_bus = get_event_bus()
    ticket_id = state.get("current_ticket_id") or "unknown"
    kanban = state.get("kanban", {})
    ticket = kanban.get(ticket_id, {}) if ticket_id in kanban else {}

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="reviewer",
            role="reviewer",
            model=cfg.roles["reviewer"].model,
            event_type=EventType.LLM_START,
            data={"ticket_id": ticket_id},
        )

    # Get git diff for context
    from agentic_goal.tools import git_diff

    diff_output = git_diff.invoke({})

    # Use structured output with include_raw to also get usage metadata
    llm_structured = llm.with_structured_output(ReviewOutput, include_raw=True)

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=(
                    "You are a strict code reviewer. Review the implementation and score it 0-10 "
                    "based on:\n"
                    "- Correctness\n"
                    "- Code quality\n"
                    "- Testing\n"
                    "- Documentation"
                )
            ),
            HumanMessage(
                content=(
                    f"Ticket:\n{ticket}\n\n"
                    f"Git Diff:\n{diff_output}\n\n"
                    "Review the implementation based on the ticket requirements."
                )
            ),
        ]
    )

    raw_response = _invoke_llm_with_retry(llm_structured, prompt.format_messages())
    # raw_response is a dict {"raw": AIMessage, "parsed": ReviewOutput, "parsing_error": ...}
    parsed: ReviewOutput | None = raw_response.get("parsed")
    raw_msg = raw_response.get("raw")

    # Track tokens and cost from raw message
    tokens_in, tokens_out = _get_usage_metadata(raw_msg)
    total_tokens = state.get("cumulative_tokens", 0) + tokens_in + tokens_out
    cost_usd = (tokens_in + tokens_out) / 1000 * 0.001
    total_cost = state.get("cumulative_cost_usd", 0.0) + cost_usd

    # Fallback if parsing failed
    if parsed is None:
        score = 0
        approved = False
        feedback = "Review parsing failed."
    else:
        score = parsed.score
        approved = parsed.approved
        feedback = parsed.feedback
    review = f"Score: {score}/10\nApproved: {approved}\nFeedback: {feedback}"

    # Mark ticket as done if approved
    if approved and ticket_id in kanban:
        kanban[ticket_id]["status"] = "done"

    if event_bus:
        event_bus.emit(
            phase="execution",
            node="reviewer",
            role="reviewer",
            model=cfg.roles["reviewer"].model,
            event_type=EventType.LLM_END,
            data={"review_length": len(review), "score": score, "approved": approved},
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
        )

    return {
        **state,
        "kanban": kanban,
        "messages": [AIMessage(content=review)],
        "cumulative_tokens": total_tokens,
        "cumulative_cost_usd": total_cost,
    }


