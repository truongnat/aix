use super::*;

#[derive(Subcommand, Debug, Clone)]
pub(crate) enum Commands {
    Bug {
        #[command(subcommand)]
        action: Box<BugCommand>,
    },
    Workflow {
        #[command(subcommand)]
        action: Box<WorkflowCommand>,
    },
    Harness {
        #[command(subcommand)]
        action: Box<HarnessCommand>,
    },
    Office {
        #[command(subcommand)]
        action: Box<OfficeCommand>,
    },
}

#[derive(Subcommand, Debug, Clone)]
pub(crate) enum BugCommand {
    Analyze {
        input_file: String,
    },
    Plan {
        input_file: String,
    },
    Reply {
        input_file: String,
    },
    Prompt {
        input_file: String,
    },
}

#[derive(Subcommand, Debug, Clone)]
pub(crate) enum HarnessCommand {
    Init {
        #[arg(long, default_value = "harness.yaml")]
        config: String,
        #[arg(long, default_value = "starter/app-builder")]
        workflow_id: String,
        #[arg(long, default_value_t = false)]
        force: bool,
    },
    Run {
        #[arg(long, default_value = "harness.yaml")]
        config: String,
        #[arg(long)]
        task: String,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Show {
        #[arg(long, default_value = "harness.yaml")]
        config: String,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
}

#[derive(Subcommand, Debug, Clone)]
pub(crate) enum WorkflowCommand {
    Status {
        id: Option<String>,
    },
    Resume {
        id: String,
    },
    Abort {
        id: String,
    },
    Approve {
        id: String,
        #[arg(long)]
        step: String,
        #[arg(long)]
        by: Option<String>,
        #[arg(long)]
        note: Option<String>,
    },
    Reject {
        id: String,
        #[arg(long)]
        step: String,
        #[arg(long)]
        by: Option<String>,
        #[arg(long)]
        note: Option<String>,
    },
    Trace {
        id: String,
        #[arg(long, default_value_t = false)]
        json: bool,
        #[arg(long, default_value_t = false)]
        timeline: bool,
        #[arg(long, default_value_t = false)]
        otel: bool,
    },
    Check {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Eval {
        dataset: String,
        #[arg(long, default_value_t = 0.8)]
        min_pass_rate: f64,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    QualitySkills {
        #[arg(long, default_value_t = false)]
        strict: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    BuildCatalog {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Bundles {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    ImportSkills {
        source: String,
        #[arg(long)]
        domain: Option<String>,
        #[arg(long, default_value_t = 50)]
        max_skills: usize,
        #[arg(long, default_value_t = false)]
        overwrite: bool,
        #[arg(long, default_value = "local")]
        mode: String,
        #[arg(long, default_value_t = false)]
        allow_missing_license: bool,
        #[arg(long, default_value_t = false)]
        no_catalog_rebuild: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    InstallSkillpack {
        source: String,
        #[arg(long)]
        domain: Option<String>,
        #[arg(long, default_value_t = 50)]
        max_skills: usize,
        #[arg(long, default_value_t = false)]
        overwrite: bool,
        #[arg(long, default_value = "local")]
        mode: String,
        #[arg(long, default_value_t = false)]
        allow_missing_license: bool,
        #[arg(long, default_value_t = false)]
        no_catalog_rebuild: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    SyncImports {
        #[arg(long, default_value_t = false)]
        overwrite: bool,
        #[arg(long, default_value = "local")]
        mode: String,
        #[arg(long, default_value_t = false)]
        allow_missing_license: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    NormalizeImportedSkills {
        #[arg(long, default_value = "local")]
        mode: String,
        #[arg(long, default_value_t = false)]
        dry_run: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    InstallBundle {
        bundle: String,
        #[arg(long, default_value = "local")]
        mode: String,
        #[arg(long, default_value_t = false)]
        overwrite: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    VerifyLock {
        #[arg(long, default_value = "local")]
        mode: String,
        #[arg(long, default_value_t = false)]
        fail_on_extra: bool,
        #[arg(long, default_value_t = false)]
        require_attestation: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    /// Phase 2: Run constraints and guardrails check
    ConstraintsCheck {
        /// Run in fix mode (apply automatic fixes)
        #[arg(long, default_value_t = false)]
        fix: bool,
        /// Check architecture rules only
        #[arg(long, default_value_t = false)]
        arch_only: bool,
        /// Check security gates only
        #[arg(long, default_value_t = false)]
        security_only: bool,
        /// Check lint only
        #[arg(long, default_value_t = false)]
        lint_only: bool,
        /// Output format
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    /// Phase 2: Lint gate for CI/CD - fails on any violation
    LintGate {
        /// Strict mode - fail on warnings too
        #[arg(long, default_value_t = false)]
        strict: bool,
        /// Feature branch mode - only allow src/feature/* changes
        #[arg(long, default_value_t = false)]
        feature_branch: bool,
    },
    IndexGraph {
        #[arg(long, default_value_t = 300)]
        max_files: usize,
        #[arg(long, default_value_t = false)]
        memory_persist: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Doctor {
        /// Print machine-readable doctor report
        #[arg(long, default_value_t = false)]
        json: bool,
        /// Require Ollama to be installed and daemon-responsive
        #[arg(long, default_value_t = false)]
        strict_ollama: bool,
    },
    Setup {
        /// Print machine-readable setup + doctor report
        #[arg(long, default_value_t = false)]
        json: bool,
        /// Require Ollama to be installed and daemon-responsive
        #[arg(long, default_value_t = false)]
        strict_ollama: bool,
    },
    McpRegister {
        name: String,
        #[arg(long, default_value = "stdio")]
        transport: String,
        #[arg(long)]
        command: Option<String>,
        #[arg(long = "arg")]
        args: Vec<String>,
        #[arg(long)]
        url: Option<String>,
        #[arg(long)]
        cwd: Option<String>,
        #[arg(long = "env")]
        env: Vec<String>,
        #[arg(long = "allow-tool")]
        allow_tools: Vec<String>,
        #[arg(long = "deny-tool")]
        deny_tools: Vec<String>,
        #[arg(long, default_value_t = false)]
        disabled: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    McpList {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    McpPing {
        name: Option<String>,
        #[arg(long, default_value_t = 5000)]
        timeout_ms: u64,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    McpPolicy {
        name: String,
        #[arg(long)]
        tool: String,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    StartTemplate {
        template: String,
        #[arg(long)]
        workflow_id: Option<String>,
        #[arg(long)]
        task: String,
    },
    StartRole {
        role: String,
        #[arg(long)]
        task: String,
        #[arg(long)]
        workflow_id: Option<String>,
        #[arg(long)]
        template: Option<String>,
        #[arg(long)]
        thread_id: Option<String>,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    ChatThread {
        thread_id: String,
        #[arg(long)]
        message: String,
        #[arg(long)]
        role: Option<String>,
        #[arg(long)]
        workflow_id: Option<String>,
        #[arg(long)]
        template: Option<String>,
        #[arg(long, default_value = "main")]
        target_branch: String,
        #[arg(long, default_value = "cargo test")]
        validate_command: String,
        #[arg(long, default_value_t = false)]
        no_merge: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Roles {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Templates {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    ThreadFlow {
        thread_id: String,
        #[arg(long, default_value = "main")]
        target_branch: String,
        #[arg(long, default_value = "cargo test")]
        validate_command: String,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Scaffold {
        kind: String,
        name: String,
        #[arg(long, default_value = "advanced")]
        profile: String,
        #[arg(long, default_value_t = false)]
        overwrite: bool,
    },
    ScaffoldDomain {
        domain: String,
        #[arg(long, default_value_t = false)]
        overwrite: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Threads {
        thread_id: Option<String>,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    /// Phase 3: Eval loop with auto-retry until pass rate threshold
    EvalLoop {
        #[arg(default_value = ".agents/evals/phase3_verification.json")]
        dataset: String,
        #[arg(long, default_value_t = 0.9)]
        min_pass: f64,
        #[arg(long, default_value_t = 3)]
        max_iterations: u32,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    /// Phase 4: Full Git PR flow - branch → validate → PR → CI → merge
    GitPrFlow {
        #[arg(help = "Feature branch name (auto-generated if omitted)")]
        branch: Option<String>,
        #[arg(long, default_value = "main")]
        base: String,
        #[arg(long, default_value = "Harness Phase 4: Auto-orchestrated PR")]
        title: String,
        #[arg(
            long,
            default_value = "Auto-generated by agentic-sdlc harness orchestration."
        )]
        body: String,
        #[arg(long, default_value = "cargo test")]
        validate: String,
        #[arg(long, default_value_t = false)]
        draft: bool,
        #[arg(long, default_value_t = false)]
        no_merge: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    List,
    AgentExport {
        target: String,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    McpServe {
        #[arg(long, default_value = "stdio")]
        transport: String,
        #[arg(long, default_value_t = 3100)]
        port: u16,
    },
}

#[derive(Subcommand, Debug, Clone)]
pub(crate) enum OfficeCommand {
    /// Start the office with a task
    Start {
        /// Task description
        task: String,
        /// Run in parallel mode (default)
        #[arg(long, default_value_t = true)]
        parallel: bool,
        /// Roles to include (comma-separated)
        #[arg(long)]
        roles: Option<String>,
    },
    /// Show office status
    Status {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    /// Add a task to the office
    AddTask {
        /// Task title
        title: String,
        /// Task description
        description: String,
        /// Task input
        input: String,
        /// Assign to role
        #[arg(long)]
        role: Option<String>,
    },
    /// Assign task to a role
    Assign {
        /// Task ID
        task_id: String,
        /// Role to assign to
        role: String,
    },
    /// Pause office execution
    Pause,
    /// Resume office execution
    Resume,
    /// Stop office execution
    Stop,
    /// List all roles
    Roles,
    /// Send message between roles
    Message {
        /// From role
        from: String,
        /// To role
        to: String,
        /// Message content
        message: String,
    },
}

#[derive(Debug, Clone)]
pub(crate) struct TemplateRunRequest {
    pub(crate) template: String,
    pub(crate) workflow_id: Option<String>,
    pub(crate) task: String,
}

#[derive(Debug, Clone)]
pub(crate) struct RoleRunRequest {
    pub(crate) role: String,
    pub(crate) task: String,
    pub(crate) workflow_id: Option<String>,
    pub(crate) template: Option<String>,
    pub(crate) thread_id: Option<String>,
    pub(crate) json: bool,
}

#[derive(Debug, Clone)]
pub(crate) struct ChatThreadRequest {
    pub(crate) thread_id: String,
    pub(crate) message: String,
    pub(crate) role: Option<String>,
    pub(crate) workflow_id: Option<String>,
    pub(crate) template: Option<String>,
    pub(crate) target_branch: String,
    pub(crate) validate_command: String,
    pub(crate) no_merge: bool,
    pub(crate) json: bool,
}

#[derive(Debug, Clone)]
pub(crate) struct ThreadFlowRequest {
    pub(crate) thread_id: String,
    pub(crate) target_branch: String,
    pub(crate) validate_command: String,
    pub(crate) json: bool,
}

pub(crate) enum WorkflowLaunchAction {
    Noop,
    Resume { id: String },
    StartTemplate(TemplateRunRequest),
    StartRole(RoleRunRequest),
    ChatThread(ChatThreadRequest),
    ThreadFlow(ThreadFlowRequest),
    StartOffice(OfficeRunRequest),
}

#[derive(Debug, Clone)]
pub(crate) struct OfficeRunRequest {
    pub task: String,
    pub parallel: bool,
    pub roles: Option<String>,
}

#[derive(Debug, Clone)]
pub(crate) struct OfficeAddTaskRequest {
    pub title: String,
    pub description: String,
    pub input: String,
    pub role: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct MarkdownResourceEntry {
    pub(crate) id: String,
    pub(crate) path: String,
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum SkillQualityLevel {
    Error,
    Warning,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct SkillQualityFinding {
    pub(crate) level: SkillQualityLevel,
    pub(crate) message: String,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct SkillQualityEntry {
    pub(crate) id: String,
    pub(crate) path: String,
    pub(crate) domain: String,
    pub(crate) name: String,
    pub(crate) risk: String,
    pub(crate) findings: Vec<SkillQualityFinding>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct SkillQualityReport {
    pub(crate) strict: bool,
    pub(crate) checked_skills: usize,
    pub(crate) errors: usize,
    pub(crate) warnings: usize,
    pub(crate) entries: Vec<SkillQualityEntry>,
}

impl SkillQualityReport {
    pub(crate) fn ok(&self) -> bool {
        self.errors == 0 && (!self.strict || self.warnings == 0)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct SkillCatalogEntry {
    pub(crate) id: String,
    pub(crate) path: String,
    pub(crate) name: String,
    pub(crate) domain: String,
    pub(crate) description: Option<String>,
    pub(crate) risk: Option<String>,
    pub(crate) source: Option<String>,
    pub(crate) tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct WorkflowCatalogEntry {
    pub(crate) id: String,
    pub(crate) path: String,
    pub(crate) name: String,
    pub(crate) domain: Option<String>,
    pub(crate) description: Option<String>,
    pub(crate) steps: usize,
    pub(crate) skills: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct BundleCatalogEntry {
    pub(crate) id: String,
    pub(crate) description: String,
    pub(crate) workflows: Vec<String>,
    pub(crate) skills: Vec<String>,
    pub(crate) roles: Vec<String>,
    pub(crate) templates: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct MarketplaceOwner {
    pub(crate) name: String,
    pub(crate) email: String,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct MarketplaceMetadata {
    pub(crate) description: String,
    pub(crate) version: String,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct MarketplacePlugin {
    pub(crate) name: String,
    pub(crate) description: String,
    pub(crate) source: String,
    pub(crate) strict: bool,
    pub(crate) skills: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct MarketplaceManifest {
    pub(crate) name: String,
    pub(crate) owner: MarketplaceOwner,
    pub(crate) metadata: MarketplaceMetadata,
    pub(crate) plugins: Vec<MarketplacePlugin>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct SkillLockEntry {
    pub(crate) id: String,
    pub(crate) path: String,
    pub(crate) bytes: usize,
    pub(crate) fingerprint: String,
    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) attestation: Option<String>,
    pub(crate) source: Option<String>,
    pub(crate) source_requested: Option<String>,
    pub(crate) source_commit: Option<String>,
    pub(crate) source_path: Option<String>,
    pub(crate) source_license: Option<String>,
    pub(crate) imported_at_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct ImportLockSource {
    pub(crate) source: String,
    pub(crate) source_requested: Option<String>,
    pub(crate) source_commit: Option<String>,
    pub(crate) source_license: Option<String>,
    pub(crate) skills: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct SkillsLockfile {
    pub(crate) version: u32,
    pub(crate) generated_at_ms: u64,
    #[serde(default)]
    pub(crate) skills: Vec<SkillLockEntry>,
    #[serde(default)]
    pub(crate) imports: Vec<ImportLockSource>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct CatalogBuildReport {
    pub(crate) catalog_dir: String,
    pub(crate) outputs: Vec<String>,
    pub(crate) skills: usize,
    pub(crate) workflows: usize,
    pub(crate) bundles: usize,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct ImportSkillsReport {
    pub(crate) mode: String,
    pub(crate) source: String,
    pub(crate) resolved_source: String,
    pub(crate) commit: Option<String>,
    pub(crate) license: Option<String>,
    pub(crate) domain: String,
    pub(crate) imported: usize,
    pub(crate) skipped: usize,
    pub(crate) catalog_rebuilt: bool,
    pub(crate) files: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct SyncImportsReport {
    pub(crate) mode: String,
    pub(crate) lockfile: String,
    pub(crate) sources: usize,
    pub(crate) updated: usize,
    pub(crate) skipped: usize,
    pub(crate) missing: usize,
    pub(crate) catalog_rebuilt: bool,
    pub(crate) files: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct NormalizeImportedSkillChange {
    pub(crate) path: String,
    pub(crate) changed_fields: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct NormalizeImportedSkillSkip {
    pub(crate) path: String,
    pub(crate) reason: String,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct NormalizeImportedSkillsReport {
    pub(crate) mode: String,
    pub(crate) import_dir: String,
    pub(crate) lockfile: String,
    pub(crate) dry_run: bool,
    pub(crate) checked: usize,
    pub(crate) normalized: usize,
    pub(crate) skipped: usize,
    pub(crate) skipped_entries: Vec<NormalizeImportedSkillSkip>,
    pub(crate) changes: Vec<NormalizeImportedSkillChange>,
    pub(crate) catalog_rebuilt: bool,
    pub(crate) files: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct BundleInstallReport {
    pub(crate) mode: String,
    pub(crate) bundle: String,
    pub(crate) target_dir: String,
    pub(crate) installed: usize,
    pub(crate) skipped: usize,
    pub(crate) missing: usize,
    pub(crate) files: Vec<String>,
    pub(crate) missing_skills: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct SkillsLockVerifyReport {
    pub(crate) mode: String,
    pub(crate) lockfile: String,
    pub(crate) ok: bool,
    pub(crate) missing: usize,
    pub(crate) changed: usize,
    pub(crate) extra: usize,
    pub(crate) attestation_missing: usize,
    pub(crate) attestation_invalid: usize,
    pub(crate) missing_entries: Vec<String>,
    pub(crate) changed_entries: Vec<String>,
    pub(crate) extra_entries: Vec<String>,
    pub(crate) attestation_missing_entries: Vec<String>,
    pub(crate) attestation_invalid_entries: Vec<String>,
}

#[derive(Debug, Clone)]
pub(crate) struct ImportSkillpackOptions {
    pub(crate) domain_override: Option<String>,
    pub(crate) max_skills: usize,
    pub(crate) overwrite: bool,
    pub(crate) mode: SkillpackInstallMode,
    pub(crate) allow_missing_license: bool,
    pub(crate) rebuild_catalog: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub(crate) enum SkillpackInstallMode {
    Local,
    Global,
}

impl SkillpackInstallMode {
    pub(crate) fn as_str(self) -> &'static str {
        match self {
            Self::Local => "local",
            Self::Global => "global",
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum DoctorCheckStatus {
    Ok,
    Warning,
    Error,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct DoctorCheckResult {
    pub(crate) name: String,
    pub(crate) status: DoctorCheckStatus,
    pub(crate) message: String,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct DoctorReport {
    pub(crate) ok: bool,
    pub(crate) strict_ollama: bool,
    pub(crate) checks: Vec<DoctorCheckResult>,
    pub(crate) package_check: PackageCheckReport,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct SetupReport {
    pub(crate) created_files: Vec<String>,
    pub(crate) doctor: DoctorReport,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub(crate) enum McpTransport {
    Stdio,
    Http,
    Sse,
}

impl McpTransport {
    pub(crate) fn as_str(&self) -> &'static str {
        match self {
            Self::Stdio => "stdio",
            Self::Http => "http",
            Self::Sse => "sse",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct McpServerConfig {
    pub(crate) name: String,
    pub(crate) transport: McpTransport,
    pub(crate) command: Option<String>,
    #[serde(default)]
    pub(crate) args: Vec<String>,
    pub(crate) url: Option<String>,
    pub(crate) cwd: Option<String>,
    #[serde(default)]
    pub(crate) env: std::collections::BTreeMap<String, String>,
    #[serde(default)]
    pub(crate) allow_tools: Vec<String>,
    #[serde(default)]
    pub(crate) deny_tools: Vec<String>,
    pub(crate) enabled: bool,
    pub(crate) created_at_ms: u64,
    pub(crate) updated_at_ms: u64,
    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) last_ping_ok: Option<bool>,
    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) last_ping_at_ms: Option<u64>,
    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) last_ping_latency_ms: Option<u64>,
    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) last_ping_detail: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct McpRegistry {
    pub(crate) version: u32,
    pub(crate) generated_at_ms: u64,
    #[serde(default)]
    pub(crate) servers: Vec<McpServerConfig>,
}

impl Default for McpRegistry {
    fn default() -> Self {
        Self {
            version: 1,
            generated_at_ms: 0,
            servers: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct McpServerListEntry {
    pub(crate) name: String,
    pub(crate) transport: String,
    pub(crate) enabled: bool,
    pub(crate) command: Option<String>,
    pub(crate) args: Vec<String>,
    pub(crate) url: Option<String>,
    pub(crate) cwd: Option<String>,
    pub(crate) env_keys: Vec<String>,
    pub(crate) allow_tools: Vec<String>,
    pub(crate) deny_tools: Vec<String>,
    pub(crate) created_at_ms: u64,
    pub(crate) updated_at_ms: u64,
    pub(crate) last_ping_ok: Option<bool>,
    pub(crate) last_ping_at_ms: Option<u64>,
    pub(crate) last_ping_latency_ms: Option<u64>,
    pub(crate) last_ping_detail: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct McpRegisterReport {
    pub(crate) action: String,
    pub(crate) registry_path: String,
    pub(crate) server: McpServerListEntry,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct McpListReport {
    pub(crate) registry_path: String,
    pub(crate) total: usize,
    pub(crate) enabled: usize,
    pub(crate) servers: Vec<McpServerListEntry>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct McpPingServerReport {
    pub(crate) name: String,
    pub(crate) transport: String,
    pub(crate) enabled: bool,
    pub(crate) ok: bool,
    pub(crate) latency_ms: u64,
    pub(crate) detail: String,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct McpPingReport {
    pub(crate) registry_path: String,
    pub(crate) checked: usize,
    pub(crate) passed: usize,
    pub(crate) failed: usize,
    pub(crate) timeout_ms: u64,
    pub(crate) results: Vec<McpPingServerReport>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct McpPolicyReport {
    pub(crate) registry_path: String,
    pub(crate) name: String,
    pub(crate) transport: String,
    pub(crate) enabled: bool,
    pub(crate) tool: String,
    pub(crate) allowed: bool,
    pub(crate) reason: String,
    pub(crate) allow_tools: Vec<String>,
    pub(crate) deny_tools: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct GraphIndexNodeDoc {
    pub(crate) id: String,
    pub(crate) text: String,
    pub(crate) tags: Vec<String>,
    pub(crate) links: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct GraphIndexPayloadDoc {
    pub(crate) nodes: Vec<GraphIndexNodeDoc>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct GraphIndexBuildReport {
    pub(crate) index_path: String,
    pub(crate) nodes: usize,
    pub(crate) edges: usize,
    pub(crate) context_db_path: String,
    pub(crate) context_vector_table: String,
    pub(crate) context_graph_table: String,
    pub(crate) vector_entries: usize,
    pub(crate) graph_entries: usize,
}

#[derive(Debug, Clone)]
pub(crate) struct ContextSqliteWriteReport {
    pub(crate) db_path: String,
    pub(crate) vector_table: String,
    pub(crate) graph_table: String,
    pub(crate) vector_entries: usize,
    pub(crate) graph_entries: usize,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct StepRunSummary {
    pub(crate) step_id: String,
    pub(crate) status: String,
    pub(crate) duration_ms: Option<u64>,
    pub(crate) provider: Option<String>,
    pub(crate) model: Option<String>,
    pub(crate) summary: Option<String>,
    pub(crate) actions: usize,
    pub(crate) risks: usize,
    pub(crate) error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct ThreadRunSummary {
    pub(crate) instance_id: String,
    pub(crate) workflow_name: String,
    pub(crate) status: String,
    pub(crate) trace_id: String,
    pub(crate) completed_steps: usize,
    pub(crate) failed_steps: usize,
    pub(crate) total_steps: usize,
    pub(crate) step_details: Vec<StepRunSummary>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct ChatThreadRunReport {
    pub(crate) thread_id: String,
    pub(crate) branch: String,
    pub(crate) selected_workflow: String,
    pub(crate) selected_template: String,
    pub(crate) selected_role: String,
    pub(crate) implementation: ThreadRunSummary,
    pub(crate) merge: Option<ThreadRunSummary>,
}

#[derive(Debug, Clone, Deserialize)]
pub(crate) struct WorkflowEvalDataset {
    #[serde(default)]
    pub(crate) name: Option<String>,
    pub(crate) cases: Vec<WorkflowEvalCase>,
}

#[derive(Debug, Clone, Deserialize)]
pub(crate) struct WorkflowEvalCase {
    pub(crate) id: String,
    #[serde(default)]
    pub(crate) report: serde_json::Value,
    #[serde(default)]
    pub(crate) min_actions: Option<usize>,
    #[serde(default)]
    pub(crate) min_risks: Option<usize>,
    #[serde(default)]
    pub(crate) min_summary_chars: Option<usize>,
    #[serde(default)]
    pub(crate) required_summary_keywords: Vec<String>,
    #[serde(default)]
    pub(crate) required_action_keywords: Vec<String>,
    #[serde(default)]
    pub(crate) required_risk_keywords: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct WorkflowEvalCaseResult {
    pub(crate) id: String,
    pub(crate) passed: bool,
    pub(crate) summary_chars: usize,
    pub(crate) actions: usize,
    pub(crate) risks: usize,
    pub(crate) findings: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct WorkflowEvalReport {
    pub(crate) dataset: String,
    pub(crate) cases: usize,
    pub(crate) passed: usize,
    pub(crate) failed: usize,
    pub(crate) pass_rate: f64,
    pub(crate) min_pass_rate: f64,
    pub(crate) ok: bool,
    pub(crate) results: Vec<WorkflowEvalCaseResult>,
}

/// Phase 4: Git PR flow report
#[derive(Debug, Clone, Serialize)]
pub(crate) struct GitPrFlowReport {
    pub(crate) success: bool,
    pub(crate) current_step: String,
    pub(crate) branch: String,
    pub(crate) pr_number: Option<u64>,
    pub(crate) pr_url: Option<String>,
    pub(crate) merged: bool,
    pub(crate) error: Option<String>,
}

/// Phase 2: Constraint check violation
#[derive(Debug, Clone, Serialize)]
pub(crate) struct ConstraintCheckViolation {
    pub(crate) rule: String,
    pub(crate) file: String,
    pub(crate) message: String,
    pub(crate) fix: Option<String>,
}

/// Phase 2: Constraint check fix command
#[derive(Debug, Clone, Serialize)]
pub(crate) struct ConstraintCheckCommand {
    pub(crate) step: String,
    pub(crate) command: String,
}

/// Phase 2: Constraint check report
#[derive(Debug, Clone, Serialize)]
pub(crate) struct ConstraintCheckReport {
    pub(crate) status: String,
    pub(crate) violations: Vec<ConstraintCheckViolation>,
    pub(crate) commands: Vec<ConstraintCheckCommand>,
    pub(crate) gate_result: String,
    pub(crate) next_step: String,
}
#[derive(Debug, Clone, Serialize)]
pub(crate) struct AgentExportReport {
    pub(crate) target: String,
    pub(crate) files: Vec<String>,
    pub(crate) karpathy_enabled: bool,
}
