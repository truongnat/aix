// Negotiation Protocol - structured multi-agent disagreement resolution

use crate::platform::types::{current_timestamp_ms, AgentId};
use crate::platform::{PlatformError, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Negotiation protocol for multi-agent coordination
pub struct NegotiationProtocol {
    sessions: HashMap<String, NegotiationSession>,
    history: Vec<NegotiationSession>,
}

impl NegotiationProtocol {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
            history: Vec::new(),
        }
    }

    /// Initiate a new negotiation session
    pub fn initiate_negotiation(&mut self, topic: NegotiationTopic) -> Result<NegotiationSession> {
        // Validate topic
        if topic.subject.is_empty() {
            return Err(PlatformError::NegotiationError(
                "Negotiation subject cannot be empty".to_string(),
            ));
        }

        if topic.participants.is_empty() {
            return Err(PlatformError::NegotiationError(
                "Negotiation must have at least one participant".to_string(),
            ));
        }

        if topic.deadline_ms <= current_timestamp_ms() {
            return Err(PlatformError::NegotiationError(
                "Negotiation deadline must be in the future".to_string(),
            ));
        }

        let session_id = format!("neg_{}", uuid::Uuid::new_v4());
        let session = NegotiationSession {
            session_id: session_id.clone(),
            topic,
            positions: HashMap::new(),
            status: NegotiationStatus::Active,
            resolution: None,
            created_at: current_timestamp_ms(),
        };

        self.sessions.insert(session_id.clone(), session.clone());
        Ok(session)
    }

    /// Submit a position from an agent
    pub fn submit_position(
        &mut self,
        session_id: &str,
        agent_id: &str,
        position: Position,
    ) -> Result<()> {
        let session = self.sessions.get_mut(session_id).ok_or_else(|| {
            PlatformError::NotFound(format!("Negotiation session not found: {}", session_id))
        })?;

        // Check if session is still active
        if session.status != NegotiationStatus::Active {
            return Err(PlatformError::NegotiationError(format!(
                "Cannot submit position to {} session",
                session.status
            )));
        }

        // Check if agent is a participant
        if !session.topic.participants.contains(&agent_id.to_string()) {
            return Err(PlatformError::NegotiationError(format!(
                "Agent {} is not a participant in this negotiation",
                agent_id
            )));
        }

        // Check if deadline has passed
        if current_timestamp_ms() > session.topic.deadline_ms {
            session.status = NegotiationStatus::TimedOut;
            return Err(PlatformError::NegotiationError(
                "Negotiation deadline has passed".to_string(),
            ));
        }

        // Validate position
        if position.agent_id != agent_id {
            return Err(PlatformError::NegotiationError(
                "Position agent_id must match submitting agent".to_string(),
            ));
        }

        session.positions.insert(agent_id.to_string(), position);
        Ok(())
    }

    /// Resolve the negotiation using configured algorithm
    pub fn resolve(&mut self, session_id: &str) -> Result<Resolution> {
        // First, get session data without holding mutable borrow
        let (timed_out, all_submitted, positions_len, session_clone) = {
            let session = self.sessions.get(session_id).ok_or_else(|| {
                PlatformError::NotFound(format!("Negotiation session not found: {}", session_id))
            })?;

            // Check if session is still active
            if session.status != NegotiationStatus::Active {
                return Err(PlatformError::NegotiationError(format!(
                    "Cannot resolve {} session",
                    session.status
                )));
            }

            let timed_out = current_timestamp_ms() > session.topic.deadline_ms;
            let all_submitted = session
                .topic
                .participants
                .iter()
                .all(|p| session.positions.contains_key(p));
            let positions_len = session.positions.len();

            (timed_out, all_submitted, positions_len, session.clone())
        };

        if !all_submitted && !timed_out {
            return Err(PlatformError::NegotiationError(
                "Not all participants have submitted positions and deadline has not passed"
                    .to_string(),
            ));
        }

        // Apply resolution algorithm
        let resolution = if timed_out && positions_len == 0 {
            // No positions submitted - escalate
            Self::resolve_by_escalation_static(&session_clone)?
        } else if positions_len == 1 {
            // Single position - accept it
            let position = session_clone.positions.values().next().unwrap();
            Resolution {
                outcome: ResolutionOutcome::Accepted,
                consensus_level: 1.0,
                final_decision: format!("{:?}", position.stance),
                dissenting_opinions: Vec::new(),
                resolved_at: current_timestamp_ms(),
            }
        } else {
            // Multiple positions - try consensus, then voting, then escalation
            Self::resolve_by_consensus_static(&session_clone)
                .or_else(|_| Self::resolve_by_voting_static(&session_clone))
                .or_else(|_| Self::resolve_by_escalation_static(&session_clone))?
        };

        // Now update the session
        let session = self.sessions.get_mut(session_id).unwrap();
        session.resolution = Some(resolution.clone());
        session.status = NegotiationStatus::Resolved;

        // Move to history
        self.history.push(session.clone());

        Ok(resolution)
    }

    /// Get negotiation history
    pub fn get_history(&self) -> &[NegotiationSession] {
        &self.history
    }

    /// Get active session
    pub fn get_session(&self, session_id: &str) -> Option<&NegotiationSession> {
        self.sessions.get(session_id)
    }

    // Resolution algorithms

    fn resolve_by_consensus_static(session: &NegotiationSession) -> Result<Resolution> {
        let positions: Vec<&Position> = session.positions.values().collect();

        // Check if all positions are Approve
        let all_approve = positions
            .iter()
            .all(|p| matches!(p.stance, Stance::Approve));

        if all_approve {
            return Ok(Resolution {
                outcome: ResolutionOutcome::Consensus,
                consensus_level: 1.0,
                final_decision: "Approved by consensus".to_string(),
                dissenting_opinions: Vec::new(),
                resolved_at: current_timestamp_ms(),
            });
        }

        // Check if all positions are Conditional with compatible conditions
        let all_conditional = positions
            .iter()
            .all(|p| matches!(p.stance, Stance::Conditional { .. }));

        if all_conditional {
            // Collect all conditions
            let mut all_conditions = Vec::new();
            for pos in &positions {
                if let Stance::Conditional { ref conditions } = pos.stance {
                    all_conditions.extend(conditions.clone());
                }
            }

            let consensus_level = Self::calculate_consensus_level_static(&positions);

            return Ok(Resolution {
                outcome: ResolutionOutcome::Consensus,
                consensus_level,
                final_decision: format!(
                    "Conditional approval with {} conditions",
                    all_conditions.len()
                ),
                dissenting_opinions: Vec::new(),
                resolved_at: current_timestamp_ms(),
            });
        }

        // No consensus
        Err(PlatformError::NegotiationError(
            "No consensus reached".to_string(),
        ))
    }

    fn resolve_by_voting_static(session: &NegotiationSession) -> Result<Resolution> {
        let positions: Vec<&Position> = session.positions.values().collect();

        // Count votes
        let mut approve_count = 0;
        let mut reject_count = 0;
        let mut conditional_count = 0;
        let mut _abstain_count = 0;

        for pos in &positions {
            match pos.stance {
                Stance::Approve => approve_count += 1,
                Stance::Reject { .. } => reject_count += 1,
                Stance::Conditional { .. } => conditional_count += 1,
                Stance::Abstain => _abstain_count += 1,
            }
        }

        let total_votes = approve_count + reject_count + conditional_count;

        if total_votes == 0 {
            return Err(PlatformError::NegotiationError(
                "No valid votes".to_string(),
            ));
        }

        // Majority wins (conditional counts as approve)
        let approve_total = approve_count + conditional_count;

        let dissenting = positions
            .iter()
            .filter(|p| matches!(p.stance, Stance::Reject { .. }))
            .map(|p| (*p).clone())
            .collect();

        if approve_total > reject_count {
            Ok(Resolution {
                outcome: ResolutionOutcome::MajorityVote,
                consensus_level: approve_total as f64 / total_votes as f64,
                final_decision: format!(
                    "Approved by majority vote ({}/{})",
                    approve_total, total_votes
                ),
                dissenting_opinions: dissenting,
                resolved_at: current_timestamp_ms(),
            })
        } else if reject_count > approve_total {
            Ok(Resolution {
                outcome: ResolutionOutcome::MajorityVote,
                consensus_level: reject_count as f64 / total_votes as f64,
                final_decision: format!(
                    "Rejected by majority vote ({}/{})",
                    reject_count, total_votes
                ),
                dissenting_opinions: dissenting,
                resolved_at: current_timestamp_ms(),
            })
        } else {
            // Tie - escalate
            Err(PlatformError::NegotiationError("Vote tied".to_string()))
        }
    }

    fn resolve_by_escalation_static(session: &NegotiationSession) -> Result<Resolution> {
        Ok(Resolution {
            outcome: ResolutionOutcome::Escalated,
            consensus_level: 0.0,
            final_decision: format!("Escalated to human review: {}", session.topic.subject),
            dissenting_opinions: session.positions.values().cloned().collect(),
            resolved_at: current_timestamp_ms(),
        })
    }

    fn calculate_consensus_level_static(positions: &[&Position]) -> f64 {
        if positions.is_empty() {
            return 0.0;
        }

        // Calculate based on stance alignment
        let approve_count = positions
            .iter()
            .filter(|p| matches!(p.stance, Stance::Approve))
            .count();

        let conditional_count = positions
            .iter()
            .filter(|p| matches!(p.stance, Stance::Conditional { .. }))
            .count();

        let aligned = approve_count + conditional_count;

        // Consensus level is percentage of aligned positions
        aligned as f64 / positions.len() as f64
    }
}

