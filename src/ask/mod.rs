use crate::engine::context_retrieval::{
    ContextRetrievalService, GraphIndexContextRetrievalService, HybridContextRetrievalService,
    NoopContextRetrievalService, RetrievedContextItem, VectorIndexContextRetrievalService,
};
use crate::engine::project::AgentProjectLayout;
use crate::plan::{self, PlanOutput};
use crate::skills::llm_subagent::LlmSubAgentSkill;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize)]
pub(crate) struct AskHit {
    pub(crate) id: String,
    pub(crate) source: String,
    pub(crate) score: f64,
    pub(crate) excerpt: String,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct AskResponse {
    pub(crate) schema_version: String,
    pub(crate) question: String,
    pub(crate) intent: String,
    pub(crate) answer: String,
    pub(crate) retrieval_mode: String,
    pub(crate) project_root: String,
    pub(crate) synthesis_mode: String,
    pub(crate) requires_plan: bool,
    pub(crate) confidence: f64,
    pub(crate) action_proposal: Option<AskActionProposal>,
    pub(crate) plan_request: Option<AskPlanRequest>,
    pub(crate) hits: Vec<AskHit>,
    pub(crate) evidence: Vec<String>,
    pub(crate) next_steps: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct AskActionProposal {
    pub(crate) action_type: String,
    pub(crate) reason: String,
    pub(crate) suggested_command: String,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct AskPlanRequest {
    pub(crate) goal: String,
    pub(crate) constraints: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct AskPlanHandoff {
    pub(crate) schema_version: String,
    pub(crate) ask_response: AskResponse,
    pub(crate) plan_output: Option<PlanOutput>,
}

#[derive(Debug, Clone)]
struct AskContextPack {
    project_identity: Option<String>,
    manifest_summary: String,
    manifest_details: Vec<String>,
    top_level_dirs: Vec<String>,
    source_samples: Vec<String>,
    readme_excerpt: Option<String>,
    retrieved_snippets: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
struct AskAiOutput {
    answer: String,
    #[serde(default)]
    evidence: Vec<String>,
    #[serde(default)]
    next_steps: Vec<String>,
}

pub(crate) async fn run_ask(
    layout: &AgentProjectLayout,
    question: &str,
    limit: usize,
    json: bool,
) -> Result<()> {
    let response = answer_question(layout, question, limit).await?;
    if json {
        println!("{}", serde_json::to_string_pretty(&response)?);
    } else {
        println!("{}", response.answer);
        println!(
            "\nIntent: {} | requires_plan={} | confidence={:.2}",
            response.intent, response.requires_plan, response.confidence
        );
        if let Some(action) = response.action_proposal.as_ref() {
            println!(
                "Action: {} ({}) -> {}",
                action.action_type, action.reason, action.suggested_command
            );
        }
        if !response.evidence.is_empty() {
            println!("\nEvidence:");
            for line in response.evidence.iter().take(3) {
                println!("- {}", line);
            }
        }
        if !response.next_steps.is_empty() {
            println!("\nNext:");
            for step in &response.next_steps {
                println!("- {}", step);
            }
        }
    }
    Ok(())
}

pub(crate) async fn run_handoff(
    layout: &AgentProjectLayout,
    question: &str,
    limit: usize,
    json: bool,
) -> Result<()> {
    let ask_response = answer_question(layout, question, limit).await?;
    let plan_output = if let Some(plan_request) = ask_response.plan_request.as_ref() {
        let plan = plan::generate_plan(layout, &plan_request.goal);
        let verification = plan::verify_plan(&plan);
        Some(PlanOutput {
            schema_version: "plan.v1".to_string(),
            plan,
            verification,
        })
    } else {
        None
    };
    let handoff = AskPlanHandoff {
        schema_version: "handoff.v1".to_string(),
        ask_response,
        plan_output,
    };
    if json {
        println!("{}", serde_json::to_string_pretty(&handoff)?);
    } else {
        println!("Handoff schema={}", handoff.schema_version);
        println!(
            "Ask intent={} requires_plan={}",
            handoff.ask_response.intent, handoff.ask_response.requires_plan
        );
        if let Some(plan) = handoff.plan_output.as_ref() {
            println!(
                "Plan schema={} tasks={} verify={}",
                plan.schema_version,
                plan.plan.tasks.len(),
                if plan.verification.ok { "pass" } else { "fail" }
            );
        } else {
            println!("No plan generated for this question.");
        }
    }
    Ok(())
}

async fn answer_question(
    layout: &AgentProjectLayout,
    question: &str,
    limit: usize,
) -> Result<AskResponse> {
    let trimmed = question.trim();
    let intent = detect_intent(trimmed);
    let (retrieval_mode, service) = retrieval_service_from_env();
    let hits = rerank_hits(
        trimmed,
        intent,
        service.retrieve(trimmed, limit.clamp(1, 12).saturating_mul(3))?,
        limit.clamp(1, 12),
    );
    let ask_hits = hits
        .iter()
        .map(|item| AskHit {
            id: item.id.clone(),
            source: item.source.clone(),
            score: item.score,
            excerpt: truncate_excerpt(&item.text, 180),
        })
        .collect::<Vec<_>>();
    let context_pack = build_context_pack(layout, &hits)?;
    let fallback_answer = render_answer(layout, trimmed, intent, &context_pack, &hits);
    let fallback_evidence = build_evidence_lines(intent, &context_pack, &hits);
    let fallback_next_steps = build_next_steps(trimmed, &context_pack, &hits);
    let (answer, evidence, next_steps, synthesis_mode) =
        match synthesize_answer_with_ai(trimmed, intent, &context_pack).await {
            Ok(ai) if !ai.answer.trim().is_empty() => (
                ai.answer.trim().to_string(),
                if ai.evidence.is_empty() {
                    fallback_evidence.clone()
                } else {
                    ai.evidence
                },
                if ai.next_steps.is_empty() {
                    fallback_next_steps.clone()
                } else {
                    ai.next_steps
                },
                "ai".to_string(),
            ),
            _ => (
                fallback_answer,
                fallback_evidence,
                fallback_next_steps,
                "deterministic_fallback".to_string(),
            ),
        };

    Ok(AskResponse {
        schema_version: "ask.v1".to_string(),
        question: trimmed.to_string(),
        intent: intent.as_str().to_string(),
        answer,
        retrieval_mode,
        project_root: layout.project_root.clone(),
        synthesis_mode,
        requires_plan: should_require_plan(trimmed, intent),
        confidence: estimate_confidence(&hits),
        action_proposal: build_action_proposal(trimmed, intent, &hits),
        plan_request: build_plan_request(trimmed, intent),
        hits: ask_hits,
        evidence,
        next_steps,
    })
}

fn retrieval_service_from_env() -> (String, Box<dyn ContextRetrievalService>) {
    let mode = std::env::var("AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE")
        .ok()
        .map(|value| value.trim().to_ascii_lowercase())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "hybrid".to_string());
    match mode.as_str() {
        "off" | "disabled" | "none" => ("off".to_string(), Box::new(NoopContextRetrievalService)),
        "graph" => (
            "graph".to_string(),
            Box::new(GraphIndexContextRetrievalService::from_env()),
        ),
        "vector" => (
            "vector".to_string(),
            Box::new(VectorIndexContextRetrievalService::from_env()),
        ),
        _ => (
            "hybrid".to_string(),
            Box::new(HybridContextRetrievalService::from_env()),
        ),
    }
}

fn render_answer(
    layout: &AgentProjectLayout,
    question: &str,
    intent: AskIntent,
    context: &AskContextPack,
    hits: &[RetrievedContextItem],
) -> String {
    if hits.is_empty() {
        if intent == AskIntent::Overview {
            return format!(
                "Project overview: {}. No indexed source match was strong enough yet, so run `asd index` again after adding real project files if needed.",
                detect_project_manifests(&layout.project_root)
            );
        }
        return format!(
            "No indexed context matched '{}'. Run `asd index` in this repository, then retry with a more specific question.",
            question
        );
    }
    match intent {
        AskIntent::Overview => render_overview_answer(layout, context, hits),
        AskIntent::BugLocation => render_bug_location_answer(question, hits),
        AskIntent::NextStep => render_next_step_answer(layout, hits),
        AskIntent::Generic => render_generic_answer(question, hits),
    }
}

fn build_context_pack(
    layout: &AgentProjectLayout,
    hits: &[RetrievedContextItem],
) -> Result<AskContextPack> {
    let root = Path::new(&layout.project_root);
    let mut manifest_details = Vec::new();
    for manifest in ["package.json", "Cargo.toml", "pyproject.toml", "go.mod"] {
        let path = root.join(manifest);
        if path.exists() {
            let body = fs::read_to_string(&path).unwrap_or_default();
            manifest_details.push(format!("{}: {}", manifest, truncate_excerpt(&body, 280)));
        }
    }

    let mut top_level_dirs = Vec::new();
    let mut source_samples = Vec::new();
    if let Ok(entries) = fs::read_dir(root) {
        for entry in entries.flatten() {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            if path.is_dir() {
                if matches!(
                    name.as_str(),
                    ".git" | ".agents" | "node_modules" | "target"
                ) {
                    continue;
                }
                if name.starts_with('.') {
                    continue;
                }
                top_level_dirs.push(name);
            } else if source_samples.len() < 6
                && matches!(
                    path.extension()
                        .and_then(|v| v.to_str())
                        .unwrap_or_default(),
                    "rs" | "ts" | "tsx" | "js" | "go" | "py"
                )
            {
                let body = fs::read_to_string(&path).unwrap_or_default();
                source_samples.push(format!(
                    "{}: {}",
                    path.file_name().and_then(|v| v.to_str()).unwrap_or("?"),
                    truncate_excerpt(&body, 220)
                ));
            }
        }
    }
    top_level_dirs.sort_by_key(|name| (directory_priority(name), name.clone()));

    for preferred in ["src", "app", "lib", "packages"] {
        let preferred_dir = root.join(preferred);
        if preferred_dir.exists() {
            collect_source_samples(&preferred_dir, preferred, &mut source_samples)?;
        }
    }
    source_samples.truncate(8);

    let readme_excerpt = ["README.md", "readme.md"]
        .iter()
        .map(|name| root.join(name))
        .find(|path| path.exists())
        .and_then(|path| fs::read_to_string(path).ok())
        .map(|body| truncate_excerpt(&body, 500));

    let retrieved_snippets = hits
        .iter()
        .take(6)
        .map(|hit| format!("{}: {}", hit.id, truncate_excerpt(&hit.text, 180)))
        .collect::<Vec<_>>();

    Ok(AskContextPack {
        project_identity: detect_project_identity(root),
        manifest_summary: detect_project_manifests(&layout.project_root),
        manifest_details,
        top_level_dirs,
        source_samples,
        readme_excerpt,
        retrieved_snippets,
    })
}

fn collect_source_samples(root: &Path, label: &str, out: &mut Vec<String>) -> Result<()> {
    if !root.exists() {
        return Ok(());
    }
    let mut stack = vec![root.to_path_buf()];
    while let Some(current) = stack.pop() {
        let entries = match fs::read_dir(current) {
            Ok(entries) => entries,
            Err(_) => continue,
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                stack.push(path);
                continue;
            }
            if out.len() >= 8 {
                return Ok(());
            }
            let ext = path
                .extension()
                .and_then(|v| v.to_str())
                .unwrap_or_default();
            if !matches!(
                ext,
                "rs" | "ts" | "tsx" | "js" | "go" | "py" | "md" | "json"
            ) {
                continue;
            }
            let body = fs::read_to_string(&path).unwrap_or_default();
            let rel = path.strip_prefix(root).unwrap_or(&path).to_string_lossy();
            out.push(format!(
                "{}:{}: {}",
                label,
                rel,
                truncate_excerpt(&body, 220)
            ));
        }
    }
    Ok(())
}

async fn synthesize_answer_with_ai(
    question: &str,
    intent: AskIntent,
    context: &AskContextPack,
) -> Result<AskAiOutput> {
    let skill = LlmSubAgentSkill::new();
    let prompt = build_ask_prompt(question, intent, context);
    let result = skill.synthesize_text(&prompt).await?;
    parse_ask_ai_output(&result.text)
}

fn build_ask_prompt(question: &str, intent: AskIntent, context: &AskContextPack) -> String {
    format!(
        "You are answering questions about a local software repository.\n\
Use only the provided repository context.\n\
Do not invent files, features, or architecture that are not grounded in the context.\n\
Prefer explaining what the project appears to do and why, instead of listing many file paths.\n\
Mention file paths only as supporting evidence.\n\
If the evidence is weak, say that clearly.\n\
Return strict JSON with this shape:\n\
{{\"answer\":\"...\",\"evidence\":[\"...\"],\"next_steps\":[\"...\"]}}\n\n\
Question intent: {:?}\n\
User question: {}\n\n\
Project manifest summary:\n{}\n\n\
Project identity:\n{}\n\n\
Manifest details:\n{}\n\n\
Top-level directories:\n{}\n\n\
README excerpt:\n{}\n\n\
Representative source samples:\n{}\n\n\
Retrieved snippets related to the question:\n{}\n",
        intent,
        question,
        context.manifest_summary,
        context.project_identity.as_deref().unwrap_or("-"),
        if context.manifest_details.is_empty() {
            "-".to_string()
        } else {
            context.manifest_details.join("\n")
        },
        if context.top_level_dirs.is_empty() {
            "-".to_string()
        } else {
            context.top_level_dirs.join(", ")
        },
        context.readme_excerpt.as_deref().unwrap_or("-"),
        if context.source_samples.is_empty() {
            "-".to_string()
        } else {
            context.source_samples.join("\n")
        },
        if context.retrieved_snippets.is_empty() {
            "-".to_string()
        } else {
            context.retrieved_snippets.join("\n")
        }
    )
}

fn parse_ask_ai_output(text: &str) -> Result<AskAiOutput> {
    let payload = extract_json_object(text)
        .ok_or_else(|| anyhow::anyhow!("AI ask response did not contain JSON"))?;
    Ok(serde_json::from_value(payload)?)
}

fn extract_json_object(text: &str) -> Option<serde_json::Value> {
    if let Ok(value) = serde_json::from_str::<serde_json::Value>(text.trim()) {
        if value.is_object() {
            return Some(value);
        }
    }
    let start = text.find('{')?;
    let end = text.rfind('}')?;
    if end <= start {
        return None;
    }
    serde_json::from_str::<serde_json::Value>(&text[start..=end]).ok()
}

fn build_evidence_lines(
    intent: AskIntent,
    context: &AskContextPack,
    hits: &[RetrievedContextItem],
) -> Vec<String> {
    let prioritized = prefer_source_hits(hits);
    let mut lines = Vec::new();
    if matches!(intent, AskIntent::Overview) || prioritized.is_empty() {
        for sample in context.source_samples.iter().take(3) {
            if let Some(evidence) = source_sample_evidence(sample) {
                lines.push(evidence);
            }
        }
    }
    lines.extend(
        prioritized
            .iter()
            .take(3)
            .map(|hit| format!("{}: {}", hit.id, truncate_excerpt(&hit.text, 120))),
    );
    lines.dedup();
    lines.truncate(3);
    lines
}

fn rerank_hits(
    question: &str,
    intent: AskIntent,
    hits: Vec<RetrievedContextItem>,
    limit: usize,
) -> Vec<RetrievedContextItem> {
    let lower = question.to_ascii_lowercase();
    let asks_about_framework = lower.contains("workflow")
        || lower.contains("template")
        || lower.contains("role")
        || lower.contains("skill")
        || lower.contains(".agents")
        || lower.contains("agent");

    let mut scored = hits
        .into_iter()
        .map(|item| {
            let mut adjusted = item.score;
            let is_framework_file = item.id.starts_with(".agents/");
            let is_source_file = item.id.starts_with("src/")
                || item.id.starts_with("app/")
                || item.id.starts_with("lib/")
                || item.id.starts_with("packages/")
                || item.id.ends_with(".rs")
                || item.id.ends_with(".ts")
                || item.id.ends_with(".tsx")
                || item.id.ends_with(".js")
                || item.id.ends_with(".go")
                || item.id.ends_with(".py");

            if !asks_about_framework && is_framework_file {
                adjusted -= 0.20;
            }
            if matches!(intent, AskIntent::BugLocation | AskIntent::Generic) && is_source_file {
                adjusted += 0.15;
            }
            if matches!(intent, AskIntent::Overview | AskIntent::NextStep) && !is_framework_file {
                adjusted += 0.10;
            }
            if matches!(intent, AskIntent::Overview) && is_source_file {
                adjusted += 0.12;
            }

            (adjusted, item)
        })
        .collect::<Vec<_>>();
    scored.sort_by(|a, b| {
        b.0.partial_cmp(&a.0)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then_with(|| a.1.id.cmp(&b.1.id))
    });
    scored
        .into_iter()
        .map(|(_, item)| item)
        .take(limit)
        .collect()
}

fn render_overview_answer(
    layout: &AgentProjectLayout,
    context: &AskContextPack,
    hits: &[RetrievedContextItem],
) -> String {
    let manifest_summary = detect_project_manifests(&layout.project_root);
    let identity = context
        .project_identity
        .as_deref()
        .unwrap_or("This repository");
    let primary_areas = summarize_primary_areas(context);
    let source_shape = summarize_source_shape(context, hits);
    let readme_signal = summarize_readme_signal(context);
    format!(
        "{} is {}. Primary areas: {}. {}{}",
        identity,
        manifest_summary,
        primary_areas,
        source_shape,
        if readme_signal.is_empty() {
            String::new()
        } else {
            format!(" {}", readme_signal)
        }
    )
}

fn render_bug_location_answer(question: &str, hits: &[RetrievedContextItem]) -> String {
    let prioritized = prefer_source_hits(hits);
    let primary = prioritized
        .first()
        .map(describe_hit_content)
        .unwrap_or_else(|| "no strong source match".to_string());
    let secondary = prioritized
        .get(1)
        .map(describe_hit_content)
        .unwrap_or_default();
    format!(
        "For '{}', the strongest match is {}{}. This is based on indexed source content, not only file names.",
        question,
        primary,
        if secondary.is_empty() {
            String::new()
        } else {
            format!("; a supporting match is {}", secondary)
        }
    )
}

fn render_next_step_answer(layout: &AgentProjectLayout, hits: &[RetrievedContextItem]) -> String {
    let manifest_summary = detect_project_manifests(&layout.project_root);
    let prioritized = prefer_source_hits(hits);
    let top_file = prioritized
        .first()
        .map(|item| item.id.as_str())
        .unwrap_or(".agents/workflows");
    format!(
        "Next practical step: inspect {}, read the indexed implementation there first, then run `asd workflow check` if you need package validation. Project shape detected: {}.",
        top_file, manifest_summary
    )
}

fn render_generic_answer(question: &str, hits: &[RetrievedContextItem]) -> String {
    let prioritized = prefer_source_hits(hits);
    let evidence = prioritized
        .iter()
        .take(2)
        .map(describe_hit_content)
        .collect::<Vec<_>>()
        .join(" | ");
    format!(
        "Based on the indexed repository content for '{}': {}.",
        question, evidence
    )
}

fn prefer_source_hits(hits: &[RetrievedContextItem]) -> Vec<RetrievedContextItem> {
    let mut source_hits = hits
        .iter()
        .filter(|item| !item.id.starts_with(".agents/"))
        .cloned()
        .collect::<Vec<_>>();
    if source_hits.is_empty() {
        hits.to_vec()
    } else {
        source_hits.extend(
            hits.iter()
                .filter(|item| item.id.starts_with(".agents/"))
                .cloned(),
        );
        source_hits
    }
}

fn describe_hit_content(hit: &RetrievedContextItem) -> String {
    format!("{} says '{}'", hit.id, truncate_excerpt(&hit.text, 90))
}

fn detect_project_manifests(project_root: &str) -> String {
    let root = Path::new(project_root);
    let mut found = Vec::new();
    for manifest in ["Cargo.toml", "package.json", "pyproject.toml", "go.mod"] {
        if root.join(manifest).exists() {
            found.push(manifest);
        }
    }
    if found.is_empty() {
        "generic repository with no common language manifest".to_string()
    } else {
        format!("repository with {}", found.join(", "))
    }
}

fn detect_project_identity(root: &Path) -> Option<String> {
    let package_json = root.join("package.json");
    if package_json.exists() {
        if let Ok(body) = fs::read_to_string(&package_json) {
            if let Ok(value) = serde_json::from_str::<serde_json::Value>(&body) {
                let name = value
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("project");
                let description = value
                    .get("description")
                    .and_then(|v| v.as_str())
                    .map(str::trim)
                    .filter(|v| !v.is_empty());
                return Some(match description {
                    Some(desc) => format!("Project '{}' ({})", name, desc),
                    None => format!("Project '{}'", name),
                });
            }
        }
    }

    let cargo_toml = root.join("Cargo.toml");
    if cargo_toml.exists() {
        if let Ok(body) = fs::read_to_string(&cargo_toml) {
            if let Ok(value) = toml::from_str::<toml::Value>(&body) {
                if let Some(package) = value.get("package").and_then(|v| v.as_table()) {
                    let name = package
                        .get("name")
                        .and_then(|v| v.as_str())
                        .unwrap_or("project");
                    let description = package
                        .get("description")
                        .and_then(|v| v.as_str())
                        .map(str::trim)
                        .filter(|v| !v.is_empty());
                    return Some(match description {
                        Some(desc) => format!("Project '{}' ({})", name, desc),
                        None => format!("Project '{}'", name),
                    });
                }
            }
        }
    }

    let go_mod = root.join("go.mod");
    if go_mod.exists() {
        if let Ok(body) = fs::read_to_string(&go_mod) {
            for line in body.lines() {
                let trimmed = line.trim();
                if let Some(module) = trimmed.strip_prefix("module ") {
                    return Some(format!("Go module '{}'", module.trim()));
                }
            }
        }
    }

    let pyproject = root.join("pyproject.toml");
    if pyproject.exists() {
        if let Ok(body) = fs::read_to_string(&pyproject) {
            if let Ok(value) = toml::from_str::<toml::Value>(&body) {
                if let Some(project) = value.get("project").and_then(|v| v.as_table()) {
                    let name = project
                        .get("name")
                        .and_then(|v| v.as_str())
                        .unwrap_or("project");
                    let description = project
                        .get("description")
                        .and_then(|v| v.as_str())
                        .map(str::trim)
                        .filter(|v| !v.is_empty());
                    return Some(match description {
                        Some(desc) => format!("Project '{}' ({})", name, desc),
                        None => format!("Project '{}'", name),
                    });
                }
            }
        }
    }

    None
}

fn summarize_primary_areas(context: &AskContextPack) -> String {
    if !context.top_level_dirs.is_empty() {
        let joined = context
            .top_level_dirs
            .iter()
            .take(5)
            .cloned()
            .collect::<Vec<_>>()
            .join(", ");
        return format!("top-level directories include {}", joined);
    }

    if !context.source_samples.is_empty() {
        let joined = context
            .source_samples
            .iter()
            .take(3)
            .filter_map(|sample| sample.split(':').nth(1))
            .map(str::trim)
            .map(truncate_to_label)
            .collect::<Vec<_>>()
            .join("; ");
        if !joined.is_empty() {
            return format!("representative files indicate {}", joined);
        }
    }

    "the repo currently exposes little non-framework structure beyond the agent package".to_string()
}

fn summarize_source_shape(context: &AskContextPack, hits: &[RetrievedContextItem]) -> String {
    if !context.source_samples.is_empty() {
        let examples = context
            .source_samples
            .iter()
            .take(3)
            .filter_map(|sample| sample.split(':').nth(1))
            .map(str::trim)
            .collect::<Vec<_>>()
            .join(", ");
        if !examples.is_empty() {
            return format!("Representative indexed source files include {}.", examples);
        }
    }
    let prioritized = prefer_source_hits(hits);
    let non_framework_hits = prioritized
        .iter()
        .filter(|item| !item.id.starts_with(".agents/"))
        .cloned()
        .collect::<Vec<_>>();
    if !non_framework_hits.is_empty() {
        return format!(
            "Indexed source points mostly to {}.",
            summarize_hit_files(&non_framework_hits)
        );
    }
    if !context.source_samples.is_empty() {
        return "Indexed source samples exist, but the strongest matches are still thin."
            .to_string();
    }
    "Most indexed material right now is framework/bootstrap content rather than application code."
        .to_string()
}

fn summarize_readme_signal(context: &AskContextPack) -> String {
    match context.readme_excerpt.as_deref() {
        Some(readme) if !readme.trim().is_empty() => {
            format!("README suggests: {}.", truncate_excerpt(readme, 160))
        }
        _ => String::new(),
    }
}

fn truncate_to_label(value: &str) -> String {
    let compact = value.split_whitespace().collect::<Vec<_>>().join(" ");
    truncate_excerpt(&compact, 72)
}

fn source_sample_path(sample: &str) -> Option<String> {
    let mut parts = sample.splitn(3, ':');
    let first = parts.next()?.trim();
    let second = parts.next().map(str::trim).unwrap_or_default();
    if second.contains('/') {
        Some(second.to_string())
    } else if matches!(
        first,
        "src" | "app" | "lib" | "packages" | "cmd" | "internal"
    ) && !second.is_empty()
    {
        Some(format!("{}/{}", first, second))
    } else if second.contains('.') {
        Some(second.to_string())
    } else {
        Some(first.to_string())
    }
}

fn source_sample_evidence(sample: &str) -> Option<String> {
    let mut parts = sample.splitn(3, ':');
    let first = parts.next()?.trim();
    let second = parts.next().map(str::trim).unwrap_or_default();
    let third = parts.next().map(str::trim).unwrap_or_default();
    if third.is_empty() {
        return Some(sample.to_string());
    }
    let path = if second.contains('/') {
        second
    } else if matches!(
        first,
        "src" | "app" | "lib" | "packages" | "cmd" | "internal"
    ) && !second.is_empty()
    {
        return Some(format!(
            "{}/{}: {}",
            first,
            second,
            truncate_excerpt(third, 120)
        ));
    } else if second.contains('.') {
        second
    } else {
        first
    };
    Some(format!("{}: {}", path, truncate_excerpt(third, 120)))
}

fn directory_priority(name: &str) -> usize {
    match name {
        "src" | "app" | "lib" | "packages" | "cmd" | "internal" => 0,
        "docs" | "examples" | "scripts" | "test" | "tests" => 1,
        _ => 2,
    }
}

fn summarize_hit_files(hits: &[RetrievedContextItem]) -> String {
    let mut ext_counts = BTreeMap::<String, usize>::new();
    let mut top_dirs = BTreeSet::<String>::new();
    for item in hits.iter().take(6) {
        if let Some(ext) = Path::new(&item.id)
            .extension()
            .and_then(|value| value.to_str())
        {
            *ext_counts.entry(ext.to_ascii_lowercase()).or_default() += 1;
        }
        if let Some(first) = item.id.split('/').next() {
            if !first.is_empty() {
                top_dirs.insert(first.to_string());
            }
        }
    }
    let ext_summary = ext_counts
        .into_iter()
        .map(|(ext, count)| format!("{} .{}", count, ext))
        .collect::<Vec<_>>()
        .join(", ");
    let dir_summary = top_dirs.into_iter().take(4).collect::<Vec<_>>().join(", ");
    match (ext_summary.is_empty(), dir_summary.is_empty()) {
        (false, false) => format!("{} files across {}", ext_summary, dir_summary),
        (false, true) => format!("{} files", ext_summary),
        (true, false) => format!("paths under {}", dir_summary),
        (true, true) => "indexed repository files".to_string(),
    }
}

fn summarize_hit_evidence(hits: &[RetrievedContextItem], count: usize) -> String {
    hits.iter()
        .take(count)
        .map(|item| format!("{}: {}", item.id, truncate_excerpt(&item.text, 72)))
        .collect::<Vec<_>>()
        .join(" | ")
}

fn truncate_excerpt(value: &str, max_chars: usize) -> String {
    let compact = value.split_whitespace().collect::<Vec<_>>().join(" ");
    if compact.chars().count() <= max_chars {
        compact
    } else {
        let mut out = compact.chars().take(max_chars).collect::<String>();
        out.push_str("...");
        out
    }
}

fn build_next_steps(
    question: &str,
    context: &AskContextPack,
    hits: &[RetrievedContextItem],
) -> Vec<String> {
    if hits.is_empty() {
        return vec!["Run `asd index` to populate project context first.".to_string()];
    }
    let prioritized = prefer_source_hits(hits);
    let lower = question.to_ascii_lowercase();
    let prefers_source_sample =
        lower.contains("overview") || lower.contains("project") || question.contains("làm gì");
    let open_target = if prefers_source_sample {
        context
            .source_samples
            .first()
            .and_then(|sample| source_sample_path(sample))
            .or_else(|| {
                prioritized
                    .iter()
                    .find(|item| {
                        !item.id.starts_with(".agents/")
                            && !matches!(
                                Path::new(&item.id).extension().and_then(|v| v.to_str()),
                                Some("md" | "json")
                            )
                    })
                    .map(|item| item.id.clone())
            })
    } else {
        prioritized
            .iter()
            .find(|item| {
                !item.id.starts_with(".agents/")
                    && !matches!(
                        Path::new(&item.id).extension().and_then(|v| v.to_str()),
                        Some("md" | "json")
                    )
            })
            .map(|item| item.id.clone())
            .or_else(|| {
                context
                    .source_samples
                    .first()
                    .and_then(|sample| source_sample_path(sample))
            })
    }
    .or_else(|| {
        prioritized
            .iter()
            .find(|item| !item.id.starts_with(".agents/"))
            .map(|item| item.id.clone())
    })
    .unwrap_or_else(|| hits[0].id.clone());
    let mut steps = vec![
        format!("Open {}", open_target),
        "Run `asd workflow check` if you want package integrity validation.".to_string(),
    ];
    if lower.contains("bug") || question.contains("lỗi") {
        steps
            .push("Run `asd bug analyze <ticket.md>` with the failing ticket or logs.".to_string());
    }
    steps
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum AskIntent {
    Overview,
    BugLocation,
    NextStep,
    Generic,
}

impl AskIntent {
    fn as_str(self) -> &'static str {
        match self {
            AskIntent::Overview => "overview",
            AskIntent::BugLocation => "bug_location",
            AskIntent::NextStep => "next_step",
            AskIntent::Generic => "generic",
        }
    }
}

fn detect_intent(question: &str) -> AskIntent {
    let lower = question.to_ascii_lowercase();
    if lower.contains("what does")
        || lower.contains("overview")
        || lower.contains("project")
        || question.contains("làm gì")
    {
        AskIntent::Overview
    } else if lower.contains("where")
        || lower.contains("bug")
        || lower.contains("issue")
        || question.contains("ở đâu")
        || question.contains("lỗi")
    {
        AskIntent::BugLocation
    } else if lower.contains("next")
        || lower.contains("should do")
        || question.contains("tiếp theo")
        || question.contains("nên làm gì")
    {
        AskIntent::NextStep
    } else {
        AskIntent::Generic
    }
}

fn should_require_plan(question: &str, intent: AskIntent) -> bool {
    let lower = question.to_ascii_lowercase();
    if matches!(intent, AskIntent::NextStep) {
        return true;
    }
    lower.contains("plan")
        || lower.contains("implement")
        || lower.contains("triển khai")
        || lower.contains("kế hoạch")
        || lower.contains("thực hiện")
}

fn build_action_proposal(
    question: &str,
    intent: AskIntent,
    hits: &[RetrievedContextItem],
) -> Option<AskActionProposal> {
    let lower = question.to_ascii_lowercase();
    if matches!(intent, AskIntent::NextStep)
        || lower.contains("plan")
        || lower.contains("triển khai")
        || lower.contains("implement")
    {
        return Some(AskActionProposal {
            action_type: "create_plan".to_string(),
            reason: "Request appears actionable and should move through harness planning before implementation.".to_string(),
            suggested_command: "asd plan \"<goal>\"".to_string(),
        });
    }
    if matches!(intent, AskIntent::BugLocation) {
        return Some(AskActionProposal {
            action_type: "analyze_bug_ticket".to_string(),
            reason: "Question is bug-oriented; structured bug analysis improves traceability before code changes.".to_string(),
            suggested_command: "asd bug analyze <ticket.md>".to_string(),
        });
    }
    if hits.is_empty() {
        return Some(AskActionProposal {
            action_type: "index_project".to_string(),
            reason: "No strong indexed context was found for this question.".to_string(),
            suggested_command: "asd index".to_string(),
        });
    }
    None
}

fn estimate_confidence(hits: &[RetrievedContextItem]) -> f64 {
    let top = hits.first().map(|hit| hit.score).unwrap_or(0.0);
    if top >= 0.80 {
        0.90
    } else if top >= 0.60 {
        0.75
    } else if top >= 0.40 {
        0.60
    } else if top > 0.0 {
        0.45
    } else {
        0.25
    }
}

fn build_plan_request(question: &str, intent: AskIntent) -> Option<AskPlanRequest> {
    if !should_require_plan(question, intent) {
        return None;
    }
    Some(AskPlanRequest {
        goal: question.trim().to_string(),
        constraints: vec![
            "Use harness-verified execution only.".to_string(),
            "Break implementation into atomic task tickets.".to_string(),
            "Run verification at each task boundary.".to_string(),
        ],
    })
}

#[cfg(test)]
mod tests {
    use super::answer_question;
    use crate::engine::project::AgentProjectLayout;
    use crate::implement::run_implement;
    use crate::plan;
    use serde_json::json;

    #[tokio::test]
    async fn ask_returns_index_backed_answer() {
        let unique = format!(
            "agentic-sdlc-ask-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(root.join("src")).expect("create src");
        std::fs::write(
            root.join("src/lib.rs"),
            "mod auth;\nuse crate::auth::validate_email;\n",
        )
        .expect("write lib");
        std::fs::write(
            root.join("src/auth.rs"),
            "pub fn validate_email(input: &str) -> bool { input.contains('@') }\n",
        )
        .expect("write auth");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
        std::fs::create_dir_all(&layout.memory_dir).expect("memory dir");
        std::fs::write(
            layout.memory_dir.join("graph_index.json"),
            serde_json::to_string_pretty(&json!({
                "nodes": [
                    {
                        "id": "src/auth.rs",
                        "text": "validate_email auth logic input contains at sign",
                        "tags": ["ext:rs", "dir:src"],
                        "links": ["src/lib.rs"]
                    },
                    {
                        "id": "src/lib.rs",
                        "text": "lib module references validate_email from auth",
                        "tags": ["ext:rs", "dir:src"],
                        "links": ["src/auth.rs"]
                    }
                ]
            }))
            .expect("serialize graph"),
        )
        .expect("write graph index");
        let previous_mode = std::env::var("AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE").ok();
        let previous_graph_index = std::env::var("AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH").ok();
        std::env::set_var("AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE", "graph");
        std::env::set_var(
            "AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH",
            layout.memory_dir.join("graph_index.json"),
        );
        let response = answer_question(&layout, "where is email validation implemented?", 5)
            .await
            .expect("answer question");
        if let Some(value) = previous_mode {
            std::env::set_var("AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE", value);
        } else {
            std::env::remove_var("AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE");
        }
        if let Some(value) = previous_graph_index {
            std::env::set_var("AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH", value);
        } else {
            std::env::remove_var("AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH");
        }

        assert!(!response.hits.is_empty());
        assert_eq!(response.schema_version, "ask.v1");
        assert!(
            response.hits.iter().any(|hit| hit.id == "src/auth.rs")
                || response.hits.iter().any(|hit| hit.id == "src/lib.rs")
        );

        let _ = std::fs::remove_dir_all(root);
    }

    #[tokio::test]
    async fn ask_builds_plan_handoff_for_actionable_request() {
        let unique = format!(
            "agentic-sdlc-ask-plan-handoff-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(root.join("src")).expect("create src");
        std::fs::write(root.join("src/main.rs"), "fn main() {}\n").expect("write main");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
        std::fs::create_dir_all(&layout.memory_dir).expect("memory dir");
        std::fs::write(
            layout.memory_dir.join("graph_index.json"),
            serde_json::to_string_pretty(&json!({
                "nodes": [{
                    "id": "src/main.rs",
                    "text": "main entrypoint",
                    "tags": ["ext:rs", "dir:src"],
                    "links": []
                }]
            }))
            .expect("serialize graph"),
        )
        .expect("write graph index");

        std::env::set_var("AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE", "graph");
        std::env::set_var(
            "AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH",
            layout.memory_dir.join("graph_index.json"),
        );
        let response = answer_question(&layout, "tiếp theo nên làm gì để triển khai?", 3)
            .await
            .expect("answer question");
        assert!(response.requires_plan);
        assert!(response.plan_request.is_some());
        assert_eq!(
            response
                .plan_request
                .as_ref()
                .map(|v| v.goal.as_str())
                .unwrap_or_default(),
            "tiếp theo nên làm gì để triển khai?"
        );
        std::env::remove_var("AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE");
        std::env::remove_var("AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH");
        let _ = std::fs::remove_dir_all(root);
    }

    #[tokio::test]
    async fn e2e_ask_plan_implement_dry_run_loop() {
        let unique = format!(
            "agentic-sdlc-e2e-ask-plan-implement-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(root.join("src")).expect("create src");
        std::fs::write(root.join("Cargo.toml"), "[package]\nname='demo'\nversion='0.1.0'\n")
            .expect("write cargo");
        std::fs::write(root.join("src/lib.rs"), "pub fn run() {}\n").expect("write lib");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
        layout.ensure_layout().expect("ensure layout");
        std::fs::write(
            layout.memory_dir.join("graph_index.json"),
            serde_json::to_string_pretty(&json!({
                "nodes": [{
                    "id": "src/lib.rs",
                    "text": "library entrypoint run function",
                    "tags": ["ext:rs", "dir:src"],
                    "links": []
                }]
            }))
            .expect("serialize graph"),
        )
        .expect("write graph index");
        std::env::set_var("AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE", "graph");
        std::env::set_var(
            "AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH",
            layout.memory_dir.join("graph_index.json"),
        );

        let ask = answer_question(&layout, "tiếp theo nên làm gì để triển khai feature?", 3)
            .await
            .expect("ask");
        assert!(ask.requires_plan);
        let goal = ask
            .plan_request
            .as_ref()
            .map(|v| v.goal.clone())
            .expect("plan request");
        let generated_plan = plan::generate_plan(&layout, &goal);
        let verification = plan::verify_plan(&generated_plan);
        assert!(verification.ok);
        let implement = run_implement(&layout, Some(&goal), None, None, true, None)
            .expect("implement");
        assert_eq!(implement.schema_version, "implement.v1");
        assert!(implement.ok);
        assert_eq!(implement.selected_tasks, 3);

        std::env::remove_var("AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE");
        std::env::remove_var("AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH");
        let _ = std::fs::remove_dir_all(root);
    }
}
