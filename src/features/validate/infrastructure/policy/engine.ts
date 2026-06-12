/**
 * Policy Engine for Deterministic Enforcement
 *
 * Evaluates policy rules against execution context to determine if actions should be allowed, blocked, or warned.
 */

import * as fs from "node:fs";
import {
  PolicySet,
  PolicyRule,
  PolicyCondition,
  PolicyAction,
  ExecutionContext,
  PolicyOperator,
} from "./schema";

const MAX_REGEX_CACHE_SIZE = 1000;
const MAX_REGEX_PATTERN_LENGTH = 1000;

export class PolicyEngine {
  private static readonly regexCache = new Map<string, RegExp>();
  private policySet: PolicySet | null = null;
  private policyPath: string;

  constructor(policyPath: string = ".harness/policies.json") {
    this.policyPath = policyPath;
  }

  /**
   * Convert a glob pattern (supporting ** , * and ?) into an anchored RegExp.
   * Escapes regex metacharacters first, then translates glob tokens via
   * placeholders so already-inserted regex fragments are not re-processed.
   */
  static globToRegExp(pattern: string): RegExp {
    const DOUBLE = "\u0000";
    const SINGLE = "\u0001";
    const QUESTION = "\u0002";

    let out = pattern.replace(/\*\*/g, DOUBLE).replace(/\*/g, SINGLE).replace(/\?/g, QUESTION);

    // Escape remaining regex metacharacters in literal segments.
    out = out.replace(/[.+^${}()|[\]\\]/g, "\\$&");

    // Restore glob tokens as regex fragments.
    out = out.split(DOUBLE).join(".*").split(SINGLE).join("[^/]*").split(QUESTION).join(".");

    return new RegExp(`^${out}$`);
  }

