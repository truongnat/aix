// src/constants.ts
var PHASES = ["start", "discuss", "plan", "run", "verify", "ship", "remember"];
var SKILL_KINDS = ["domain", "process", "reference"];
var PROVIDERS = ["claude", "cursor", "codex", "gemini"];
var ROLES = ["planner", "coder", "reviewer", "architect"];
var SKILL_BODY_MAX_TOKENS = 5e3;
var SKILL_NAME_MAX = 64;
var SKILL_DESC_MAX = 1024;
var SCOPE = "@x";

// src/errors.ts
var AppError = class extends Error {
  code;
  path;
  cause;
  constructor(opts) {
    super(opts.message);
    this.name = "AppError";
    this.code = opts.code;
    this.path = opts.path;
    this.cause = opts.cause;
  }
};
var ValidationError = class extends AppError {
  constructor(message, opts) {
    super({ code: "VALIDATION", message, ...opts });
    this.name = "ValidationError";
  }
};
function ok(value) {
  return { ok: true, value };
}
function fail(error) {
  return { ok: false, error };
}

// src/phase-machine.ts
var PHASE_ORDER = ["start", "discuss", "plan", "run", "verify", "ship", "remember"];
var PhaseMachine = class {
  #guards;
  constructor(guards = []) {
    this.#guards = guards;
  }
  current(state) {
    return state.phase;
  }
  async advance(state) {
    for (const guard of this.#guards) {
      const result = await guard.check(state);
      if (!result.ok) return result;
    }
    const idx = PHASE_ORDER.indexOf(state.phase);
    if (idx === -1 || idx >= PHASE_ORDER.length - 1) {
      return fail(new AppError({
        code: "PHASE",
        message: `Cannot advance from final phase "${state.phase}"`
      }));
    }
    return ok({
      ...state,
      phase: PHASE_ORDER[idx + 1]
    });
  }
  rewind(state, to, reason) {
    return {
      ...state,
      phase: to,
      evidence: [
        ...state.evidence,
        {
          phase: state.phase,
          kind: "decision",
          summary: `Rewind to "${to}": ${reason}`,
          at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]
    };
  }
  canAdvanceTo(from, to) {
    const fromIdx = PHASE_ORDER.indexOf(from);
    const toIdx = PHASE_ORDER.indexOf(to);
    return fromIdx !== -1 && toIdx !== -1 && toIdx >= fromIdx;
  }
};

// src/guards.ts
function createEvidenceGuard() {
  return {
    id: "evidence-guard",
    async check(state) {
      if (state.phase === "start") return ok(void 0);
      const phaseEvidence = state.evidence.filter((e) => e.phase === state.phase);
      if (phaseEvidence.length < 1) {
        return fail(new AppError({
          code: "GUARD",
          message: `Phase "${state.phase}" requires at least 1 evidence entry before advancing`
        }));
      }
      return ok(void 0);
    }
  };
}
function createShipNeedsVerifyGuard() {
  return {
    id: "ship-needs-verify",
    async check(state) {
      if (state.phase === "ship") {
        const verifyEvidence = state.evidence.filter((e) => e.phase === "verify");
        if (verifyEvidence.length < 1) {
          return fail(new AppError({
            code: "GUARD",
            message: 'Cannot advance to "ship" phase unless verify phase has evidence'
          }));
        }
      }
      return ok(void 0);
    }
  };
}
function createStartHasTaskGuard() {
  return {
    id: "start-has-task",
    async check(state) {
      if (state.phase === "start" && state.task.trim().length === 0) {
        return fail(new AppError({
          code: "GUARD",
          message: "Start phase requires a non-empty task string"
        }));
      }
      return ok(void 0);
    }
  };
}
function createDiscussArtifactGuard() {
  return {
    id: "discuss-artifact-guard",
    async check(state) {
      if (state.phase === "discuss") {
        const hasDiscuss = state.evidence.some(
          (e) => e.phase === "discuss" && e.kind === "artifact" && e.ref?.includes("DISCUSSION.md")
        );
        if (!hasDiscuss) {
          return fail(new AppError({
            code: "GUARD_DISCUSS_MISSING",
            message: "Missing DISCUSSION.md artifact before advancing from discuss phase"
          }));
        }
      }
      return ok(void 0);
    }
  };
}
function createPlanArtifactGuard() {
  return {
    id: "plan-artifact-guard",
    async check(state) {
      if (state.phase === "plan") {
        const hasPlan = state.evidence.some(
          (e) => e.phase === "plan" && e.kind === "artifact" && e.ref?.includes("PLAN.md")
        );
        if (!hasPlan) {
          return fail(new AppError({
            code: "GUARD_PLAN_MISSING",
            message: "Missing PLAN.md artifact before advancing from plan phase"
          }));
        }
      }
      return ok(void 0);
    }
  };
}
function createReviewArtifactGuard() {
  return {
    id: "review-artifact-guard",
    async check(state) {
      if (state.phase === "run") {
        const hasReview = state.evidence.some(
          (e) => e.phase === "run" && e.kind === "artifact" && e.ref?.includes("REVIEW.md")
        );
        if (!hasReview) {
          return fail(new AppError({
            code: "GUARD_REVIEW_MISSING",
            message: "Missing REVIEW.md artifact before advancing from run phase"
          }));
        }
      }
      return ok(void 0);
    }
  };
}
function createVerifyArtifactGuard() {
  return {
    id: "verify-artifact-guard",
    async check(state) {
      if (state.phase === "verify") {
        const hasVerify = state.evidence.some(
          (e) => e.phase === "verify" && e.kind === "artifact" && e.ref?.includes("VERIFY.md")
        );
        if (!hasVerify) {
          return fail(new AppError({
            code: "GUARD_VERIFY_MISSING",
            message: "Missing VERIFY.md artifact before advancing from verify phase"
          }));
        }
      }
      return ok(void 0);
    }
  };
}
function createRememberArtifactGuard() {
  return {
    id: "remember-artifact-guard",
    async check(state) {
      if (state.phase === "remember") {
        const hasRemember = state.evidence.some(
          (e) => e.phase === "remember" && e.kind === "artifact" && e.ref?.includes("REMEMBER.md")
        );
        if (!hasRemember) {
          return fail(new AppError({
            code: "GUARD_REMEMBER_MISSING",
            message: "Missing REMEMBER.md artifact before advancing from remember phase"
          }));
        }
      }
      return ok(void 0);
    }
  };
}
function createDefaultGuards() {
  return [
    createEvidenceGuard(),
    createShipNeedsVerifyGuard(),
    createStartHasTaskGuard(),
    createDiscussArtifactGuard(),
    createPlanArtifactGuard(),
    createReviewArtifactGuard(),
    createVerifyArtifactGuard(),
    createRememberArtifactGuard()
  ];
}

// src/budget.ts
function createBudgetTracker() {
  return {
    addUsage(state, usd, tokens, promptTokens, completionTokens) {
      const pTokens = promptTokens ?? Math.round(tokens * 0.8);
      const cTokens = completionTokens ?? tokens - pTokens;
      return {
        ...state,
        budget: {
          ...state.budget,
          usdSpent: state.budget.usdSpent + usd,
          tokensInPhase: state.budget.tokensInPhase + tokens,
          promptTokensInPhase: state.budget.promptTokensInPhase + pTokens,
          completionTokensInPhase: state.budget.completionTokensInPhase + cTokens
        }
      };
    },
    checkHardStop(state) {
      if (state.budget.usdSpent >= state.budget.usdLimit) {
        return fail(new AppError({
          code: "BUDGET",
          message: `Budget hard-stop: $${state.budget.usdSpent.toFixed(2)} spent of $${state.budget.usdLimit.toFixed(2)} limit`
        }));
      }
      if (state.budget.tokensInPhase >= state.budget.tokenContextLimit) {
        return fail(new AppError({
          code: "CONTEXT",
          message: `Context hard-stop: ${state.budget.tokensInPhase} tokens used of ${state.budget.tokenContextLimit} limit`
        }));
      }
      return ok(void 0);
    },
    checkBeforeCall(state) {
      const warnings = [];
      const budget = state.budget;
      const usdRatio = budget.usdSpent / budget.usdLimit;
      if (usdRatio >= 1) {
        warnings.push({
          code: "BUDGET_CRITICAL",
          message: `Budget exhausted: $${budget.usdSpent.toFixed(2)} of $${budget.usdLimit.toFixed(2)}. Cannot continue without reset.`,
          recoverable: false
        });
      } else if (usdRatio >= budget.usdWarnThreshold) {
        warnings.push({
          code: "BUDGET_HIGH",
          message: `Budget near limit: $${budget.usdSpent.toFixed(2)} of $${budget.usdLimit.toFixed(2)} (${(usdRatio * 100).toFixed(0)}%). Consider confirming before proceeding.`,
          recoverable: true
        });
      }
      const ctxRatio = budget.tokensInPhase / budget.tokenContextLimit;
      if (ctxRatio >= 1) {
        warnings.push({
          code: "CONTEXT_CRITICAL",
          message: `Context full: ${budget.tokensInPhase} of ${budget.tokenContextLimit} tokens. Must compact or clear before continuing.`,
          recoverable: false
        });
      } else if (ctxRatio >= 0.8) {
        warnings.push({
          code: "CONTEXT_HIGH",
          message: `Context nearly full: ${budget.tokensInPhase} of ${budget.tokenContextLimit} tokens (${(ctxRatio * 100).toFixed(0)}%). Consider compacting.`,
          recoverable: true
        });
      }
      if (warnings.length > 0) {
        return { ok: false, warnings };
      }
      return { ok: true };
    },
    shouldCompact(state) {
      const ratio = state.budget.tokensInPhase / state.budget.tokenContextLimit;
      return ratio >= 0.8;
    }
  };
}
function createDefaultBudgetState(usdLimit = 10) {
  return {
    usdSpent: 0,
    usdLimit,
    tokensInPhase: 0,
    promptTokensInPhase: 0,
    completionTokensInPhase: 0,
    tokenWarnThreshold: 64e3,
    tokenContextLimit: 2e5,
    usdWarnThreshold: 0.8
  };
}

// src/guardrail-loop.ts
var GuardrailLoop = class {
  #machine;
  constructor() {
    this.#machine = new PhaseMachine(createDefaultGuards());
  }
  async createSession(task) {
    return {
      id: crypto.randomUUID(),
      task,
      mode: "guardrail",
      phase: "start",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      evidence: [],
      budget: createDefaultBudgetState()
    };
  }
  async advancePhase(state) {
    const result = await this.#machine.advance(state);
    if (!result.ok) {
      throw result.error;
    }
    return result.value;
  }
  rewindTo(state, to, reason) {
    return this.#machine.rewind(state, to, reason);
  }
  addEvidence(state, entry) {
    return {
      ...state,
      evidence: [
        ...state.evidence,
        { ...entry, at: (/* @__PURE__ */ new Date()).toISOString() }
      ]
    };
  }
  canAdvanceTo(from, to) {
    return this.#machine.canAdvanceTo(from, to);
  }
};
export {
  AppError as AppErrorClass,
  GuardrailLoop,
  PHASES,
  PROVIDERS,
  PhaseMachine,
  ROLES,
  SCOPE,
  SKILL_BODY_MAX_TOKENS,
  SKILL_DESC_MAX,
  SKILL_KINDS,
  SKILL_NAME_MAX,
  ValidationError,
  createBudgetTracker,
  createDefaultBudgetState,
  createDefaultGuards,
  fail,
  ok
};
//# sourceMappingURL=index.js.map