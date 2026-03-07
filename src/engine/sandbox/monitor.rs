// Resource monitoring for sandbox execution
//
// Provides CPU, memory, and time tracking with limit enforcement.

#![allow(dead_code)]

use super::{LimitViolation, ResourceLimits, ResourceUsage};
use anyhow::Result;
use std::time::{Duration, Instant};
use tokio::process::Command;

/// Resource monitor for tracking process resource usage
pub struct ResourceMonitor {
    pid: u32,
    limits: ResourceLimits,
    start_time: Instant,
}

impl ResourceMonitor {
    /// Create new resource monitor
    pub fn new(pid: u32, limits: ResourceLimits) -> Self {
        Self {
            pid,
            limits,
            start_time: Instant::now(),
        }
    }

    /// Get current resource usage
    pub async fn current_usage(&self) -> Result<ResourceUsage> {
        let cpu_percent = self.get_cpu_percent().await?;
        let memory_mb = self.get_memory_mb().await?;
        let elapsed_ms = self.start_time.elapsed().as_millis() as u64;

        Ok(ResourceUsage {
            cpu_percent,
            memory_mb,
            elapsed_ms,
        })
    }

    /// Get CPU usage percentage
    async fn get_cpu_percent(&self) -> Result<f32> {
        let output = Command::new("ps")
            .arg("-o")
            .arg("%cpu=")
            .arg("-p")
            .arg(self.pid.to_string())
            .output()
            .await?;

        if !output.status.success() {
            return Ok(0.0);
        }

        let cpu_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(cpu_str.parse::<f32>().unwrap_or(0.0))
    }

    /// Get memory usage in MB
    async fn get_memory_mb(&self) -> Result<u32> {
        let output = Command::new("ps")
            .arg("-o")
            .arg("rss=")
            .arg("-p")
            .arg(self.pid.to_string())
            .output()
            .await?;

        if !output.status.success() {
            return Ok(0);
        }

        let rss_kb = String::from_utf8_lossy(&output.stdout)
            .trim()
            .parse::<u64>()
            .unwrap_or(0);
        Ok(((rss_kb.saturating_add(1023)) / 1024) as u32)
    }

    /// Check if any limits are exceeded
    pub fn check_limits(&self, usage: &ResourceUsage) -> Option<LimitViolation> {
        // Check CPU limit
        if self.limits.max_cpu_percent != 100
            && usage.cpu_percent > self.limits.max_cpu_percent as f32
        {
            return Some(LimitViolation::CpuExceeded {
                actual: usage.cpu_percent,
                limit: self.limits.max_cpu_percent,
            });
        }

        // Check memory limit
        if self.limits.max_memory_mb != u32::MAX && usage.memory_mb > self.limits.max_memory_mb {
            return Some(LimitViolation::MemoryExceeded {
                actual: usage.memory_mb,
                limit: self.limits.max_memory_mb,
            });
        }

        // Check timeout
        if self.limits.max_execution_time_ms != u64::MAX
            && usage.elapsed_ms > self.limits.max_execution_time_ms
        {
            return Some(LimitViolation::TimeoutExceeded {
                actual: usage.elapsed_ms,
                limit: self.limits.max_execution_time_ms,
            });
        }

        None
    }

    /// Monitor continuously with specified interval
    pub async fn monitor_loop(&self, interval: Duration) -> Result<ResourceUsage> {
        loop {
            let usage = self.current_usage().await?;

            if let Some(violation) = self.check_limits(&usage) {
                return Err(anyhow::anyhow!("Resource limit violated: {}", violation));
            }

            tokio::time::sleep(interval).await;
        }
    }

    /// Get elapsed time in milliseconds
    pub fn elapsed_ms(&self) -> u64 {
        self.start_time.elapsed().as_millis() as u64
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resource_monitor_creation() {
        let limits = ResourceLimits::new(50, 100, 5000);
        let monitor = ResourceMonitor::new(1234, limits);
        assert_eq!(monitor.pid, 1234);
        assert_eq!(monitor.limits.max_cpu_percent, 50);
    }

    #[test]
    fn test_check_limits_cpu_exceeded() {
        let limits = ResourceLimits::new(50, 100, 5000);
        let monitor = ResourceMonitor::new(1234, limits);

        let usage = ResourceUsage {
            cpu_percent: 75.5,
            memory_mb: 50,
            elapsed_ms: 1000,
        };

        let violation = monitor.check_limits(&usage);
        assert!(violation.is_some());
        match violation.unwrap() {
            LimitViolation::CpuExceeded { actual, limit } => {
                assert_eq!(actual, 75.5);
                assert_eq!(limit, 50);
            }
            _ => panic!("Expected CPU violation"),
        }
    }

    #[test]
    fn test_check_limits_memory_exceeded() {
        let limits = ResourceLimits::new(100, 100, 5000);
        let monitor = ResourceMonitor::new(1234, limits);

        let usage = ResourceUsage {
            cpu_percent: 50.0,
            memory_mb: 150,
            elapsed_ms: 1000,
        };

        let violation = monitor.check_limits(&usage);
        assert!(violation.is_some());
        match violation.unwrap() {
            LimitViolation::MemoryExceeded { actual, limit } => {
                assert_eq!(actual, 150);
                assert_eq!(limit, 100);
            }
            _ => panic!("Expected memory violation"),
        }
    }

    #[test]
    fn test_check_limits_timeout_exceeded() {
        let limits = ResourceLimits::new(100, 100, 5000);
        let monitor = ResourceMonitor::new(1234, limits);

        let usage = ResourceUsage {
            cpu_percent: 50.0,
            memory_mb: 50,
            elapsed_ms: 6000,
        };

        let violation = monitor.check_limits(&usage);
        assert!(violation.is_some());
        match violation.unwrap() {
            LimitViolation::TimeoutExceeded { actual, limit } => {
                assert_eq!(actual, 6000);
                assert_eq!(limit, 5000);
            }
            _ => panic!("Expected timeout violation"),
        }
    }

    #[test]
    fn test_check_limits_no_violation() {
        let limits = ResourceLimits::new(100, 100, 5000);
        let monitor = ResourceMonitor::new(1234, limits);

        let usage = ResourceUsage {
            cpu_percent: 50.0,
            memory_mb: 50,
            elapsed_ms: 1000,
        };

        let violation = monitor.check_limits(&usage);
        assert!(violation.is_none());
    }

    #[test]
    fn test_check_limits_unbounded() {
        let limits = ResourceLimits::default();
        let monitor = ResourceMonitor::new(1234, limits);

        let usage = ResourceUsage {
            cpu_percent: 200.0,
            memory_mb: u32::MAX,
            elapsed_ms: u64::MAX,
        };

        let violation = monitor.check_limits(&usage);
        assert!(violation.is_none());
    }
}
