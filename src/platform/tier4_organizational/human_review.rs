// Human Review Service - escalate ambiguity with SLA enforcement

use crate::platform::types::{Severity, StepId};
use crate::platform::PlatformError;
use crate::platform::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

pub type ReviewId = String;

/// Human review service with SLA tracking
pub struct HumanReviewService {
    reviews: HashMap<ReviewId, ReviewState>,
    notification_channels: Vec<NotificationChannel>,
}

/// Internal state for a review request
#[derive(Debug, Clone)]
struct ReviewState {
    request: ReviewRequest,
    status: ReviewStatus,
    created_at_ms: u64,
}

/// Notification channel configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationChannel {
    Email { address: String },
    Slack { webhook_url: String },
    Console,
}

/// Review request with SLA and timeout policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewRequest {
    pub request_id: ReviewId,
    pub workflow_id: String,
    pub step_id: StepId,
    pub ambiguity: AmbiguityType,
    pub context: HashMap<String, String>,
    pub sla_deadline_ms: u64,
    pub timeout_policy: TimeoutPolicy,
}

/// Types of ambiguity requiring human review
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AmbiguityType {
    ConflictingRequirements { conflicts: Vec<String> },
    UnclearIntent { question: String },
    RiskDecision { risk_level: Severity },
    PolicyViolation { policy: String, violation: String },
}

/// Timeout policy when SLA is exceeded
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TimeoutPolicy {
    Block,
    AssumeYes,
    AssumeNo,
    UseDefault { default_action: String },
}

/// Human decision on a review request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HumanDecision {
    pub reviewer_id: String,
    pub decision: String,
    pub rationale: String,
    pub timestamp_ms: u64,
}

/// Status of a review request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReviewStatus {
    Pending,
    Completed { decision: HumanDecision },
    TimedOut { action: TimeoutAction },
}

/// Action taken when timeout occurs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TimeoutAction {
    Block { reason: String },
    Proceed { decision: HumanDecision },
}

/// Dashboard entry showing pending review with time remaining
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PendingReview {
    pub review_id: ReviewId,
    pub workflow_id: String,
    pub step_id: StepId,
    pub ambiguity: AmbiguityType,
    pub context: HashMap<String, String>,
    pub sla_deadline_ms: u64,
    pub time_remaining_ms: i64,
    pub created_at_ms: u64,
}

impl HumanReviewService {
    /// Create a new human review service
    pub fn new() -> Self {
        Self {
            reviews: HashMap::new(),
            notification_channels: vec![NotificationChannel::Console],
        }
    }

    /// Create service with custom notification channels
    pub fn with_channels(channels: Vec<NotificationChannel>) -> Self {
        Self {
            reviews: HashMap::new(),
            notification_channels: channels,
        }
    }

    /// Add a notification channel
    pub fn add_notification_channel(&mut self, channel: NotificationChannel) {
        self.notification_channels.push(channel);
    }

    /// Request human review with SLA tracking (Requirement 11.1)
    pub fn request_review(&mut self, request: ReviewRequest) -> Result<ReviewId> {
        // Validate request
        if request.request_id.is_empty() {
            return Err(PlatformError::InvalidInput(
                "request_id cannot be empty".to_string(),
            ));
        }

        if request.workflow_id.is_empty() {
            return Err(PlatformError::InvalidInput(
                "workflow_id cannot be empty".to_string(),
            ));
        }

        let review_id = request.request_id.clone();
        let current_time = current_timestamp();

        // Create review state
        let state = ReviewState {
            request: request.clone(),
            status: ReviewStatus::Pending,
            created_at_ms: current_time,
        };

        // Store review
        self.reviews.insert(review_id.clone(), state);

        // Notify reviewers (Requirement 11.2)
        self.notify_reviewers(&request)?;

        Ok(review_id)
    }

