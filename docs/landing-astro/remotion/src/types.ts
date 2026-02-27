export type StepStatus = 'Pending' | 'Running' | 'Succeeded' | 'Failed' | string;

export interface WorkflowStep {
  name: string;
  status: StepStatus;
  duration_ms: number | null;
  failure_class: string | null;
  provider: string | null;
  model: string | null;
}

export interface ShowcaseStructureItem {
  title: string;
  path: string;
  purpose: string;
}

export interface ShowcaseUseCase {
  title: string;
  command: string;
  outcome: string;
}

export interface ShowcaseSuccessOutput {
  title: string;
  artifact_path: string;
  screenshot: string | null;
  note: string;
}

export interface ShowcaseCaptionLine {
  start_s: number;
  end_s: number;
  text: string;
}

export interface ShowcaseVoiceover {
  audio: string | null;
  source: string;
  captions: ShowcaseCaptionLine[];
}

export interface WorkflowIoProps {
  generated_at: string;
  instance_id: string | null;
  workflow_id: string | null;
  workflow_name: string | null;
  status: string | null;
  trace_id: string | null;
  created_at_ms: number | null;
  updated_at_ms: number | null;
  input: {
    workflow_path: string | null;
    current_step: number | null;
    total_steps: number;
  };
  execution: {
    completed_steps: string[];
    failed_steps: string[];
    steps: WorkflowStep[];
  };
  output: {
    last_error: string | null;
    trace_events: string[];
  };
  showcase: {
    structure: ShowcaseStructureItem[];
    cli_commands: string[];
    use_cases: ShowcaseUseCase[];
    success_output: ShowcaseSuccessOutput;
    voiceover?: ShowcaseVoiceover;
  };
  state: {
    status: string | null;
    updated_at_ms: number | null;
  };
}
