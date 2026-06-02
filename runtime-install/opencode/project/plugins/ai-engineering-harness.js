/**
 * ai-engineering-harness OpenCode plugin — bootstrap + .harness/ discipline.
 * Installed to .opencode/plugins/ (project) or ~/.config/opencode/plugins/ (global).
 */

const bootstrap = `
<!-- ai-engineering-harness:bootstrap -->
You are using the ai-engineering-harness capability pack.

Before implementation:
1. Read .harness/ profile files when present (HARNESS, TEAM, WORKFLOW, GATES, MEMORY).
2. Read active goal artifacts under .harness/goals/ when executing a goal.
3. Follow harness command discipline; verify with evidence before claiming done.

Do not copy the full harness pack into the product repo root. Do not persist secrets in .harness/.
<!-- /ai-engineering-harness:bootstrap -->
`;

export const AiEngineeringHarnessPlugin = async () => ({
  "experimental.chat.messages.transform": async (_input, output) => {
    if (!bootstrap || !output.messages?.length) return;
    const firstUser = output.messages.find((m) => m.info?.role === "user");
    if (!firstUser?.parts?.length) return;
    if (firstUser.parts.some((p) => p.type === "text" && p.text?.includes("ai-engineering-harness:bootstrap"))) {
      return;
    }
    const ref = firstUser.parts[0];
    firstUser.parts.unshift({ ...ref, type: "text", text: bootstrap });
  }
});

export default AiEngineeringHarnessPlugin;