    /// Submit human decision for a review (Requirement 11.3)
    pub fn submit_decision(&mut self, review_id: &ReviewId, decision: HumanDecision) -> Result<()> {
        // Find review
        let state = self
            .reviews
            .get_mut(review_id)
            .ok_or_else(|| PlatformError::NotFound(format!("Review not found: {}", review_id)))?;

        // Check if already completed or timed out
        match &state.status {
            ReviewStatus::Completed { .. } => Err(PlatformError::InvalidInput(
                "Review already completed".to_string(),
            )),
            ReviewStatus::TimedOut { .. } => Err(PlatformError::InvalidInput(
                "Review already timed out".to_string(),
            )),
            ReviewStatus::Pending => {
                // Update status
                state.status = ReviewStatus::Completed { decision };
                Ok(())
            }
        }
    }

    /// Check status of a review request
    pub fn check_status(&self, review_id: &ReviewId) -> Result<ReviewStatus> {
        let state = self
            .reviews
            .get(review_id)
            .ok_or_else(|| PlatformError::NotFound(format!("Review not found: {}", review_id)))?;

        Ok(state.status.clone())
    }

    /// Handle timeout when SLA is exceeded (Requirement 11.4, 11.5)
    pub fn handle_timeout(&mut self, review_id: &ReviewId) -> Result<TimeoutAction> {
        // First, get the request and status without holding a mutable borrow
        let (request, status, current_time) = {
            let state = self.reviews.get(review_id).ok_or_else(|| {
                PlatformError::NotFound(format!("Review not found: {}", review_id))
            })?;

            let current_time = current_timestamp();

            // Verify timeout has occurred
            if current_time <= state.request.sla_deadline_ms {
                return Err(PlatformError::InvalidInput(
                    "SLA deadline has not been exceeded yet".to_string(),
                ));
            }

            (state.request.clone(), state.status.clone(), current_time)
        };

        // Check if already handled
        match &status {
            ReviewStatus::Completed { .. } => Err(PlatformError::InvalidInput(
                "Review already completed".to_string(),
            )),
            ReviewStatus::TimedOut { action } => Ok(action.clone()),
            ReviewStatus::Pending => {
                // Apply timeout policy
                let action = self.apply_timeout_policy(&request, current_time)?;

                // Log timeout event
                self.log_timeout_event(review_id, &action)?;

                // Update status
                let state = self.reviews.get_mut(review_id).unwrap();
                state.status = ReviewStatus::TimedOut {
                    action: action.clone(),
                };

                Ok(action)
            }
        }
    }

    /// Get dashboard of pending reviews (Requirement 11.6)
    pub fn get_pending_reviews(&self) -> Vec<PendingReview> {
        let current_time = current_timestamp();
        let mut pending = Vec::new();

        for (review_id, state) in &self.reviews {
            if matches!(state.status, ReviewStatus::Pending) {
                let time_remaining_ms = state.request.sla_deadline_ms as i64 - current_time as i64;

                pending.push(PendingReview {
                    review_id: review_id.clone(),
                    workflow_id: state.request.workflow_id.clone(),
                    step_id: state.request.step_id.clone(),
                    ambiguity: state.request.ambiguity.clone(),
                    context: state.request.context.clone(),
                    sla_deadline_ms: state.request.sla_deadline_ms,
                    time_remaining_ms,
                    created_at_ms: state.created_at_ms,
                });
            }
        }

        // Sort by time remaining (most urgent first)
        pending.sort_by_key(|r| r.time_remaining_ms);

        pending
    }

    /// Check for expired SLAs and handle timeouts automatically
    pub fn process_timeouts(&mut self) -> Result<Vec<(ReviewId, TimeoutAction)>> {
        let current_time = current_timestamp();
        let mut timed_out = Vec::new();

        // Find reviews that have exceeded SLA
        let expired_reviews: Vec<ReviewId> = self
            .reviews
            .iter()
            .filter(|(_, state)| {
                matches!(state.status, ReviewStatus::Pending)
                    && current_time > state.request.sla_deadline_ms
            })
            .map(|(id, _)| id.clone())
            .collect();

        // Handle each timeout
        for review_id in expired_reviews {
            match self.handle_timeout(&review_id) {
                Ok(action) => {
                    timed_out.push((review_id, action));
                }
                Err(e) => {
                    eprintln!("Error handling timeout for {}: {}", review_id, e);
                }
            }
        }

        Ok(timed_out)
    }

