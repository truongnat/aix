//! PinchTab Module - Browser Automation for AI Agents
//!
//! Deep integration of PinchTab for browser automation, testing, and web scraping.

use serde::{Deserialize, Serialize};
use std::process::Command;

/// PinchTab server configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PinchTabConfig {
    pub server_url: String,
    pub headless: bool,
    pub stealth: bool,
    pub default_timeout_ms: u32,
}

impl Default for PinchTabConfig {
    fn default() -> Self {
        Self {
            server_url: "http://localhost:9867".to_string(),
            headless: true,
            stealth: true,
            default_timeout_ms: 30000,
        }
    }
}

/// PinchTab instance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Instance {
    pub id: String,
    pub profile: String,
    pub headless: bool,
    pub status: InstanceStatus,
}

/// Instance status
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum InstanceStatus {
    Starting,
    Running,
    Stopped,
    Error,
}

/// A browser tab
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tab {
    pub id: String,
    pub instance_id: String,
    pub url: String,
    pub title: String,
}

/// Page snapshot with interactive elements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    pub tab_id: String,
    pub url: String,
    pub title: String,
    pub elements: Vec<Element>,
    pub text: String,
}

/// Interactive element on page
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Element {
    pub id: String,
    pub tag: String,
    pub text: Option<String>,
    pub placeholder: Option<String>,
    pub href: Option<String>,
    pub input_type: Option<String>,
    pub role: Option<String>,
    pub interactive: bool,
}

/// Action result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResult {
    pub success: bool,
    pub message: String,
    pub element_id: Option<String>,
}

/// PinchTab manager
#[derive(Debug, Default)]
pub struct PinchTabManager {
    config: PinchTabConfig,
}

impl PinchTabManager {
    pub fn new() -> Self {
        Self::default()
    }

    /// Check if PinchTab is available
    pub fn is_available(&self) -> bool {
        Command::new("pinchtab")
            .arg("--version")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }

    /// Launch a new browser instance
    pub fn launch_instance(
        &self,
        profile: Option<&str>,
        headless: Option<bool>,
    ) -> Result<Instance, String> {
        let mut args = vec!["instance".to_string(), "launch".to_string()];

        if headless.unwrap_or(self.config.headless) {
            args.push("--headless".to_string());
        }

        if self.config.stealth {
            args.push("--stealth".to_string());
        }

        if let Some(p) = profile {
            args.push("--profile".to_string());
            args.push(p.to_string());
        }

        let output = Command::new("pinchtab")
            .args(&args)
            .output()
            .map_err(|e| format!("Failed to launch instance: {}", e))?;

        if output.status.success() {
            let instance_id = String::from_utf8_lossy(&output.stdout).trim().to_string();
            Ok(Instance {
                id: instance_id,
                profile: profile.unwrap_or("default").to_string(),
                headless: headless.unwrap_or(self.config.headless),
                status: InstanceStatus::Running,
            })
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    /// Navigate to URL
    pub fn navigate(&self, instance_id: &str, url: &str) -> Result<Tab, String> {
        let output = Command::new("pinchtab")
            .args(["nav", "-i", instance_id, url])
            .output()
            .map_err(|e| format!("Failed to navigate: {}", e))?;

        if output.status.success() {
            let tab_id = String::from_utf8_lossy(&output.stdout).trim().to_string();
            Ok(Tab {
                id: tab_id,
                instance_id: instance_id.to_string(),
                url: url.to_string(),
                title: String::new(),
            })
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    /// Get page snapshot with interactive elements
    pub fn snapshot(&self, tab_id: &str) -> Result<Snapshot, String> {
        let output = Command::new("pinchtab")
            .args(["snap", "-i", tab_id])
            .output()
            .map_err(|e| format!("Failed to get snapshot: {}", e))?;

        if output.status.success() {
            let json_str = String::from_utf8_lossy(&output.stdout).to_string();
            // Simplified - would need proper JSON parsing in production
            Ok(Snapshot {
                tab_id: tab_id.to_string(),
                url: String::new(),
                title: String::new(),
                elements: Vec::new(),
                text: json_str,
            })
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    /// Click element by ID
    pub fn click(&self, tab_id: &str, element_id: &str) -> Result<ActionResult, String> {
        let output = Command::new("pinchtab")
            .args(["click", "-i", tab_id, element_id])
            .output()
            .map_err(|e| format!("Failed to click: {}", e))?;

        Ok(ActionResult {
            success: output.status.success(),
            message: String::from_utf8_lossy(&output.stdout).trim().to_string(),
            element_id: Some(element_id.to_string()),
        })
    }

    /// Fill input field
    pub fn fill(
        &self,
        tab_id: &str,
        element_id: &str,
        value: &str,
    ) -> Result<ActionResult, String> {
        let output = Command::new("pinchtab")
            .args(["fill", "-i", tab_id, element_id, value])
            .output()
            .map_err(|e| format!("Failed to fill: {}", e))?;

        Ok(ActionResult {
            success: output.status.success(),
            message: String::from_utf8_lossy(&output.stdout).trim().to_string(),
            element_id: Some(element_id.to_string()),
        })
    }

    /// Extract page text
    pub fn extract_text(&self, tab_id: &str) -> Result<String, String> {
        let output = Command::new("pinchtab")
            .args(["text", "-i", tab_id])
            .output()
            .map_err(|e| format!("Failed to extract text: {}", e))?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    /// Take screenshot
    pub fn screenshot(&self, tab_id: &str, path: &str) -> Result<ActionResult, String> {
        let output = Command::new("pinchtab")
            .args(["screenshot", "-i", tab_id, "-o", path])
            .output()
            .map_err(|e| format!("Failed to take screenshot: {}", e))?;

        Ok(ActionResult {
            success: output.status.success(),
            message: String::from_utf8_lossy(&output.stdout).trim().to_string(),
            element_id: None,
        })
    }
}

/// Check if PinchTab is available
pub fn is_available() -> bool {
    PinchTabManager::new().is_available()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pinchtab_availability() {
        let manager = PinchTabManager::new();
        // May not be installed in test environment
        let _ = manager.is_available();
    }
}
