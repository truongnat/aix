"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEvents = readEvents;
exports.resolveEventsPath = resolveEventsPath;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function resolveEventsPath(targetRoot) {
    return node_path_1.default.join(targetRoot, ".harness", "history", "events.jsonl");
}
function readEvents(eventsPath) {
    if (!node_fs_1.default.existsSync(eventsPath)) {
        return [];
    }
    const events = [];
    const lines = node_fs_1.default.readFileSync(eventsPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            continue;
        }
        try {
            events.push(JSON.parse(trimmed));
        }
        catch {
            // Skip malformed lines so local history stays resilient.
        }
    }
    return events;
}
