/**
 * Policy Schema for Deterministic Enforcement Engine
 *
 * Defines the structure for policy-as-code rules that govern agent behavior.
 * Policies are evaluated by the Policy Engine to determine if actions should be allowed, blocked, or warned.
 */

export type PolicyConditionType = "phase" | "file_pattern" | "command" | "state";
export type PolicyOperator = "equals" | "matches" | "exists" | "not_exists";
export type PolicyActionType = "allow" | "block" | "warn";
export type PolicySeverity = "error" | "warning";

export interface PolicyCondition {
  type: PolicyConditionType;
  operator: PolicyOperator;
  value: string;
}

export interface PolicyAction {
  type: PolicyActionType;
  message: string;
  nextCommand?: string;
  questions?: string[];
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  severity: PolicySeverity;
  conditions: PolicyCondition[];
  conditionLogic?: "and" | "or";
  action: PolicyAction;
}

export interface PolicySet {
  version: string;
  rules: PolicyRule[];
}

export interface ExecutionContext {
  command: string;
  sessionDir: string;
  repoRoot: string;
  files?: string[];
  state?: Record<string, any>;
  currentPhase?: string;
}
