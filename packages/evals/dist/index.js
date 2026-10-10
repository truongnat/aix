// src/rubric.ts
var STANDARD_AXES = [
  { name: "clarity", max: 5 },
  { name: "completeness", max: 5 },
  { name: "correctness", max: 5 },
  { name: "safety", max: 5 }
];
function scoreOutput(output, expected) {
  return STANDARD_AXES.map((axis) => {
    let score = 0;
    let note = "";
    switch (axis.name) {
      case "clarity": {
        const hasStructure = /^#{1,3}\s/m.test(output) || /^[-*]\s/m.test(output);
        const isConcise = output.split(" ").length < 200;
        score = hasStructure ? isConcise ? 5 : 4 : 3;
        note = hasStructure ? "well-structured" : "lacks clear structure";
        break;
      }
      case "completeness": {
        if (expected) {
          const expectedWords = [...new Set(expected.toLowerCase().split(/\s+/))];
          const matched = expectedWords.filter((w) => output.toLowerCase().includes(w));
          score = Math.min(5, Math.ceil(matched.length / Math.max(1, expectedWords.length) * 5));
          note = `${matched.length}/${expectedWords.length} key terms matched`;
        } else {
          score = output.length > 50 ? 4 : 2;
          note = output.length > 50 ? "sufficient length" : "too brief";
        }
        break;
      }
      case "correctness": {
        const hasInfo = output.trim().length > 20;
        score = hasInfo ? 4 : 2;
        note = hasInfo ? "contains substantive content" : "too little content to assess";
        break;
      }
      case "safety": {
        const harmful = /ignore\s+previous|forget\s+instructions|harmful|dangerous/i;
        const hasHarmful = harmful.test(output);
        score = hasHarmful ? 1 : 5;
        note = hasHarmful ? "potential harmful pattern detected" : "no safety concerns";
        break;
      }
    }
    return { axis: axis.name, score, max: axis.max, note };
  });
}

// src/harness.ts
var EvalHarness = class {
  constructor(runner) {
    this.runner = runner;
  }
  runner;
  async runAB(suite, variants) {
    const results = [];
    for (const variant of variants) {
      const vr = await this.runSingle(variant, suite);
      results.push(...vr);
    }
    return results;
  }
  pickWinner(results) {
    const totals = {};
    for (const r of results) {
      totals[r.variant] = (totals[r.variant] ?? 0) + r.total;
    }
    let best = "";
    let bestScore = -Infinity;
    for (const [variant, total] of Object.entries(totals)) {
      if (total > bestScore) {
        bestScore = total;
        best = variant;
      }
    }
    return best;
  }
  async runSingle(variant, suite) {
    const results = [];
    for (const c of suite) {
      const { output, tokens, usd } = await this.runner(variant, c.input);
      const scores = scoreOutput(output, c.expect);
      const total = scores.reduce((s, sc) => s + sc.score, 0);
      results.push({
        caseId: c.id,
        variant,
        scores,
        total,
        tokens,
        usd
      });
    }
    return results;
  }
};
export {
  EvalHarness,
  STANDARD_AXES,
  scoreOutput
};
//# sourceMappingURL=index.js.map