    // Private helper methods

    /// Notify reviewers through configured channels
    fn notify_reviewers(&self, request: &ReviewRequest) -> Result<()> {
        for channel in &self.notification_channels {
            match channel {
                NotificationChannel::Console => {
                    println!("=== HUMAN REVIEW REQUIRED ===");
                    println!("Review ID: {}", request.request_id);
                    println!("Workflow: {}", request.workflow_id);
                    println!("Step: {}", request.step_id);
                    println!("Ambiguity: {:?}", request.ambiguity);
                    println!("SLA Deadline: {} ms", request.sla_deadline_ms);
                    println!("Context: {:?}", request.context);
                    println!("============================");
                }
                NotificationChannel::Email { address } => {
                    // In production, send actual email
                    println!("Would send email to: {}", address);
                }
                NotificationChannel::Slack { webhook_url } => {
                    // In production, send to Slack
                    println!("Would send Slack notification to: {}", webhook_url);
                }
            }
        }
        Ok(())
    }

    /// Apply timeout policy and generate appropriate action
    fn apply_timeout_policy(
        &self,
        request: &ReviewRequest,
        current_time: u64,
    ) -> Result<TimeoutAction> {
        let action = match &request.timeout_policy {
            TimeoutPolicy::Block => TimeoutAction::Block {
                reason: "Awaiting human decision".to_string(),
            },
            TimeoutPolicy::AssumeYes => TimeoutAction::Proceed {
                decision: HumanDecision {
                    reviewer_id: "system".to_string(),
                    decision: "approved".to_string(),
                    rationale: "Auto-approved due to SLA timeout".to_string(),
                    timestamp_ms: current_time,
                },
            },
            TimeoutPolicy::AssumeNo => TimeoutAction::Proceed {
                decision: HumanDecision {
                    reviewer_id: "system".to_string(),
                    decision: "rejected".to_string(),
                    rationale: "Auto-rejected due to SLA timeout".to_string(),
                    timestamp_ms: current_time,
                },
            },
            TimeoutPolicy::UseDefault { default_action } => TimeoutAction::Proceed {
                decision: HumanDecision {
                    reviewer_id: "system".to_string(),
                    decision: default_action.clone(),
                    rationale: "Default action applied due to SLA timeout".to_string(),
                    timestamp_ms: current_time,
                },
            },
        };

        Ok(action)
    }

    /// Log timeout event for audit
    fn log_timeout_event(&self, review_id: &ReviewId, action: &TimeoutAction) -> Result<()> {
        println!(
            "TIMEOUT EVENT: Review {} timed out. Action: {:?}",
            review_id, action
        );
        // In production, write to audit log
        Ok(())
    }
}

impl Default for HumanReviewService {
    fn default() -> Self {
        Self::new()
    }
}