impl Default for NegotiationProtocol {
    fn default() -> Self {
        Self::new()
    }
}

// Data models

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NegotiationSession {
    pub session_id: String,
    pub topic: NegotiationTopic,
    pub positions: HashMap<AgentId, Position>,
    pub status: NegotiationStatus,
    pub resolution: Option<Resolution>,
    pub created_at: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum NegotiationStatus {
    Active,
    Resolved,
    TimedOut,
}

impl std::fmt::Display for NegotiationStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            NegotiationStatus::Active => write!(f, "active"),
            NegotiationStatus::Resolved => write!(f, "resolved"),
            NegotiationStatus::TimedOut => write!(f, "timed out"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NegotiationTopic {
    pub topic_id: String,
    pub subject: String,
    pub participants: Vec<AgentId>,
    pub deadline_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub agent_id: AgentId,
    pub stance: Stance,
    pub arguments: Vec<Argument>,
    pub evidence: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Stance {
    Approve,
    Reject { reason: String },
    Conditional { conditions: Vec<String> },
    Abstain,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Argument {
    pub text: String,
    pub weight: f64,
}

impl Argument {
    pub fn new(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            weight: 1.0,
        }
    }

    pub fn with_weight(text: impl Into<String>, weight: f64) -> Self {
        Self {
            text: text.into(),
            weight,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Resolution {
    pub outcome: ResolutionOutcome,
    pub consensus_level: f64,
    pub final_decision: String,
    pub dissenting_opinions: Vec<Position>,
    pub resolved_at: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResolutionOutcome {
    Consensus,
    MajorityVote,
    Accepted,
    Escalated,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_topic(participants: Vec<&str>) -> NegotiationTopic {
        NegotiationTopic {
            topic_id: "test_topic".to_string(),
            subject: "Test negotiation".to_string(),
            participants: participants.iter().map(|s| s.to_string()).collect(),
            deadline_ms: current_timestamp_ms() + 3_600_000, // 1 hour from now
        }
    }

    #[test]
    fn test_session_initiation() {
        let mut protocol = NegotiationProtocol::new();
        let topic = create_test_topic(vec!["agent1", "agent2"]);

        let session = protocol.initiate_negotiation(topic).unwrap();

        assert_eq!(session.status, NegotiationStatus::Active);
        assert_eq!(session.topic.participants.len(), 2);
        assert!(session.positions.is_empty());
        assert!(session.resolution.is_none());
    }

    #[test]
    fn test_session_initiation_validation() {
        let mut protocol = NegotiationProtocol::new();

        // Empty subject
        let mut topic = create_test_topic(vec!["agent1"]);
        topic.subject = "".to_string();
        assert!(protocol.initiate_negotiation(topic).is_err());

        // No participants
        let mut topic = create_test_topic(vec![]);
        topic.subject = "Valid subject".to_string();
        assert!(protocol.initiate_negotiation(topic).is_err());

        // Past deadline
        let mut topic = create_test_topic(vec!["agent1"]);
        topic.deadline_ms = current_timestamp_ms() - 1000;
        assert!(protocol.initiate_negotiation(topic).is_err());
    }

    #[test]
    fn test_position_submission() {
        let mut protocol = NegotiationProtocol::new();
        let topic = create_test_topic(vec!["agent1", "agent2"]);
        let session = protocol.initiate_negotiation(topic).unwrap();

        let position = Position {
            agent_id: "agent1".to_string(),
            stance: Stance::Approve,
            arguments: vec![Argument::new("Good idea")],
            evidence: vec![],
        };

        let result = protocol.submit_position(&session.session_id, "agent1", position);
        assert!(result.is_ok());

        let updated_session = protocol.get_session(&session.session_id).unwrap();
        assert_eq!(updated_session.positions.len(), 1);
    }

    #[test]
    fn test_position_submission_validation() {
        let mut protocol = NegotiationProtocol::new();
        let topic = create_test_topic(vec!["agent1"]);
        let session = protocol.initiate_negotiation(topic).unwrap();

        // Non-participant tries to submit
        let position = Position {
            agent_id: "agent2".to_string(),
            stance: Stance::Approve,
            arguments: vec![],
            evidence: vec![],
        };

        let result = protocol.submit_position(&session.session_id, "agent2", position);
        assert!(result.is_err());

        // Agent ID mismatch
        let position = Position {
            agent_id: "agent2".to_string(),
            stance: Stance::Approve,
            arguments: vec![],
            evidence: vec![],
        };

        let result = protocol.submit_position(&session.session_id, "agent1", position);
        assert!(result.is_err());
    }

    #[test]
    fn test_consensus_resolution() {
        let mut protocol = NegotiationProtocol::new();
        let topic = create_test_topic(vec!["agent1", "agent2"]);
        let session = protocol.initiate_negotiation(topic).unwrap();

        // Both agents approve
        protocol
            .submit_position(
                &session.session_id,
                "agent1",
                Position {
                    agent_id: "agent1".to_string(),
                    stance: Stance::Approve,
                    arguments: vec![Argument::new("Looks good")],
                    evidence: vec![],
                },
            )
            .unwrap();

        protocol
            .submit_position(
                &session.session_id,
                "agent2",
                Position {
                    agent_id: "agent2".to_string(),
                    stance: Stance::Approve,
                    arguments: vec![Argument::new("I agree")],
                    evidence: vec![],
                },
            )
            .unwrap();

        let resolution = protocol.resolve(&session.session_id).unwrap();

        assert_eq!(resolution.outcome, ResolutionOutcome::Consensus);
        assert_eq!(resolution.consensus_level, 1.0);
        assert!(resolution.dissenting_opinions.is_empty());
    }

    #[test]
    fn test_voting_resolution() {
        let mut protocol = NegotiationProtocol::new();
        let topic = create_test_topic(vec!["agent1", "agent2", "agent3"]);
        let session = protocol.initiate_negotiation(topic).unwrap();

        // 2 approve, 1 rejects
        protocol
            .submit_position(
                &session.session_id,
                "agent1",
                Position {
                    agent_id: "agent1".to_string(),
                    stance: Stance::Approve,
                    arguments: vec![],
                    evidence: vec![],
                },
            )
            .unwrap();

        protocol
            .submit_position(
                &session.session_id,
                "agent2",
                Position {
                    agent_id: "agent2".to_string(),
                    stance: Stance::Approve,
                    arguments: vec![],
                    evidence: vec![],
                },
            )
            .unwrap();

        protocol
            .submit_position(
                &session.session_id,
                "agent3",
                Position {
                    agent_id: "agent3".to_string(),
                    stance: Stance::Reject {
                        reason: "Not ready".to_string(),
                    },
                    arguments: vec![],
                    evidence: vec![],
                },
            )
            .unwrap();

        let resolution = protocol.resolve(&session.session_id).unwrap();

        assert_eq!(resolution.outcome, ResolutionOutcome::MajorityVote);
        assert!(resolution.consensus_level > 0.5);
        assert_eq!(resolution.dissenting_opinions.len(), 1);
    }

    #[test]
    fn test_escalation_resolution() {
        let mut protocol = NegotiationProtocol::new();
        let topic = create_test_topic(vec!["agent1", "agent2"]);
        let session = protocol.initiate_negotiation(topic).unwrap();

        // Equal votes - should escalate
        protocol
            .submit_position(
                &session.session_id,
                "agent1",
                Position {
                    agent_id: "agent1".to_string(),
                    stance: Stance::Approve,
                    arguments: vec![],
                    evidence: vec![],
                },
            )
            .unwrap();

        protocol
            .submit_position(
                &session.session_id,
                "agent2",
                Position {
                    agent_id: "agent2".to_string(),
                    stance: Stance::Reject {
                        reason: "Disagree".to_string(),
                    },
                    arguments: vec![],
                    evidence: vec![],
                },
            )
            .unwrap();

        let resolution = protocol.resolve(&session.session_id).unwrap();

        assert_eq!(resolution.outcome, ResolutionOutcome::Escalated);
        assert_eq!(resolution.consensus_level, 0.0);
    }

    #[test]
    fn test_timeout_handling() {
        let mut protocol = NegotiationProtocol::new();
        let mut topic = create_test_topic(vec!["agent1", "agent2"]);
        // Set deadline to 1ms in the future, then wait for it to pass
        topic.deadline_ms = current_timestamp_ms() + 1;

        let session = protocol.initiate_negotiation(topic).unwrap();

        // Wait for deadline to pass
        std::thread::sleep(std::time::Duration::from_millis(10));

        // Try to submit after deadline
        let position = Position {
            agent_id: "agent1".to_string(),
            stance: Stance::Approve,
            arguments: vec![],
            evidence: vec![],
        };

        let result = protocol.submit_position(&session.session_id, "agent1", position);
        assert!(result.is_err());

        // Verify session status changed to TimedOut
        let updated_session = protocol.get_session(&session.session_id).unwrap();
        assert_eq!(updated_session.status, NegotiationStatus::TimedOut);
    }

    #[test]
    fn test_history_recording() {
        let mut protocol = NegotiationProtocol::new();
        let topic = create_test_topic(vec!["agent1"]);
        let session = protocol.initiate_negotiation(topic).unwrap();

        protocol
            .submit_position(
                &session.session_id,
                "agent1",
                Position {
                    agent_id: "agent1".to_string(),
                    stance: Stance::Approve,
                    arguments: vec![],
                    evidence: vec![],
                },
            )
            .unwrap();

        protocol.resolve(&session.session_id).unwrap();

        let history = protocol.get_history();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].status, NegotiationStatus::Resolved);
    }

    #[test]
    fn test_conditional_consensus() {
        let mut protocol = NegotiationProtocol::new();
        let topic = create_test_topic(vec!["agent1", "agent2"]);
        let session = protocol.initiate_negotiation(topic).unwrap();

        // Both agents conditionally approve
        protocol
            .submit_position(
                &session.session_id,
                "agent1",
                Position {
                    agent_id: "agent1".to_string(),
                    stance: Stance::Conditional {
                        conditions: vec!["Add tests".to_string()],
                    },
                    arguments: vec![],
                    evidence: vec![],
                },
            )
            .unwrap();

        protocol
            .submit_position(
                &session.session_id,
                "agent2",
                Position {
                    agent_id: "agent2".to_string(),
                    stance: Stance::Conditional {
                        conditions: vec!["Add docs".to_string()],
                    },
                    arguments: vec![],
                    evidence: vec![],
                },
            )
            .unwrap();

        let resolution = protocol.resolve(&session.session_id).unwrap();

        assert_eq!(resolution.outcome, ResolutionOutcome::Consensus);
        assert!(resolution.final_decision.contains("2 conditions"));
    }

    #[test]
    fn test_consensus_level_calculation() {
        let positions = [
            Position {
                agent_id: "agent1".to_string(),
                stance: Stance::Approve,
                arguments: vec![],
                evidence: vec![],
            },
            Position {
                agent_id: "agent2".to_string(),
                stance: Stance::Approve,
                arguments: vec![],
                evidence: vec![],
            },
            Position {
                agent_id: "agent3".to_string(),
                stance: Stance::Reject {
                    reason: "No".to_string(),
                },
                arguments: vec![],
                evidence: vec![],
            },
        ];

        let pos_refs: Vec<&Position> = positions.iter().collect();
        let level = NegotiationProtocol::calculate_consensus_level_static(&pos_refs);

        assert!((level - 0.666).abs() < 0.01);
    }
}
