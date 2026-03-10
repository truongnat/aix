// Logging and telemetry infrastructure with tracing support

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Telemetry system for platform observability
pub struct PlatformTelemetry {
    /// Trace storage
    traces: Arc<Mutex<Vec<TraceEvent>>>,
    
    /// Metrics storage
    metrics: Arc<Mutex<HashMap<String, MetricValue>>>,
    
    /// Configuration
    config: TelemetryConfig,
}

/// Configuration for telemetry
#[derive(Debug, Clone)]
pub struct TelemetryConfig {
    pub enabled: bool,
    pub trace_level: TraceLevel,
    pub export_format: ExportFormat,
}

impl Default for TelemetryConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            trace_level: TraceLevel::Info,
            export_format: ExportFormat::Json,
        }
    }
}

/// Trace level for filtering events
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum TraceLevel {
    Debug,
    Info,
    Warn,
    Error,
}

/// Export format for telemetry data
#[derive(Debug, Clone, Copy)]
pub enum ExportFormat {
    Json,
    OpenTelemetry,
}

/// A single trace event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceEvent {
    pub event_id: String,
    pub timestamp_ms: u64,
    pub level: String,
    pub component: String,
    pub message: String,
    pub attributes: HashMap<String, String>,
    pub span_id: Option<String>,
    pub parent_span_id: Option<String>,
}

/// Metric value types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricValue {
    Counter(u64),
    Gauge(f64),
    Histogram(Vec<f64>),
}

/// Span for distributed tracing
#[derive(Debug, Clone)]
pub struct Span {
    pub span_id: String,
    pub parent_span_id: Option<String>,
    pub name: String,
    pub start_time_ms: u64,
    pub end_time_ms: Option<u64>,
    pub attributes: HashMap<String, String>,
}

impl PlatformTelemetry {
    /// Create a new telemetry system
    pub fn new(config: TelemetryConfig) -> Self {
        Self {
            traces: Arc::new(Mutex::new(Vec::new())),
            metrics: Arc::new(Mutex::new(HashMap::new())),
            config,
        }
    }
    
    /// Create with default configuration
    pub fn default() -> Self {
        Self::new(TelemetryConfig::default())
    }
    
    /// Log a trace event
    pub fn trace(&self, level: TraceLevel, component: &str, message: &str) {
        self.trace_with_attrs(level, component, message, HashMap::new(), None);
    }
    
    /// Log a trace event with attributes
    pub fn trace_with_attrs(
        &self,
        level: TraceLevel,
        component: &str,
        message: &str,
        attributes: HashMap<String, String>,
        span_id: Option<String>,
    ) {
        if !self.config.enabled || level < self.config.trace_level {
            return;
        }
        
        let event = TraceEvent {
            event_id: uuid::Uuid::new_v4().to_string(),
            timestamp_ms: crate::platform::types::current_timestamp_ms(),
            level: format!("{:?}", level),
            component: component.to_string(),
            message: message.to_string(),
            attributes,
            span_id,
            parent_span_id: None,
        };
        
        if let Ok(mut traces) = self.traces.lock() {
            traces.push(event);
        }
    }
    
    /// Start a new span for distributed tracing
    pub fn start_span(&self, name: &str, parent_span_id: Option<String>) -> Span {
        Span {
            span_id: uuid::Uuid::new_v4().to_string(),
            parent_span_id,
            name: name.to_string(),
            start_time_ms: crate::platform::types::current_timestamp_ms(),
            end_time_ms: None,
            attributes: HashMap::new(),
        }
    }
    
    /// End a span
    pub fn end_span(&self, mut span: Span) -> Span {
        span.end_time_ms = Some(crate::platform::types::current_timestamp_ms());
        span
    }
    
    /// Record a counter metric
    pub fn counter(&self, name: &str, value: u64) {
        if !self.config.enabled {
            return;
        }
        
        if let Ok(mut metrics) = self.metrics.lock() {
            let entry = metrics.entry(name.to_string()).or_insert(MetricValue::Counter(0));
            if let MetricValue::Counter(ref mut count) = entry {
                *count += value;
            }
        }
    }
    
    /// Record a gauge metric
    pub fn gauge(&self, name: &str, value: f64) {
        if !self.config.enabled {
            return;
        }
        
        if let Ok(mut metrics) = self.metrics.lock() {
            metrics.insert(name.to_string(), MetricValue::Gauge(value));
        }
    }
    