  private static compileRegex(pattern: string, context: string): RegExp {
    if (pattern.length > MAX_REGEX_PATTERN_LENGTH) {
      throw new Error(
        `Regex pattern too long for ${context}: ${pattern.length} chars (max ${MAX_REGEX_PATTERN_LENGTH})`
      );
    }

    const cached = PolicyEngine.regexCache.get(pattern);
    if (cached) {
      return cached;
    }

    try {
      const compiled = new RegExp(pattern);
      if (PolicyEngine.regexCache.size >= MAX_REGEX_CACHE_SIZE) {
        const firstKey = PolicyEngine.regexCache.keys().next().value as string;
        PolicyEngine.regexCache.delete(firstKey);
      }
      PolicyEngine.regexCache.set(pattern, compiled);
      return compiled;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid regex for ${context}: ${pattern} (${message})`);
    }
  }

  private validateCondition(rule: PolicyRule, condition: PolicyCondition): void {
    const value = condition.value;
    const context = `rule ${rule.id} ${condition.type} condition`;

    if (condition.operator !== "matches") {
      if (condition.type === "state" && condition.operator === "equals") {
        const { key, expectedValue } = this.parseStateValue(value, rule.id, "equals");
        if (!key) {
          throw new Error(`Invalid state matcher for rule ${rule.id}: missing state key`);
        }
        if (expectedValue.length === 0) {
          throw new Error(`Invalid state matcher for rule ${rule.id}: missing state value`);
        }
      }
      return;
    }

    if (condition.type === "state") {
      const { key, expectedValue: pattern } = this.parseStateValue(value, rule.id, "matches");
      PolicyEngine.compileRegex(pattern, context);
      return;
    }

    if (condition.type === "command" || condition.type === "phase") {
      PolicyEngine.compileRegex(value, context);
    }
  }

  private parseStateValue(
    value: string,
    ruleId: string,
    operator: "equals" | "matches"
  ): { key: string; expectedValue: string } {
    const separator = value.indexOf(":");
    if (separator < 0) {
      throw new Error(`Invalid state matcher for rule ${ruleId}: missing state key`);
    }

    const key = value.slice(0, separator);
    const expectedValue = value.slice(separator + 1);

    if (!key) {
      throw new Error(`Invalid state matcher for rule ${ruleId}: missing state key`);
    }
    if (!expectedValue) {
      throw new Error(
        `Invalid state matcher for rule ${ruleId}: missing ${operator === "matches" ? "regex pattern" : "state value"}`
      );
    }

    return { key, expectedValue };
  }

  private validatePolicySet(policySet: PolicySet): void {
    for (const rule of policySet.rules) {
      for (const condition of rule.conditions) {
        this.validateCondition(rule, condition);
      }
    }
  }

  /**
   * Load policy set from JSON file
   */
  loadPolicySet(customPath?: string): PolicySet {
    const pathToLoad = customPath || this.policyPath;
    if (!fs.existsSync(pathToLoad)) {
      throw new Error(`Policy file not found: ${pathToLoad}`);
    }

    const content = fs.readFileSync(pathToLoad, "utf8");
    let policySet: PolicySet;
    try {
      policySet = JSON.parse(content) as PolicySet;
    } catch {
      throw new Error(`Failed to parse policy file as JSON: ${pathToLoad}`);
    }
    this.validatePolicySet(policySet);
    this.policySet = policySet;
    return this.policySet;
  }

  /**
   * Get the currently loaded policy set, lazily loading from disk if needed
   */
  getPolicySet(): PolicySet {
    if (!this.policySet) {
      this.loadPolicySet();
    }
    return this.policySet as PolicySet;
  }

  /**
   * Evaluate a single condition against the execution context
   */
  private evaluateCondition(condition: PolicyCondition, context: ExecutionContext): boolean {
    const { type, operator, value } = condition;

    switch (type) {
      case "command":
        return this.evaluateCommandCondition(operator, value as string, context.command);

      case "state":
        return this.evaluateStateCondition(operator, value as string, context.state || {});

      case "file_pattern":
        return this.evaluateFilePatternCondition(operator, value as string, context.files || []);

      case "phase":
        return this.evaluatePhaseCondition(operator, value as string, context.currentPhase);

      default:
        throw new Error(`Unknown condition type: ${type}`);
    }
  }

  /**
   * Evaluate command condition
   */
  private evaluateCommandCondition(
    operator: PolicyOperator,
    value: string,
    command: string
  ): boolean {
    switch (operator) {
      case "equals":
        return command === value;
      case "matches":
        return PolicyEngine.compileRegex(value, "command matcher").test(command);
      case "exists":
        return command !== "";
      case "not_exists":
        return command === "";
      default:
        throw new Error(`Unknown operator for command: ${operator}`);
    }
  }

  /**
   * Evaluate state condition
   */
  private evaluateStateCondition(
    operator: PolicyOperator,
    value: string,
    state: Record<string, any>
  ): boolean {
    switch (operator) {
      case "equals": {
        const { key, expectedValue } = this.parseStateValue(value, "runtime", "equals");
        const actualValue = state[key];
        return actualValue === expectedValue;
      }
      case "exists":
        return state[value] !== undefined && state[value] !== null;
      case "not_exists":
        return state[value] === undefined || state[value] === null;
      case "matches": {
        const { key, expectedValue } = this.parseStateValue(value, "runtime", "matches");
        const actualValue = state[key];
        return PolicyEngine.compileRegex(expectedValue, "state matcher").test(String(actualValue));
      }
      default:
        throw new Error(`Unknown operator for state: ${operator}`);
    }
  }

  /**
   * Evaluate file pattern condition
   */
  private evaluateFilePatternCondition(
    operator: PolicyOperator,
    pattern: string,
    files: string[]
  ): boolean {
    const regex = PolicyEngine.globToRegExp(pattern);
    const matchingFiles = files.filter((file) => regex.test(file));

    switch (operator) {
      case "exists":
        return matchingFiles.length > 0;
      case "not_exists":
        return matchingFiles.length === 0;
      case "matches":
        return files.some((file) => regex.test(file));
      case "equals":
        return files.length === 1 && regex.test(files[0]);
      default:
        throw new Error(`Unknown operator for file_pattern: ${operator}`);
    }
  }

  /**
   * Evaluate phase condition
   */
  private evaluatePhaseCondition(
    operator: PolicyOperator,
    value: string,
    currentPhase?: string
  ): boolean {
    if (!currentPhase) {
      return operator === "not_exists" || (operator === "equals" && value === "");
    }

    switch (operator) {
      case "equals":
        return currentPhase === value;
      case "matches":
        return PolicyEngine.compileRegex(value, "phase matcher").test(currentPhase);
      case "exists":
        return currentPhase !== "";
      case "not_exists":
        return currentPhase === "";
      default:
        throw new Error(`Unknown operator for phase: ${operator}`);
    }
  }

  /**
   * Evaluate a single policy rule against the execution context
   */
  evaluate(rule: PolicyRule, context: ExecutionContext): PolicyAction {
    const conditionLogic = rule.conditionLogic || "and";
    const conditionsMet =
      conditionLogic === "or"
        ? rule.conditions.some((condition) => this.evaluateCondition(condition, context))
        : rule.conditions.every((condition) => this.evaluateCondition(condition, context));

    if (conditionsMet) {
      return rule.action;
    }

    // If conditions not met, allow by default
    return { type: "allow", message: "" };
  }

  /**
   * Check all policies and return actions for triggered rules
   */
  checkAll(context: ExecutionContext): PolicyAction[] {
    const policySet = this.getPolicySet();
    const triggeredActions: PolicyAction[] = [];

    for (const rule of policySet.rules) {
      const action = this.evaluate(rule, context);
      if (action.type !== "allow") {
        triggeredActions.push(action);
      }
    }

    return triggeredActions;
  }

  /**
   * Check if execution should be blocked based on policies
   */
  shouldBlock(context: ExecutionContext): {
    blocked: boolean;
    reason: string;
    actions: PolicyAction[];
  } {
    const actions = this.checkAll(context);
    const blockingActions = actions.filter((a) => a.type === "block");

    if (blockingActions.length > 0) {
      return {
        blocked: true,
        reason: blockingActions.map((a) => a.message).join("; "),
        actions: blockingActions,
      };
    }

    return {
      blocked: false,
      reason: "",
      actions,
    };
  }
}
