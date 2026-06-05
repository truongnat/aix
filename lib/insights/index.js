"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeEvents = exports.resolveEventsPath = exports.readEvents = exports.formatInsightsText = exports.buildAnonymizedExport = void 0;
exports.buildInsights = buildInsights;
exports.buildInsightsExport = buildInsightsExport;
const node_path_1 = __importDefault(require("node:path"));
const event_reader_1 = require("./event-reader");
Object.defineProperty(exports, "readEvents", { enumerable: true, get: function () { return event_reader_1.readEvents; } });
Object.defineProperty(exports, "resolveEventsPath", { enumerable: true, get: function () { return event_reader_1.resolveEventsPath; } });
const export_1 = require("./export");
Object.defineProperty(exports, "buildAnonymizedExport", { enumerable: true, get: function () { return export_1.buildAnonymizedExport; } });
const summarize_1 = require("./summarize");
Object.defineProperty(exports, "formatInsightsText", { enumerable: true, get: function () { return summarize_1.formatInsightsText; } });
Object.defineProperty(exports, "summarizeEvents", { enumerable: true, get: function () { return summarize_1.summarizeEvents; } });
function buildInsights(targetRoot) {
    const resolvedTarget = node_path_1.default.resolve(targetRoot || ".");
    const eventsPath = (0, event_reader_1.resolveEventsPath)(resolvedTarget);
    const events = (0, event_reader_1.readEvents)(eventsPath);
    const summary = (0, summarize_1.summarizeEvents)(events);
    return {
        target: resolvedTarget,
        eventsPath,
        events,
        summary,
        output: (0, summarize_1.formatInsightsText)(summary, eventsPath),
    };
}
function buildInsightsExport(targetRoot, options = {}) {
    const insights = buildInsights(targetRoot);
    return (0, export_1.buildAnonymizedExport)(insights.summary, {
        includeFingerprint: true,
        ...options,
    });
}
