# Skill: crewai-multi-agent
Schema: antigrav.skill@v1

```json
{
  "description": "Multi-agent orchestration framework for autonomous AI collaboration. Use when building teams of specialized agents working together on complex tasks, when you need role-based agent collaboration with ",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155442,
  "model": "qwen3:8b",
  "name": "crewai-multi-agent",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "14-agents/crewai/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "agents",
    "ai-research",
    "autonomous",
    "collaboration",
    "crewai",
    "memory",
    "multi-agent",
    "orchestration",
    "production",
    "role-based",
    "workflows"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Multi-agent orchestration framework for autonomous AI collaboration. Use when building teams of specialized agents working together on complex tasks, when you need role-based agent collaboration with memory, or for production workflows requiring sequential/hierarchical execution. Built without LangChain dependencies for lean, fast execution.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Core framework
pip install crewai

# With 50+ built-in tools
pip install 'crewai[tools]'
- # Create new crew project
crewai create crew my_project
cd my_project

# Install dependencies
crewai install

# Run the crew
crewai run
- from crewai import Agent, Task, Crew, Process

# 1. Define agents
researcher = Agent(
    role="Senior Research Analyst",
    goal="Discover cutting-edge developments in AI",
    backstory="You are an expert analyst with a keen eye for emerging trends.",
    verbose=True
)

writer = Agent(
    role="Technical Writer",
    goal="Create clear, engaging content about technical topics",
    backstory="You excel at explaining complex concepts to general audiences.",
    verbose=True
)

# 2. Define tasks
research_task = Task(
    description="Research the latest developments in {topic}. Find 5 key trends.",
    expected_output="A detailed report with 5 bullet points on key trends.",
    agent=researcher
)

write_task = Task(
    description="Write a blog post based on the research findings.",
    expected_output="A 500-word blog post in markdown format.",
    agent=writer,
    context=[research_task]  # Uses research output
)

# 3. Create and run crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,  # Tasks run in order
    verbose=True
)

# 4. Execute
result = crew.kickoff(inputs={"topic": "AI Agents"})
print(result.raw)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `14-agents/crewai/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# CrewAI - Multi-Agent Orchestration Framework Build teams of autonomous AI agents that collaborate to solve complex tasks. ## When to use CrewAI **Use CrewAI when:** - Building multi-agent systems with specialized roles - Need autonomous collaboration between agents - Want role-based task delegation (researcher, writer, analyst) - Require sequential or hierarchical process execution - Building production workflows with memory and observability - Need simpler setup than LangChain/LangGraph **Key features:** - **Standalone**: No LangChain dependencies, lean footprint - **Role-based**: Agents have roles, goals, and backstories - **Dual paradigm**: Crews (autonomous) + Flows (event-driven) - **50+ tools**: Web scraping, search, databases, AI services - **Memory**: Short-term, long-term, and e

{{input}}
