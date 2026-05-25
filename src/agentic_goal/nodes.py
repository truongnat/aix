"""LangGraph node implementations for each phase."""

from __future__ import annotations

import uuid

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from agentic_goal.config import load_config
from agentic_goal.graph import AgentState


def plan_node(state: AgentState) -> AgentState:
    """Generate a detailed plan from the idea using top-tier model."""
    cfg = load_config()
    planner_role = cfg.roles.get("planner")
    if not planner_role:
        raise ValueError("Missing planner role config")

    # Resolve provider and create LLM
    provider_hint = (
        planner_role.model.split("/")[0] if "/" in planner_role.model else cfg.default_provider
    )
    provider = cfg.providers.get(provider_hint) or cfg.providers.get(cfg.default_provider)
    if not provider:
        raise ValueError(f"No provider for planner: {provider_hint}")

    # For now, use OpenAI-compatible interface (works with OpenRouter too)
    llm = ChatOpenAI(
        model=planner_role.model,
        temperature=planner_role.temperature,
        base_url=provider.base_url,
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

    # Ensure goal_id exists
    goal_id = state.get("goal_id") or f"g_{uuid.uuid4().hex[:12]}"

    return {
        **state,
        "goal_id": goal_id,
        "plan": plan_content,
        "phase": "planning",
        "messages": [AIMessage(content=plan_content)],
    }


def rules_node(state: AgentState) -> AgentState:
    """Generate questions for user to define rules/stack."""
    cfg = load_config()
    advisor_role = cfg.roles.get("rules_advisor")
    if not advisor_role:
        raise ValueError("Missing rules_advisor role config")

    provider_hint = (
        advisor_role.model.split("/")[0] if "/" in advisor_role.model else cfg.default_provider
    )
    provider = cfg.providers.get(provider_hint) or cfg.providers.get(cfg.default_provider)
    if not provider:
        raise ValueError(f"No provider for rules_advisor: {provider_hint}")

    llm = ChatOpenAI(
        model=advisor_role.model,
        temperature=advisor_role.temperature,
        base_url=provider.base_url,
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

    return {
        **state,
        "rules": questions,
        "phase": "rules",
        "messages": [AIMessage(content=questions)],
    }


def tasks_node(state: AgentState) -> AgentState:
    """Decompose plan into tickets/phases."""
    cfg = load_config()
    decomposer_role = cfg.roles.get("task_decomposer")
    if not decomposer_role:
        raise ValueError("Missing task_decomposer role config")

    provider_hint = (
        decomposer_role.model.split("/")[0]
        if "/" in decomposer_role.model
        else cfg.default_provider
    )
    provider = cfg.providers.get(provider_hint) or cfg.providers.get(cfg.default_provider)
    if not provider:
        raise ValueError(f"No provider for task_decomposer: {provider_hint}")

    llm = ChatOpenAI(
        model=decomposer_role.model,
        temperature=decomposer_role.temperature,
        base_url=provider.base_url,
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
    tasks_md = response.content

    return {
        **state,
        "tasks": [{"raw": tasks_md}],  # Placeholder: will parse into structured list later
        "phase": "tasks",
        "messages": [AIMessage(content=tasks_md)],
    }