/// Get current timestamp in milliseconds
fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_request(
        request_id: &str,
        sla_deadline_ms: u64,
        timeout_policy: TimeoutPolicy,
    ) -> ReviewRequest {
        ReviewRequest {
            request_id: request_id.to_string(),
            workflow_id: "test_workflow".to_string(),
            step_id: "test_step".to_string(),
            ambiguity: AmbiguityType::UnclearIntent {
                question: "Should we proceed?".to_string(),
            },
            context: HashMap::from([
                ("key1".to_string(), "value1".to_string()),
                ("key2".to_string(), "value2".to_string()),
            ]),
            sla_deadline_ms,
            timeout_policy,
        }
    }

    #[test]
    fn test_request_review() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_001",
            current_timestamp() + 60000, // 1 minute from now
            TimeoutPolicy::Block,
        );

        let review_id = service.request_review(request).unwrap();
        assert_eq!(review_id, "review_001");

        // Verify status is pending
        let status = service.check_status(&review_id).unwrap();
        assert!(matches!(status, ReviewStatus::Pending));
    }

    #[test]
    fn test_request_review_validation() {
        let mut service = HumanReviewService::new();

        // Empty request_id should fail
        let mut request =
            create_test_request("", current_timestamp() + 60000, TimeoutPolicy::Block);
        let result = service.request_review(request.clone());
        assert!(result.is_err());

        // Empty workflow_id should fail
        request.request_id = "review_001".to_string();
        request.workflow_id = "".to_string();
        let result = service.request_review(request);
        assert!(result.is_err());
    }

    #[test]
    fn test_submit_decision() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_002",
            current_timestamp() + 60000,
            TimeoutPolicy::Block,
        );

        let review_id = service.request_review(request).unwrap();

        // Submit decision
        let decision = HumanDecision {
            reviewer_id: "reviewer_1".to_string(),
            decision: "approved".to_string(),
            rationale: "Looks good to proceed".to_string(),
            timestamp_ms: current_timestamp(),
        };

        service
            .submit_decision(&review_id, decision.clone())
            .unwrap();

        // Verify status is completed
        let status = service.check_status(&review_id).unwrap();
        match status {
            ReviewStatus::Completed { decision: d } => {
                assert_eq!(d.reviewer_id, "reviewer_1");
                assert_eq!(d.decision, "approved");
            }
            _ => panic!("Expected Completed status"),
        }
    }

    #[test]
    fn test_submit_decision_twice() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_003",
            current_timestamp() + 60000,
            TimeoutPolicy::Block,
        );

        let review_id = service.request_review(request).unwrap();

        let decision = HumanDecision {
            reviewer_id: "reviewer_1".to_string(),
            decision: "approved".to_string(),
            rationale: "First decision".to_string(),
            timestamp_ms: current_timestamp(),
        };

        service
            .submit_decision(&review_id, decision.clone())
            .unwrap();

        // Try to submit again - should fail
        let result = service.submit_decision(&review_id, decision);
        assert!(result.is_err());
    }

    #[test]
    fn test_submit_decision_not_found() {
        let mut service = HumanReviewService::new();

        let decision = HumanDecision {
            reviewer_id: "reviewer_1".to_string(),
            decision: "approved".to_string(),
            rationale: "Test".to_string(),
            timestamp_ms: current_timestamp(),
        };

        let result = service.submit_decision(&"nonexistent".to_string(), decision);
        assert!(result.is_err());
    }

    #[test]
    fn test_timeout_block_policy() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_004",
            current_timestamp() - 1000, // Already expired
            TimeoutPolicy::Block,
        );

        let review_id = service.request_review(request).unwrap();

        // Handle timeout
        let action = service.handle_timeout(&review_id).unwrap();

        match action {
            TimeoutAction::Block { reason } => {
                assert_eq!(reason, "Awaiting human decision");
            }
            _ => panic!("Expected Block action"),
        }

        // Verify status is timed out
        let status = service.check_status(&review_id).unwrap();
        assert!(matches!(status, ReviewStatus::TimedOut { .. }));
    }

    #[test]
    fn test_timeout_assume_yes_policy() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_005",
            current_timestamp() - 1000,
            TimeoutPolicy::AssumeYes,
        );

        let review_id = service.request_review(request).unwrap();

        let action = service.handle_timeout(&review_id).unwrap();

        match action {
            TimeoutAction::Proceed { decision } => {
                assert_eq!(decision.reviewer_id, "system");
                assert_eq!(decision.decision, "approved");
                assert!(decision.rationale.contains("Auto-approved"));
            }
            _ => panic!("Expected Proceed action"),
        }
    }

    #[test]
    fn test_timeout_assume_no_policy() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_006",
            current_timestamp() - 1000,
            TimeoutPolicy::AssumeNo,
        );

        let review_id = service.request_review(request).unwrap();

        let action = service.handle_timeout(&review_id).unwrap();

        match action {
            TimeoutAction::Proceed { decision } => {
                assert_eq!(decision.reviewer_id, "system");
                assert_eq!(decision.decision, "rejected");
                assert!(decision.rationale.contains("Auto-rejected"));
            }
            _ => panic!("Expected Proceed action"),
        }
    }

    #[test]
    fn test_timeout_use_default_policy() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_007",
            current_timestamp() - 1000,
            TimeoutPolicy::UseDefault {
                default_action: "skip".to_string(),
            },
        );

        let review_id = service.request_review(request).unwrap();

        let action = service.handle_timeout(&review_id).unwrap();

        match action {
            TimeoutAction::Proceed { decision } => {
                assert_eq!(decision.reviewer_id, "system");
                assert_eq!(decision.decision, "skip");
                assert!(decision.rationale.contains("Default action"));
            }
            _ => panic!("Expected Proceed action"),
        }
    }

    #[test]
    fn test_timeout_before_deadline() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_008",
            current_timestamp() + 60000, // Not expired yet
            TimeoutPolicy::Block,
        );

        let review_id = service.request_review(request).unwrap();

        // Try to handle timeout before deadline - should fail
        let result = service.handle_timeout(&review_id);
        assert!(result.is_err());
    }

    #[test]
    fn test_timeout_after_completion() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_009",
            current_timestamp() - 1000,
            TimeoutPolicy::Block,
        );

        let review_id = service.request_review(request).unwrap();

        // Complete the review first
        let decision = HumanDecision {
            reviewer_id: "reviewer_1".to_string(),
            decision: "approved".to_string(),
            rationale: "Done".to_string(),
            timestamp_ms: current_timestamp(),
        };
        service.submit_decision(&review_id, decision).unwrap();

        // Try to handle timeout - should fail
        let result = service.handle_timeout(&review_id);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_pending_reviews() {
        let mut service = HumanReviewService::new();

        // Create multiple reviews
        let request1 = create_test_request(
            "review_010",
            current_timestamp() + 30000, // 30 seconds
            TimeoutPolicy::Block,
        );
        let request2 = create_test_request(
            "review_011",
            current_timestamp() + 60000, // 60 seconds
            TimeoutPolicy::Block,
        );
        let request3 = create_test_request(
            "review_012",
            current_timestamp() + 10000, // 10 seconds (most urgent)
            TimeoutPolicy::Block,
        );

        service.request_review(request1).unwrap();
        service.request_review(request2).unwrap();
        let _review_id3 = service.request_review(request3).unwrap();

        // Complete one review
        let decision = HumanDecision {
            reviewer_id: "reviewer_1".to_string(),
            decision: "approved".to_string(),
            rationale: "Done".to_string(),
            timestamp_ms: current_timestamp(),
        };
        service.submit_decision(&_review_id3, decision).unwrap();

        // Get pending reviews
        let pending = service.get_pending_reviews();

        // Should have 2 pending (review_012 is completed)
        assert_eq!(pending.len(), 2);

        // Should be sorted by time remaining (most urgent first)
        // review_010 has 30s, review_011 has 60s, so review_010 should be first
        assert_eq!(pending[0].review_id, "review_010");
        assert_eq!(pending[1].review_id, "review_011");
        assert!(pending[0].time_remaining_ms < pending[1].time_remaining_ms);
    }

    #[test]
    fn test_process_timeouts() {
        let mut service = HumanReviewService::new();

        // Create reviews with different deadlines
        let request1 = create_test_request(
            "review_013",
            current_timestamp() - 1000, // Expired
            TimeoutPolicy::AssumeYes,
        );
        let request2 = create_test_request(
            "review_014",
            current_timestamp() + 60000, // Not expired
            TimeoutPolicy::Block,
        );
        let request3 = create_test_request(
            "review_015",
            current_timestamp() - 2000, // Expired
            TimeoutPolicy::AssumeNo,
        );

        service.request_review(request1).unwrap();
        service.request_review(request2).unwrap();
        service.request_review(request3).unwrap();

        // Process timeouts
        let timed_out = service.process_timeouts().unwrap();

        // Should have 2 timed out reviews
        assert_eq!(timed_out.len(), 2);

        // Verify the timed out reviews
        let review_ids: Vec<String> = timed_out.iter().map(|(id, _)| id.clone()).collect();
        assert!(review_ids.contains(&"review_013".to_string()));
        assert!(review_ids.contains(&"review_015".to_string()));
    }

    #[test]
    fn test_notification_channels() {
        let channels = vec![
            NotificationChannel::Console,
            NotificationChannel::Email {
                address: "reviewer@example.com".to_string(),
            },
            NotificationChannel::Slack {
                webhook_url: "https://hooks.slack.com/test".to_string(),
            },
        ];

        let mut service = HumanReviewService::with_channels(channels);

        let request = create_test_request(
            "review_016",
            current_timestamp() + 60000,
            TimeoutPolicy::Block,
        );

        // Should notify through all channels
        let result = service.request_review(request);
        assert!(result.is_ok());
    }

    #[test]
    fn test_add_notification_channel() {
        let mut service = HumanReviewService::new();

        service.add_notification_channel(NotificationChannel::Email {
            address: "test@example.com".to_string(),
        });

        assert_eq!(service.notification_channels.len(), 2); // Console + Email
    }

    #[test]
    fn test_ambiguity_types() {
        let mut service = HumanReviewService::new();

        // Test ConflictingRequirements
        let mut request = create_test_request(
            "review_017",
            current_timestamp() + 60000,
            TimeoutPolicy::Block,
        );
        request.ambiguity = AmbiguityType::ConflictingRequirements {
            conflicts: vec!["req1".to_string(), "req2".to_string()],
        };
        assert!(service.request_review(request).is_ok());

        // Test RiskDecision
        let mut request = create_test_request(
            "review_018",
            current_timestamp() + 60000,
            TimeoutPolicy::Block,
        );
        request.ambiguity = AmbiguityType::RiskDecision {
            risk_level: Severity::High,
        };
        assert!(service.request_review(request).is_ok());

        // Test PolicyViolation
        let mut request = create_test_request(
            "review_019",
            current_timestamp() + 60000,
            TimeoutPolicy::Block,
        );
        request.ambiguity = AmbiguityType::PolicyViolation {
            policy: "security_policy".to_string(),
            violation: "Exposed credentials".to_string(),
        };
        assert!(service.request_review(request).is_ok());
    }

    #[test]
    fn test_pending_review_time_remaining() {
        let mut service = HumanReviewService::new();

        let deadline = current_timestamp() + 30000; // 30 seconds from now
        let request = create_test_request("review_020", deadline, TimeoutPolicy::Block);

        service.request_review(request).unwrap();

        let pending = service.get_pending_reviews();
        assert_eq!(pending.len(), 1);

        // Time remaining should be approximately 30000ms (allow some tolerance)
        let time_remaining = pending[0].time_remaining_ms;
        assert!(time_remaining > 29000 && time_remaining <= 30000);
    }

    #[test]
    fn test_timeout_idempotency() {
        let mut service = HumanReviewService::new();
        let request = create_test_request(
            "review_021",
            current_timestamp() - 1000,
            TimeoutPolicy::AssumeYes,
        );

        let review_id = service.request_review(request).unwrap();

        // Handle timeout first time
        let action1 = service.handle_timeout(&review_id).unwrap();

        // Handle timeout second time - should return same action
        let action2 = service.handle_timeout(&review_id).unwrap();

        // Both actions should be the same
        match (&action1, &action2) {
            (TimeoutAction::Proceed { decision: d1 }, TimeoutAction::Proceed { decision: d2 }) => {
                assert_eq!(d1.decision, d2.decision);
                assert_eq!(d1.reviewer_id, d2.reviewer_id);
            }
            _ => panic!("Expected Proceed actions"),
        }
    }

    #[test]
    fn test_context_preservation() {
        let mut service = HumanReviewService::new();

        let mut context = HashMap::new();
        context.insert("user_id".to_string(), "user123".to_string());
        context.insert("action".to_string(), "deploy".to_string());
        context.insert("environment".to_string(), "production".to_string());

        let mut request = create_test_request(
            "review_022",
            current_timestamp() + 60000,
            TimeoutPolicy::Block,
        );
        request.context = context.clone();

        service.request_review(request).unwrap();

        // Get pending reviews and verify context
        let pending = service.get_pending_reviews();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].context, context);
    }
}
