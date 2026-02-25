use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Routing policy for cross-domain planning.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RoutingPolicy {
    pub allowed_domains: Option<HashSet<String>>,
    pub preferred_domains: Vec<String>,
    #[serde(default)]
    pub domain_overhead_cost: HashMap<String, u32>,
    #[serde(default)]
    pub cross_domain_penalty: u32,
}

impl RoutingPolicy {
    pub fn for_single_domain(domain: &str) -> Self {
        let mut allowed = HashSet::new();
        allowed.insert(domain.to_string());
        Self {
            allowed_domains: Some(allowed),
            preferred_domains: vec![domain.to_string()],
            domain_overhead_cost: HashMap::new(),
            cross_domain_penalty: 0,
        }
    }

    pub fn allows_domain(&self, domain: &str) -> bool {
        self.allowed_domains
            .as_ref()
            .map(|set| set.contains(domain))
            .unwrap_or(true)
    }

    pub fn preferred_rank(&self, domain: &str) -> usize {
        self.preferred_domains
            .iter()
            .position(|d| d == domain)
            .unwrap_or(usize::MAX)
    }

    pub fn domain_overhead(&self, domain: &str) -> u32 {
        self.domain_overhead_cost.get(domain).copied().unwrap_or(0)
    }
}
