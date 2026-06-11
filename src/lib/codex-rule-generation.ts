type CodexRuleDecision = "allow" | "prompt" | "forbidden";

interface CodexPrefixRuleSpec {
  prefixes: string[];
  decision: CodexRuleDecision;
  justification: string;
}

function tokenizeCodexRulePattern(prefix: string): string[] {
  return prefix.trim().split(/\s+/).filter(Boolean);
}

function renderCodexPrefixRule(
  pattern: string[],
  decision: CodexRuleDecision,
  justification: string
): string {
  return [
    "prefix_rule(",
    `  pattern = ${JSON.stringify(pattern)},`,
    `  decision = ${JSON.stringify(decision)},`,
    `  justification = ${JSON.stringify(justification)},`,
    ")",
  ].join("\n");
}

function renderCodexRuleSet(specs: CodexPrefixRuleSpec[]): string {
  const blocks: string[] = [];

  for (const spec of specs) {
    for (const prefix of spec.prefixes) {
      blocks.push(
        renderCodexPrefixRule(tokenizeCodexRulePattern(prefix), spec.decision, spec.justification)
      );
    }
  }

  return `${blocks.join("\n\n")}\n`;
}

export { renderCodexRuleSet, tokenizeCodexRulePattern };
