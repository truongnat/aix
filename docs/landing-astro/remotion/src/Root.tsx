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
      'cargo run -- workflow trace <instance_id> --timeline'
    ],
    use_cases: [
      {
        title: 'AI Engineering feature delivery',
        command: 'cargo run -- --workflow-id ai-engineering/feature --template ai-engineering/feature_prompt --task \"build eval pipeline\"',
        outcome: 'impact + acceptance + risk gates before shipping'
      },
      {
        title: 'Cybersecurity review gate',
        command: 'cargo run -- --workflow-id cybersecurity/review --template cybersecurity/review_prompt --task \"review auth middleware\"',
        outcome: 'security-focused release readiness checks'
      }
    ],
    success_output: {
      title: 'Landing page as final production artifact',
      artifact_path: 'docs/landing-astro/dist/index.html',
      screenshot: 'media/workflow-io-still.png',
      note: 'workflow evidence is translated into a conversion-focused landing page'
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
      durationInFrames={720}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
    />
  );
};
