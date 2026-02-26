use std::collections::{HashMap, HashSet};

use super::*;

fn parse_csv_list(value: Option<&str>) -> Vec<String> {
    value
        .unwrap_or_default()
        .split(',')
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
        .collect()
}

fn parse_domain_overhead_map(value: Option<&str>) -> Result<HashMap<String, u32>> {
    let mut map = HashMap::new();
    for item in parse_csv_list(value) {
        let (domain, cost_str) = item
            .split_once(':')
            .ok_or_else(|| anyhow!("Invalid --domain-overhead entry '{}'", item))?;
        let cost = cost_str
            .trim()
            .parse::<u32>()
            .map_err(|_| anyhow!("Invalid overhead cost in '{}'", item))?;
        map.insert(domain.trim().to_string(), cost);
    }
    Ok(map)
}

pub(super) fn build_routing_policy(
    default_domain: &str,
    allow_domain: Option<&str>,
    prefer_domain: Option<&str>,
    cross_domain_penalty: u32,
    domain_overhead: Option<&str>,
) -> Result<RoutingPolicy> {
    let mut policy = RoutingPolicy::default();
    let normalized_default = default_domain.trim();
    if !normalized_default.is_empty() {
        policy.preferred_domains = vec![normalized_default.to_string()];
    }

    let allowed = parse_csv_list(allow_domain);
    if !allowed.is_empty() {
        policy.allowed_domains = Some(allowed.into_iter().collect::<HashSet<_>>());
    }

    let preferred = parse_csv_list(prefer_domain);
    if !preferred.is_empty() {
        policy.preferred_domains = preferred;
    }

    policy.cross_domain_penalty = cross_domain_penalty;
    policy.domain_overhead_cost = parse_domain_overhead_map(domain_overhead)?;
    Ok(policy)
}

pub(super) fn build_security_policy(
    disable_network: bool,
    read_only: bool,
    strict_mode: bool,
    external_mutation_penalty: u32,
    step_timeout_ms: u64,
    max_trust_tier: TrustTier,
) -> DomainSecurityPolicy {
    let mut has_override = false;
    let mut override_permissions = CapabilityPermissions::all();

    if disable_network {
        has_override = true;
        override_permissions.allow_network = false;
    }

    if read_only {
        has_override = true;
        override_permissions.allow_fs_write = false;
    }

    DomainSecurityPolicy {
        override_permissions: if has_override {
            Some(override_permissions)
        } else {
            None
        },
        strict_mode,
        max_trust_tier,
        external_mutation_penalty,
        step_timeout_ms,
    }
}

pub(super) fn parse_trust_tier(value: &str) -> Result<TrustTier> {
    match value.trim() {
        "Trusted" => Ok(TrustTier::Trusted),
        "Constrained" => Ok(TrustTier::Constrained),
        "Untrusted" => Ok(TrustTier::Untrusted),
        other => Err(anyhow!(
            "Invalid --max-trust-tier value '{}'. Expected Trusted|Constrained|Untrusted",
            other
        )),
    }
}

pub(super) fn configure_run_script_policy_env(
    project_rules: &crate::engine::project::ProjectRuntimeRules,
    security_policy: &DomainSecurityPolicy,
) {
    let timeout_ms = project_rules
        .run_script_timeout_ms
        .unwrap_or(security_policy.step_timeout_ms)
        .min(security_policy.step_timeout_ms);
    std::env::set_var("ANTIGRAV_RUN_SCRIPT_TIMEOUT_MS", timeout_ms.to_string());

    let allowlist = project_rules
        .run_script_allowed_commands
        .clone()
        .unwrap_or_else(|| {
            vec![
                "cargo".to_string(),
                "git".to_string(),
                "npm".to_string(),
                "pnpm".to_string(),
                "yarn".to_string(),
                "make".to_string(),
                "just".to_string(),
                "go".to_string(),
                "pytest".to_string(),
                "flutter".to_string(),
                "dart".to_string(),
            ]
        });
    let normalized = allowlist
        .into_iter()
        .map(|s| s.trim().to_ascii_lowercase())
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join(",");
    std::env::set_var("ANTIGRAV_RUN_SCRIPT_ALLOWLIST", normalized);

    let denylist = project_rules
        .run_script_denied_commands
        .clone()
        .unwrap_or_else(|| {
            vec![
                "sudo".to_string(),
                "dd".to_string(),
                "mkfs".to_string(),
                "shutdown".to_string(),
                "reboot".to_string(),
                "poweroff".to_string(),
                "launchctl".to_string(),
            ]
        });
    let deny_normalized = denylist
        .into_iter()
        .map(|s| s.trim().to_ascii_lowercase())
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join(",");
    std::env::set_var("ANTIGRAV_RUN_SCRIPT_DENYLIST", deny_normalized);

    let allow_shell_operators = project_rules
        .run_script_allow_shell_operators
        .unwrap_or(false);
    std::env::set_var(
        "ANTIGRAV_RUN_SCRIPT_ALLOW_SHELL_OPERATORS",
        if allow_shell_operators { "1" } else { "0" },
    );
}
