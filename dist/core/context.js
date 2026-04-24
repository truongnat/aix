/**
 * Skill System v1 - Context Management
 *
 * Manages execution context, session state, and memory
 */
export class ContextManager {
    sessions = new Map();
    globalContext = {};
    setGlobalContext(context) {
        this.globalContext = { ...this.globalContext, ...context };
    }
    getGlobalContext() {
        return { ...this.globalContext };
    }
    createSession(sessionId, initialContext) {
        const context = {
            ...this.globalContext,
            sessionId,
            ...initialContext,
            previousOutputs: new Map(),
        };
        this.sessions.set(sessionId, context);
        return context;
    }
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    updateSession(sessionId, updates) {
        const existing = this.sessions.get(sessionId);
        if (existing) {
            this.sessions.set(sessionId, { ...existing, ...updates });
        }
    }
    storeOutput(sessionId, skillName, output) {
        const session = this.sessions.get(sessionId);
        if (session && session.previousOutputs) {
            session.previousOutputs.set(skillName, output);
        }
    }
    getPreviousOutput(sessionId, skillName) {
        const session = this.sessions.get(sessionId);
        return session?.previousOutputs?.get(skillName);
    }
    clearSession(sessionId) {
        this.sessions.delete(sessionId);
    }
    clearAllSessions() {
        this.sessions.clear();
    }
}
export const contextManager = new ContextManager();
