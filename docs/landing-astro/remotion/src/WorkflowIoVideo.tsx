import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';
import type { WorkflowIoProps } from './types';

const shell: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  color: '#f5f8ff',
  background:
    'radial-gradient(1300px 740px at -14% -12%, rgba(67,117,255,0.34), transparent 55%), radial-gradient(1000px 660px at 116% 10%, rgba(22,172,161,0.28), transparent 62%), #0d1726',
  padding: 56
};

const sectionCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(154,187,255,0.34)',
  borderRadius: 20,
  boxShadow: '0 18px 44px rgba(5, 12, 20, 0.38)',
  padding: '24px 26px'
};

const sceneAlpha = (frame: number, start: number, end: number): number => {
  return interpolate(frame, [start - 12, start, end - 12, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
};

const statusColor = (status: string | null): string => {
  if (!status) return '#f6f9ff';
  if (status.toLowerCase().includes('fail')) return '#ff8b8b';
  if (status.toLowerCase().includes('success') || status.toLowerCase().includes('complete')) return '#68f6bf';
  return '#f6f9ff';
};

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  border: '1px solid rgba(152, 188, 255, 0.4)',
  background: 'rgba(255,255,255,0.05)',
  padding: '6px 12px',
  fontSize: 18,
  color: '#d8e8ff'
};

export const WorkflowIoVideo: React.FC<WorkflowIoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intro = sceneAlpha(frame, 0, 90);
  const structure = sceneAlpha(frame, 90, 220);
  const cli = sceneAlpha(frame, 220, 360);
  const useCases = sceneAlpha(frame, 360, 500);
  const io = sceneAlpha(frame, 500, 620);
  const output = sceneAlpha(frame, 620, 720);

  const pulse = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 26
  });

  const structures = props.showcase.structure.slice(0, 6);
  const commands = props.showcase.cli_commands.slice(0, 6);
  const useCaseList = props.showcase.use_cases.slice(0, 3);
  const stepBars = props.execution.steps.slice(0, 6);
  const screenshotPath = props.showcase.success_output.screenshot || 'media/workflow-io-still.png';

  return (
    <AbsoluteFill style={shell}>
      <AbsoluteFill style={{ opacity: intro, justifyContent: 'center' }}>
        <p style={{ margin: 0, color: '#8ebfff', textTransform: 'uppercase', letterSpacing: 3.1, fontSize: 23 }}>
          Creator-Grade Product Story
        </p>
        <h1 style={{ margin: '16px 0 0', fontSize: 82, lineHeight: 1.03, maxWidth: 1180 }}>
          From architecture and CLI inputs to a final landing-page output.
        </h1>
        <p style={{ marginTop: 18, fontSize: 33, color: '#dbe8ff', maxWidth: 1220 }}>
          Source instance: <strong>{props.instance_id ?? 'unknown'}</strong> · Trace ID: {props.trace_id ?? '-'}
        </p>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: structure, justifyContent: 'center' }}>
        <div style={sectionCard}>
          <p style={{ margin: 0, color: '#8ab8ff', letterSpacing: 2.2, textTransform: 'uppercase', fontSize: 18 }}>
            1. Project Structure
          </p>
          <h2 style={{ margin: '10px 0 0', fontSize: 56, lineHeight: 1.08 }}>
            Show exactly what the runtime is made of
          </h2>
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            {structures.map((item, index) => {
              const y = spring({
                frame: frame - 90 - index * 7,
                fps,
                from: 24,
                to: 0,
                durationInFrames: 18
              });
              const alpha = interpolate(frame, [98 + index * 7, 128 + index * 7], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp'
              });
              return (
                <div
                  key={item.path}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.6fr',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(157,188,255,0.3)',
                    background: 'rgba(255,255,255,0.04)',
                    transform: `translateY(${y}px)`,
                    opacity: alpha
                  }}
                >
                  <div style={{ fontSize: 24, color: '#e7f1ff' }}>
                    <strong>{item.title}</strong>
                    <div style={{ color: '#a8c3ee', fontSize: 20 }}>{item.path}</div>
                  </div>
                  <div style={{ fontSize: 23, color: '#d7e6ff' }}>{item.purpose}</div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: cli, justifyContent: 'center' }}>
        <div style={sectionCard}>
          <p style={{ margin: 0, color: '#8cf3cc', letterSpacing: 2.2, textTransform: 'uppercase', fontSize: 18 }}>
            2. CLI Surface
          </p>
          <h2 style={{ margin: '10px 0 0', fontSize: 56, lineHeight: 1.08 }}>
            Demonstrate real commands your team actually runs
          </h2>
          <div
            style={{
              marginTop: 18,
              borderRadius: 14,
              border: '1px solid rgba(124, 214, 199, 0.32)',
              background: '#101d2d',
              padding: 18,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)'
            }}
          >
            {commands.map((cmd, index) => {
              const visible = frame >= 230 + index * 14;
              return (
                <div
                  key={cmd}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: `translateY(${visible ? 0 : 10}px)`,
                    transition: 'all 180ms ease',
                    fontFamily: 'JetBrains Mono, Menlo, monospace',
                    color: '#d8f2ff',
                    fontSize: 23,
                    lineHeight: 1.4,
                    marginBottom: 6
                  }}
                >
                  <span style={{ color: '#7ae5c6' }}>$</span> {cmd}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: useCases, justifyContent: 'center' }}>
        <div style={sectionCard}>
          <p style={{ margin: 0, color: '#ffc487', letterSpacing: 2.2, textTransform: 'uppercase', fontSize: 18 }}>
            3. Use Cases
          </p>
          <h2 style={{ margin: '10px 0 0', fontSize: 56, lineHeight: 1.08 }}>
            Prove breadth with practical domain workflows
          </h2>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {useCaseList.map((uc, index) => {
              const alpha = interpolate(frame, [368 + index * 10, 404 + index * 10], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp'
              });
              return (
                <div
                  key={uc.title}
                  style={{
                    borderRadius: 14,
                    border: '1px solid rgba(255, 190, 130, 0.34)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: 14,
                    opacity: alpha
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 27 }}>{uc.title}</h3>
                  <p style={{ margin: '8px 0 0', fontFamily: 'JetBrains Mono, Menlo, monospace', fontSize: 16, color: '#ffdeb9' }}>
                    {uc.command}
                  </p>
                  <p style={{ margin: '9px 0 0', fontSize: 20, color: '#f7eadf' }}>{uc.outcome}</p>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: io, justifyContent: 'center' }}>
        <div style={{ ...sectionCard, transform: `scale(${0.98 + pulse * 0.02})` }}>
          <p style={{ margin: 0, color: '#b7c8ff', letterSpacing: 2.2, textTransform: 'uppercase', fontSize: 18 }}>
            4. Runtime Input → Output
          </p>
          <h2 style={{ margin: '10px 0 0', fontSize: 52, lineHeight: 1.08 }}>
            Use live trace evidence instead of narrative-only claims
          </h2>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ border: '1px solid rgba(152, 185, 255, 0.35)', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.03)' }}>
              <p style={{ margin: 0, fontSize: 20, color: '#b8d2ff' }}>Input</p>
              <p style={{ margin: '8px 0 0', fontSize: 24 }}>
                workflow_id: <strong>{props.workflow_id}</strong>
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 22 }}>steps: {props.input.total_steps}</p>
              <p style={{ margin: '8px 0 0', fontSize: 20, color: '#c8dbff' }}>
                path: {props.input.workflow_path}
              </p>
            </div>
            <div style={{ border: '1px solid rgba(152, 185, 255, 0.35)', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.03)' }}>
              <p style={{ margin: 0, fontSize: 20, color: '#b8d2ff' }}>Output</p>
              <p style={{ margin: '8px 0 0', fontSize: 24 }}>
                status: <strong style={{ color: statusColor(props.status) }}>{props.status ?? '-'}</strong>
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 22 }}>completed: {props.execution.completed_steps.length}</p>
              <p style={{ margin: '8px 0 0', fontSize: 22 }}>failed: {props.execution.failed_steps.length}</p>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            {stepBars.slice(0, 4).map((step) => (
              <div
                key={step.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 0.8fr 0.6fr',
                  gap: 8,
                  alignItems: 'center',
                  borderRadius: 10,
                  border: '1px solid rgba(152, 185, 255, 0.28)',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '8px 10px',
                  fontSize: 20
                }}
              >
                <span>{step.name}</span>
                <span style={{ color: statusColor(step.status) }}>{step.status}</span>
                <span>{step.duration_ms ?? 0} ms</span>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: output, justifyContent: 'center' }}>
        <div style={{ ...sectionCard, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14 }}>
          <div>
            <p style={{ margin: 0, color: '#87f0d0', letterSpacing: 2.2, textTransform: 'uppercase', fontSize: 18 }}>
              5. Success Output
            </p>
            <h2 style={{ margin: '10px 0 0', fontSize: 52, lineHeight: 1.08 }}>
              Final artifact: production landing page
            </h2>
            <p style={{ margin: '12px 0 0', fontSize: 24, color: '#d9e8ff' }}>{props.showcase.success_output.title}</p>
            <p style={{ margin: '10px 0 0', fontSize: 21, color: '#c6dbff' }}>
              {props.showcase.success_output.note}
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={chipStyle}>artifact: {props.showcase.success_output.artifact_path}</span>
              <span style={chipStyle}>trace_id: {props.trace_id ?? '-'}</span>
            </div>
          </div>
          <div
            style={{
              border: '1px solid rgba(147, 188, 255, 0.34)',
              borderRadius: 14,
              overflow: 'hidden',
              background: '#0e1b2f'
            }}
          >
            <Img src={staticFile(screenshotPath)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
