/**
 * Policy Engine for Deterministic Enforcement
 *
 * Evaluates policy rules against execution context to determine if actions should be allowed, blocked, or warned.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  PolicySet,
  PolicyRule,
  PolicyCondition,
  PolicyAction,
  ExecutionContext,
  PolicyOperator,
} from "./schema";

export class PolicyEngine {
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

  /**
   * Load policy set from JSON file
   */
  loadPolicySet(customPath?: string): PolicySet {
    const pathToLoad = customPath || this.policyPath;
    if (!fs.existsSync(pathToLoad)) {
      throw new Error(`Policy file not found: ${pathToLoad}`);
    }

    const content = fs.readFileSync(pathToLoad, "utf8");
    this.policySet = JSON.parse(content) as PolicySet;
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
        return new RegExp(value).test(command);
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
    const [key, expectedValue] = value.split(":");
    const actualValue = state[key];

    switch (operator) {
      case "equals":
        return actualValue === expectedValue;
      case "exists":
        return actualValue !== undefined && actualValue !== null;
      case "not_exists":
        return actualValue === undefined || actualValue === null;
      case "matches":
        return expectedValue ? new RegExp(expectedValue).test(String(actualValue)) : false;
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
        return new RegExp(value).test(currentPhase);
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
    // All conditions must be satisfied for the rule to trigger
    const conditionsMet = rule.conditions.every((condition) =>
      this.evaluateCondition(condition, context)
    );

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
