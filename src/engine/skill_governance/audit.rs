// Audit logging for skill governance
//
// This module provides audit trail functionality for skill imports,
// signature verifications, and trust decisions.

use super::types::AuditEvent;
use anyhow::Result;
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

/// Audit logger for skill governance events
pub struct AuditLogger {
    log_file: Arc<Mutex<Option<File>>>,
    log_path: PathBuf,
    enabled: bool,
}

impl AuditLogger {
    /// Create new audit logger
    pub fn new(log_path: impl Into<PathBuf>, enabled: bool) -> Result<Self> {
        let log_path = log_path.into();

        let log_file = if enabled {
            // Create parent directory if needed
            if let Some(parent) = log_path.parent() {
                std::fs::create_dir_all(parent)?;
            }

            // Open log file in append mode
            let file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&log_path)?;

            Some(file)
        } else {
            None
        };

        Ok(Self {
            log_file: Arc::new(Mutex::new(log_file)),
            log_path,
            enabled,
        })
    }

    /// Create disabled audit logger
    pub fn disabled() -> Self {
        Self {
            log_file: Arc::new(Mutex::new(None)),
            log_path: PathBuf::new(),
            enabled: false,
        }
    }

    /// Log an audit event
    pub fn log_event(&self, event: &AuditEvent) -> Result<()> {
        if !self.enabled {
            return Ok(());
        }

        let mut file_guard = self.log_file.lock().unwrap();
        if let Some(ref mut file) = *file_guard {
            let json = serde_json::to_string(event)?;
            writeln!(file, "{}", json)?;
            file.flush()?;
        }

        Ok(())
    }

    /// Log skill import event
    pub fn log_import(
        &self,
        skill_id: &str,
        source: &str,
        signature_valid: bool,
        trust_tier: &str,
        decision: &str,
        reason: Option<String>,
    ) -> Result<()> {
        let mut event = AuditEvent::new(
            "skill_import".to_string(),
            skill_id.to_string(),
            source.to_string(),
            signature_valid,
            trust_tier.to_string(),
            decision.to_string(),
        );

        if let Some(r) = reason {
            event = event.with_reason(r);
        }

        self.log_event(&event)
    }

    /// Log signature verification event
    pub fn log_verification(
        &self,
        skill_id: &str,
        source: &str,
        signature_valid: bool,
        reason: Option<String>,
    ) -> Result<()> {
        let mut event = AuditEvent::new(
            "signature_verification".to_string(),
            skill_id.to_string(),
            source.to_string(),
            signature_valid,
            "N/A".to_string(),
            if signature_valid { "valid" } else { "invalid" }.to_string(),
        );

        if let Some(r) = reason {
            event = event.with_reason(r);
        }

        self.log_event(&event)
    }

    /// Log trust decision event
    pub fn log_trust_decision(
        &self,
        skill_id: &str,
        source: &str,
        trust_tier: &str,
        decision: &str,
        reason: Option<String>,
    ) -> Result<()> {
        let mut event = AuditEvent::new(
            "trust_decision".to_string(),
            skill_id.to_string(),
            source.to_string(),
            false, // Not applicable for trust decisions
            trust_tier.to_string(),
            decision.to_string(),
        );

        if let Some(r) = reason {
            event = event.with_reason(r);
        }

        self.log_event(&event)
    }

    /// Read all audit events from log file
    pub fn read_events(&self) -> Result<Vec<AuditEvent>> {
        if !self.log_path.exists() {
            return Ok(Vec::new());
        }

        let content = std::fs::read_to_string(&self.log_path)?;
        let mut events = Vec::new();

        for line in content.lines() {
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<AuditEvent>(line) {
                Ok(event) => events.push(event),
                Err(e) => {
                    eprintln!("Failed to parse audit event: {}", e);
                }
            }
        }

        Ok(events)
    }

    /// Get log file path
    pub fn log_path(&self) -> &Path {
        &self.log_path
    }

    /// Check if logging is enabled
    pub fn is_enabled(&self) -> bool {
        self.enabled
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_audit_logger_creation() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("audit.log");

        let logger = AuditLogger::new(&log_path, true).unwrap();
        assert!(logger.is_enabled());
        assert_eq!(logger.log_path(), log_path);
    }

    #[test]
    fn test_audit_logger_disabled() {
        let logger = AuditLogger::disabled();
        assert!(!logger.is_enabled());
    }

    #[test]
    fn test_log_event() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("audit.log");

        let logger = AuditLogger::new(&log_path, true).unwrap();

        let event = AuditEvent::new(
            "test_event".to_string(),
            "test/skill.md".to_string(),
            "local".to_string(),
            true,
            "Trusted".to_string(),
            "allowed".to_string(),
        );

        logger.log_event(&event).unwrap();

        // Verify log file exists and contains event
        assert!(log_path.exists());
        let content = std::fs::read_to_string(&log_path).unwrap();
        assert!(content.contains("test_event"));
        assert!(content.contains("test/skill.md"));
    }

    #[test]
    fn test_log_import() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("audit.log");

        let logger = AuditLogger::new(&log_path, true).unwrap();

        logger
            .log_import(
                "test/skill.md",
                "local",
                true,
                "Trusted",
                "allowed",
                Some("Test reason".to_string()),
            )
            .unwrap();

        let content = std::fs::read_to_string(&log_path).unwrap();
        assert!(content.contains("skill_import"));
        assert!(content.contains("Test reason"));
    }

    #[test]
    fn test_log_verification() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("audit.log");

        let logger = AuditLogger::new(&log_path, true).unwrap();

        logger
            .log_verification(
                "test/skill.md",
                "github.com/user/repo",
                true,
                Some("Valid signature".to_string()),
            )
            .unwrap();

        let content = std::fs::read_to_string(&log_path).unwrap();
        assert!(content.contains("signature_verification"));
        assert!(content.contains("Valid signature"));
    }

    #[test]
    fn test_read_events() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("audit.log");

        let logger = AuditLogger::new(&log_path, true).unwrap();

        // Log multiple events
        logger
            .log_import("skill1.md", "local", true, "Trusted", "allowed", None)
            .unwrap();
        logger
            .log_import("skill2.md", "remote", false, "Untrusted", "rejected", None)
            .unwrap();

        // Read events
        let events = logger.read_events().unwrap();
        assert_eq!(events.len(), 2);
        assert_eq!(events[0].skill_id, "skill1.md");
        assert_eq!(events[1].skill_id, "skill2.md");
    }

    #[test]
    fn test_disabled_logger_no_file() {
        let logger = AuditLogger::disabled();

        let event = AuditEvent::new(
            "test_event".to_string(),
            "test/skill.md".to_string(),
            "local".to_string(),
            true,
            "Trusted".to_string(),
            "allowed".to_string(),
        );

        // Should not error even though disabled
        logger.log_event(&event).unwrap();
    }
}