    /// Record a histogram value
    pub fn histogram(&self, name: &str, value: f64) {
        if !self.config.enabled {
            return;
        }
        
        if let Ok(mut metrics) = self.metrics.lock() {
            let entry = metrics.entry(name.to_string()).or_insert(MetricValue::Histogram(Vec::new()));
            if let MetricValue::Histogram(ref mut values) = entry {
                values.push(value);
            }
        }
    }
    
    /// Get all traces
    pub fn get_traces(&self) -> Vec<TraceEvent> {
        self.traces.lock().unwrap().clone()
    }
    
    /// Get all metrics
    pub fn get_metrics(&self) -> HashMap<String, MetricValue> {
        self.metrics.lock().unwrap().clone()
    }
    
    /// Clear all traces and metrics
    pub fn clear(&self) {
        if let Ok(mut traces) = self.traces.lock() {
            traces.clear();
        }
        if let Ok(mut metrics) = self.metrics.lock() {
            metrics.clear();
        }
    }
    
    /// Export traces to JSON
    pub fn export_traces_json(&self) -> crate::platform::Result<String> {
        let traces = self.get_traces();
        serde_json::to_string_pretty(&traces)
            .map_err(|e| crate::platform::PlatformError::SerializationError(e.to_string()))
    }
    
    /// Export metrics to JSON
    pub fn export_metrics_json(&self) -> crate::platform::Result<String> {
        let metrics = self.get_metrics();
        serde_json::to_string_pretty(&metrics)
            .map_err(|e| crate::platform::PlatformError::SerializationError(e.to_string()))
    }
}

// Convenience macros for logging
#[macro_export]
macro_rules! platform_trace {
    ($telemetry:expr, $level:expr, $component:expr, $($arg:tt)*) => {
        $telemetry.trace($level, $component, &format!($($arg)*))
    };
}

#[macro_export]
macro_rules! platform_debug {
    ($telemetry:expr, $component:expr, $($arg:tt)*) => {
        $telemetry.trace(
            $crate::platform::telemetry::TraceLevel::Debug,
            $component,
            &format!($($arg)*)
        )
    };
}

#[macro_export]
macro_rules! platform_info {
    ($telemetry:expr, $component:expr, $($arg:tt)*) => {
        $telemetry.trace(
            $crate::platform::telemetry::TraceLevel::Info,
            $component,
            &format!($($arg)*)
        )
    };
}

#[macro_export]
macro_rules! platform_warn {
    ($telemetry:expr, $component:expr, $($arg:tt)*) => {
        $telemetry.trace(
            $crate::platform::telemetry::TraceLevel::Warn,
            $component,
            &format!($($arg)*)
        )
    };
}

#[macro_export]
macro_rules! platform_error {
    ($telemetry:expr, $component:expr, $($arg:tt)*) => {
        $telemetry.trace(
            $crate::platform::telemetry::TraceLevel::Error,
            $component,
            &format!($($arg)*)
        )
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_telemetry_trace() {
        let telemetry = PlatformTelemetry::default();
        telemetry.trace(TraceLevel::Info, "test", "test message");
        
        let traces = telemetry.get_traces();
        assert_eq!(traces.len(), 1);
        assert_eq!(traces[0].component, "test");
        assert_eq!(traces[0].message, "test message");
    }

    #[test]
    fn test_telemetry_metrics() {
        let telemetry = PlatformTelemetry::default();
        
        telemetry.counter("requests", 1);
        telemetry.counter("requests", 2);
        telemetry.gauge("cpu_usage", 0.75);
        telemetry.histogram("latency", 100.0);
        telemetry.histogram("latency", 150.0);
        
        let metrics = telemetry.get_metrics();
        assert!(matches!(metrics.get("requests"), Some(MetricValue::Counter(3))));
        assert!(matches!(metrics.get("cpu_usage"), Some(MetricValue::Gauge(0.75))));
    }

    #[test]
    fn test_span_lifecycle() {
        let telemetry = PlatformTelemetry::default();
        
        let span = telemetry.start_span("test_operation", None);
        assert!(span.end_time_ms.is_none());
        
        let ended_span = telemetry.end_span(span);
        assert!(ended_span.end_time_ms.is_some());
    }
}
