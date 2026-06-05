"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatInsightsText = formatInsightsText;
exports.summarizeEvents = summarizeEvents;
function incrementCounter(map, key, amount = 1) {
    if (!key) {
        return;
    }
    map.set(key, (map.get(key) || 0) + amount);
}
function mapToSortedEntries(map) {
    return [...map.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}
function summarizeEvents(events) {
    const skills = new Map();
    const guardBlocks = new Map();
    const guardPasses = new Map();
    const tools = new Map();
    const toolFailures = new Map();
    const subagents = new Map();
    for (const event of events) {
        if (event.type === "skill-run") {
            incrementCounter(skills, event.skill);
            continue;
        }
        if (event.type === "guard-phase") {
            if (event.ok) {
                incrementCounter(guardPasses, event.command);
            }
            else {
                incrementCounter(guardBlocks, event.command);
            }
            continue;
        }
        if (event.type === "tool-run") {
            incrementCounter(tools, event.command);
            if (Number(event.exit_code) !== 0) {
                incrementCounter(toolFailures, event.command);
            }
            continue;
        }
        if (event.type === "subagent-run") {
            incrementCounter(subagents, event.agent);
        }
    }
    return {
        totalEvents: events.length,
        skills: mapToSortedEntries(skills),
        guardBlocks: mapToSortedEntries(guardBlocks),
        guardPasses: mapToSortedEntries(guardPasses),
        tools: mapToSortedEntries(tools).map(([command, count]) => ({
            command,
            count,
            failures: toolFailures.get(command) || 0,
        })),
        subagents: mapToSortedEntries(subagents),
    };
}
function formatInsightsText(summary, eventsPath) {
    const lines = [`Harness Insights (${eventsPath})`, `Events: ${summary.totalEvents}`, ""];
    const appendSection = (title, rows, formatter) => {
        lines.push(title);
        if (rows.length === 0) {
            lines.push("  (none)");
        }
        else {
            for (const row of rows) {
                lines.push(`  ${formatter(row)}`);
            }
        }
        lines.push("");
    };
    appendSection("Skills:", summary.skills, ([name, count]) => `${name}: ${count}`);
    appendSection("Phase guard blocks:", summary.guardBlocks, ([command, count]) => `${command}: ${count}`);
    appendSection("Tools:", summary.tools, (entry) => `${entry.command}: ${entry.count} (${entry.failures} failed)`);
    appendSection("Subagents:", summary.subagents, ([agent, count]) => `${agent}: ${count}`);
    return `${lines.join("\n").trim()}\n`;
}
