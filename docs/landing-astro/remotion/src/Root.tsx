import React from 'react';
import { Composition } from 'remotion';
import { WorkflowIoVideo } from './WorkflowIoVideo';
import type { WorkflowIoProps } from './types';

const defaultProps: WorkflowIoProps = {
  generated_at: new Date().toISOString(),
  instance_id: 'demo-instance',
  workflow_id: 'dev-build-landing-page',
  workflow_name: 'dev-build-landing-page',
  status: 'Succeeded',
  trace_id: '10-demo-trace',
  created_at_ms: Date.now() - 120000,
  updated_at_ms: Date.now(),
  input: {
    workflow_path: '.agents/workflows/dev/build-landing-page.md',
    current_step: 8,
    total_steps: 9
  },
  execution: {
    completed_steps: ['clarify_goal', 'retrieve_repo_context', 'spec_architecture'],
    failed_steps: [],
    steps: [
      {
        name: 'clarify_goal',
        status: 'Succeeded',
        duration_ms: 230,
        failure_class: null,
        provider: 'ollama',
        model: 'qwen3:8b'
      },
      {
        name: 'implementation_handoff',
        status: 'Succeeded',
        duration_ms: 402,
        failure_class: null,
        provider: 'ollama',
        model: 'qwen3:8b'
      }
    ]
  },
  output: {
    last_error: null,
    trace_events: ['workflow started', "step 'clarify_goal' Succeeded", 'workflow completed']
  },
  showcase: {
    structure: [
      {
        title: 'CLI Layer',
        path: 'src/cli',
        purpose: 'command parsing and runtime policy flags'
      },
      {
        title: 'Workflow Engine',
        path: 'src/engine/workflow_engine',
        purpose: 'deterministic orchestration and state transitions'
      },
      {
        title: 'Workflow Loader',
        path: 'src/workflow',
        purpose: 'markdown workflow parsing and validation'
      },
      {
        title: 'Skill Registry',
        path: '.agents/skills',
        purpose: 'domain capability packs and execution skills'
      }
    ],
    cli_commands: [
      'cargo run -- --workflow valid_flow.md',
      'cargo run -- workflow doctor',
      'cargo run -- workflow setup',
      'cargo run -- --workflow-id cybersecurity/security-scan --template cybersecurity/security_scan_prompt --task \"scan internet-surface risk\"',
      'cargo run -- workflow trace <instance_id> --timeline'
    ],
    use_cases: [
      {
        title: 'AI Engineering feature delivery',
        command: 'cargo run -- --workflow-id ai-engineering/feature --template ai-engineering/feature_prompt --task \"build eval pipeline\"',
        outcome: 'impact + acceptance + risk gates before shipping'
      },
      {
        title: 'Security scan gate',
        command: 'cargo run -- --workflow-id cybersecurity/security-scan --template cybersecurity/security_scan_prompt --task \"scan internet-surface risk\"',
        outcome: 'mandatory security checks before internet-capable workflows complete'
      },
      {
        title: 'Project intelligence upgrade',
        command: 'cargo run -- --workflow-id dev/project-intelligence --template dev/project-intelligence_prompt --task \"recommend workflows and skills\"',
        outcome: 'prioritized workflow and skill roadmap with quick wins'
      }
    ],
    success_output: {
      title: 'Landing page as final production artifact',
      artifact_path: 'docs/landing-astro/dist/index.html',
      screenshot: 'media/landing-page-output.png',
      note: 'workflow evidence is translated into a conversion-focused landing page'
    },
    voiceover: {
      audio: null,
      source: 'none',
      captions: [
        { start_s: 0.4, end_s: 4.6, text: 'agentic-sdlc turns software delivery into deterministic, auditable execution.' },
        { start_s: 4.7, end_s: 9.8, text: 'First, we show structure: CLI, workflow engine, and skill registry layers.' },
        { start_s: 9.9, end_s: 15.4, text: 'Second, we show CLI commands teams run daily across setup, checks, and tracing.' },
        { start_s: 15.5, end_s: 21.8, text: 'Third, we show use cases across AI delivery, security scan gating, and project intelligence.' },
        { start_s: 21.9, end_s: 27.6, text: 'Finally, the landing page ships as the production output from real trace evidence.' }
      ]
    }
  },
  state: {
    status: 'Completed',
    updated_at_ms: Date.now()
  }
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WorkflowIo"
      component={WorkflowIoVideo}
      durationInFrames={840}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
    />
  );
};
