"""Tests for _parse_tasks_to_kanban."""


from agentic_goal.nodes import _parse_tasks_to_kanban


def test_basic_ticket_with_inline_title() -> None:
    md = "## ticket-001: Setup project\nSome description"
    kanban = _parse_tasks_to_kanban(md)
    assert "ticket-001" in kanban
    assert kanban["ticket-001"]["title"] == "Setup project"
    assert kanban["ticket-001"]["status"] == "todo"


def test_ticket_zero_padded() -> None:
    md = "## ticket-1: First ticket"
    kanban = _parse_tasks_to_kanban(md)
    assert "ticket-001" in kanban


def test_ticket_with_bold_title_line() -> None:
    md = "## ticket-002\n**Title:** Implement CLI"
    kanban = _parse_tasks_to_kanban(md)
    assert kanban["ticket-002"]["title"] == "Implement CLI"


def test_multiple_tickets() -> None:
    md = (
        "## ticket-001: Alpha\n"
        "Description alpha\n\n"
        "## ticket-002: Beta\n"
        "Description beta\n"
    )
    kanban = _parse_tasks_to_kanban(md)
    assert len(kanban) == 2
    assert kanban["ticket-001"]["title"] == "Alpha"
    assert kanban["ticket-002"]["title"] == "Beta"


def test_empty_input() -> None:
    assert _parse_tasks_to_kanban("") == {}


def test_no_tickets() -> None:
    assert _parse_tasks_to_kanban("# Just a heading\nSome text") == {}


def test_description_accumulated() -> None:
    md = "## ticket-001: Foo\nLine 1\nLine 2"
    kanban = _parse_tasks_to_kanban(md)
    assert "Line 1" in kanban["ticket-001"]["description"]
    assert "Line 2" in kanban["ticket-001"]["description"]


def test_dash_separator() -> None:
    md = "## ticket-003 - Title with dash"
    kanban = _parse_tasks_to_kanban(md)
    assert "ticket-003" in kanban
    assert kanban["ticket-003"]["title"] == "Title with dash"


def test_em_dash_separator() -> None:
    md = "## ticket-004 — Em dash title"
    kanban = _parse_tasks_to_kanban(md)
    assert "ticket-004" in kanban
    assert kanban["ticket-004"]["title"] == "Em dash title"


def test_h3_header() -> None:
    md = "### ticket-005: H3 ticket"
    kanban = _parse_tasks_to_kanban(md)
    assert "ticket-005" in kanban
