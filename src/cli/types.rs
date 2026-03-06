use super::*;

#[derive(Subcommand, Debug, Clone)]
pub(crate) enum Commands {
    Workflow {
        #[command(subcommand)]
        action: WorkflowCommand,
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
        json: bool,
    },
    IndexGraph {
        #[arg(long, default_value_t = 300)]
        max_files: usize,
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
    List,
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
    pub(crate) missing_entries: Vec<String>,
    pub(crate) changed_entries: Vec<String>,
    pub(crate) extra_entries: Vec<String>,
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
