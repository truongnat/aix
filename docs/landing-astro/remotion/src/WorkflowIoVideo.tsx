import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';
import type { WorkflowIoProps } from './types';

type Chapter = {
  label: string;
  start: number;
  end: number;
  color: string;
};

const shell: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  color: '#edf4ff',
  background:
    'radial-gradient(1100px 520px at -6% -8%, rgba(80,126,255,0.33), transparent 54%), radial-gradient(1000px 540px at 110% 0%, rgba(6, 193, 162, 0.22), transparent 60%), linear-gradient(180deg, #08101d 0%, #091425 44%, #0a172a 100%)',
  padding: 56
};

const sectionCard: React.CSSProperties = {
  background: 'rgba(7, 20, 35, 0.68)',
  border: '1px solid rgba(141, 181, 255, 0.28)',
  borderRadius: 22,
  boxShadow: '0 26px 60px rgba(2, 7, 14, 0.44)',
  backdropFilter: 'blur(2px)',
  padding: '24px 26px'
};

const sceneOpacity = (frame: number, start: number, end: number): number =>
  interpolate(frame, [start - 12, start, end - 12, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

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
  border: '1px solid rgba(152, 188, 255, 0.36)',
  background: 'rgba(255,255,255,0.04)',
  padding: '6px 12px',
  fontSize: 17,
  color: '#d8e8ff'
};

const gridOverlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  opacity: 0.24,
  backgroundImage:
    'linear-gradient(rgba(149, 177, 255, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(149, 177, 255, 0.09) 1px, transparent 1px)',
  backgroundSize: '52px 52px',
  pointerEvents: 'none'
};

export const WorkflowIoVideo: React.FC<WorkflowIoProps> = (props) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const intro = sceneOpacity(frame, 0, 90);
  const structure = sceneOpacity(frame, 90, 250);
  const cli = sceneOpacity(frame, 250, 430);
  const useCases = sceneOpacity(frame, 430, 610);
  const success = sceneOpacity(frame, 610, 840);

  const structures = props.showcase.structure.slice(0, 6);
  const commands = props.showcase.cli_commands.slice(0, 5);
  const useCaseList = props.showcase.use_cases.slice(0, 3);
  const stepBars = props.execution.steps.slice(0, 6);
  const screenshotPath = props.showcase.success_output.screenshot || 'media/workflow-io-still.png';
  const safeTotal = Math.max(props.execution.completed_steps.length + props.execution.failed_steps.length, 1);
  const successRate = Math.round((props.execution.completed_steps.length / safeTotal) * 100);
  const totalDurationMs = stepBars.reduce((sum, item) => sum + (item.duration_ms ?? 0), 0);

  const chapters: Chapter[] = [
    { label: 'STRUCTURE', start: 90, end: 250, color: '#74c3ff' },
    { label: 'CLI', start: 250, end: 430, color: '#79f0c8' },
    { label: 'USE CASES', start: 430, end: 610, color: '#ffcb8a' },
    { label: 'OUTPUT', start: 610, end: 840, color: '#8ff0dd' }
  ];

  const typedScript = commands.map((c) => `$ ${c}`).join('\n');
  const typedChars = Math.floor(
    interpolate(frame, [250, 415], [0, typedScript.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    })
  );
  const typedTerminal = typedScript.slice(0, typedChars);

  const voiceover = props.showcase.voiceover;
  const currentSecond = frame / fps;
  const activeCaption =
    voiceover?.captions?.find((line) => currentSecond >= line.start_s && currentSecond < line.end_s) ?? null;

  const activeUseCaseIndex = Math.min(
    useCaseList.length - 1,
    Math.max(
      0,
      Math.floor(
        interpolate(frame, [430, 600], [0, useCaseList.length], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        })
      )
    )
  );

  return (
    <AbsoluteFill style={shell}>
      {voiceover?.audio ? <Audio src={staticFile(voiceover.audio)} /> : null}
      <AbsoluteFill style={gridOverlay} />

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 56,
          right: 56,
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}
      >
        {chapters.map((chapter) => {
          const fill = interpolate(frame, [chapter.start, chapter.end], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          });
          return (
            <div
              key={chapter.label}
              style={{
                flex: 1,
                height: 6,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 999,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${Math.round(fill * 100)}%`,
                  height: '100%',
                  background: chapter.color
                }}
              />
            </div>
          );
        })}
      </div>

      <AbsoluteFill style={{ opacity: intro, justifyContent: 'center' }}>
        <p style={{ margin: 0, color: '#9ed0ff', textTransform: 'uppercase', letterSpacing: 3.4, fontSize: 22 }}>
          AI Narrated Showcase
        </p>
        <h1 style={{ margin: '14px 0 0', fontSize: 86, lineHeight: 1.02, maxWidth: 1340 }}>
          Structure. CLI. Use Cases. Landing Output.
        </h1>
        <p style={{ marginTop: 18, fontSize: 31, color: '#d7e9ff', maxWidth: 1280 }}>
          No mock claims. Only runtime evidence from real workflow traces.
        </p>
        <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={chipStyle}>instance: {props.instance_id ?? 'unknown'}</span>
          <span style={chipStyle}>trace: {props.trace_id ?? '-'}</span>
          <span style={chipStyle}>frames: {durationInFrames}</span>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: structure, justifyContent: 'center' }}>
        <div style={{ ...sectionCard, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          <div>
            <p style={{ margin: 0, color: '#92c5ff', letterSpacing: 2, textTransform: 'uppercase', fontSize: 18 }}>
              1. Structure Map
            </p>
            <h2 style={{ margin: '10px 0 0', fontSize: 58, lineHeight: 1.05 }}>
              Show the engineering surface first
            </h2>
            <div style={{ marginTop: 14, display: 'grid', gap: 9 }}>
              {structures.map((item, idx) => {
                const visible = frame >= 102 + idx * 10;
                return (
                  <div
                    key={item.path}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '0.07fr 0.93fr',
                      gap: 10,
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(145,183,255,0.32)',
                      background: 'rgba(255,255,255,0.03)',
                      opacity: visible ? 1 : 0,
                      transform: `translateX(${visible ? 0 : -14}px)`
                    }}
                  >
                    <div style={{ width: 7, height: 40, borderRadius: 9, background: '#7bbfff' }} />
                    <div>
                      <div style={{ fontSize: 24 }}>
                        <strong>{item.title}</strong>
                      </div>
                      <div style={{ color: '#bad5ff', fontSize: 19 }}>{item.path}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            style={{
              borderRadius: 14,
              border: '1px solid rgba(145,183,255,0.32)',
              background: 'rgba(5,14,26,0.6)',
              padding: 14
            }}
          >
            <p style={{ margin: 0, color: '#bbd7ff', fontSize: 20 }}>Architecture intent</p>
            <div style={{ marginTop: 10, display: 'grid', gap: 9 }}>
              {structures.map((item) => (
                <div key={item.title} style={{ fontSize: 20, color: '#e5f0ff', lineHeight: 1.25 }}>
                  <strong>{item.title}:</strong> {item.purpose}
                </div>
              ))}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: cli, justifyContent: 'center' }}>
        <div style={sectionCard}>
          <p style={{ margin: 0, color: '#8ef0cb', letterSpacing: 2, textTransform: 'uppercase', fontSize: 18 }}>
            2. CLI In Action
          </p>
          <h2 style={{ margin: '10px 0 0', fontSize: 56, lineHeight: 1.06 }}>
            Show real commands, not pseudocode
          </h2>
          <div
            style={{
              marginTop: 16,
              borderRadius: 14,
              border: '1px solid rgba(126, 236, 205, 0.34)',
              background: '#07131f',
              padding: 16
            }}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                minHeight: 245,
                fontFamily: 'JetBrains Mono, Menlo, monospace',
                fontSize: 24,
                color: '#d6fff4',
                lineHeight: 1.5
              }}
            >
              {typedTerminal}
              <span style={{ color: '#7bf3cb' }}>{typedChars < typedScript.length ? '|' : ''}</span>
            </pre>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={chipStyle}>success-rate: {successRate}%</span>
            <span style={chipStyle}>trace steps: {props.input.total_steps}</span>
            <span style={chipStyle}>step-time: {totalDurationMs} ms</span>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: useCases, justifyContent: 'center' }}>
        <div style={sectionCard}>
          <p style={{ margin: 0, color: '#ffcf98', letterSpacing: 2, textTransform: 'uppercase', fontSize: 18 }}>
            3. Domain Use Cases
          </p>
          <h2 style={{ margin: '10px 0 0', fontSize: 56, lineHeight: 1.05 }}>
            Bridge one runtime into multiple business cases
          </h2>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {useCaseList.map((item, idx) => {
              const active = idx === activeUseCaseIndex;
              return (
                <article
                  key={item.title}
                  style={{
                    borderRadius: 14,
                    border: active ? '1px solid rgba(255, 220, 152, 0.9)' : '1px solid rgba(255, 196, 136, 0.34)',
                    background: active ? 'rgba(255, 211, 146, 0.11)' : 'rgba(255,255,255,0.03)',
                    padding: 14,
                    transform: `translateY(${active ? -8 : 0}px)`,
                    boxShadow: active ? '0 18px 40px rgba(10, 7, 4, 0.34)' : 'none'
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 25 }}>{item.title}</h3>
                  <p style={{ margin: '8px 0 0', fontFamily: 'JetBrains Mono, Menlo, monospace', fontSize: 16, color: '#ffe2bb' }}>
                    {item.command}
                  </p>
                  <p style={{ margin: '10px 0 0', fontSize: 20, color: '#fff4e5' }}>{item.outcome}</p>
                </article>
              );
            })}
          </div>
          <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
            {stepBars.slice(0, 4).map((step) => (
              <div
                key={step.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.55fr 0.8fr 0.65fr',
                  gap: 8,
                  alignItems: 'center',
                  borderRadius: 10,
                  border: '1px solid rgba(153, 184, 255, 0.32)',
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

      <AbsoluteFill style={{ opacity: success, justifyContent: 'center' }}>
        <div style={{ ...sectionCard, display: 'grid', gridTemplateColumns: '1.28fr 0.72fr', gap: 14 }}>
          <div>
            <p style={{ margin: 0, color: '#8df0d4', letterSpacing: 2, textTransform: 'uppercase', fontSize: 18 }}>
              4. Success Output
            </p>
            <h2 style={{ margin: '10px 0 0', fontSize: 54, lineHeight: 1.05 }}>
              Landing page shipped as the final artifact
            </h2>
            <p style={{ margin: '12px 0 0', fontSize: 24, color: '#d9ebff' }}>{props.showcase.success_output.title}</p>
            <p style={{ margin: '10px 0 0', fontSize: 21, color: '#c5ddff' }}>
              {props.showcase.success_output.note}
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={chipStyle}>artifact: {props.showcase.success_output.artifact_path}</span>
              <span style={chipStyle}>status: {props.status ?? '-'}</span>
              <span style={chipStyle}>instance: {props.instance_id ?? '-'}</span>
            </div>
          </div>
          <div
            style={{
              border: '1px solid rgba(148, 190, 255, 0.4)',
              borderRadius: 16,
              overflow: 'hidden',
              background: '#061324',
              position: 'relative'
            }}
          >
            <Img src={staticFile(screenshotPath)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                borderRadius: 8,
                border: '1px solid rgba(125, 244, 206, 0.7)',
                background: 'rgba(8, 41, 31, 0.78)',
                color: '#9ff6d8',
                fontSize: 16,
                letterSpacing: 1.2,
                padding: '6px 8px'
              }}
            >
              OUTPUT SHIPPED
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {activeCaption ? (
        <div
          style={{
            position: 'absolute',
            left: 120,
            right: 120,
            bottom: 34,
            borderRadius: 14,
            border: '1px solid rgba(145, 191, 255, 0.38)',
            background: 'rgba(2, 7, 14, 0.78)',
            boxShadow: '0 14px 36px rgba(1, 4, 10, 0.5)',
            padding: '14px 18px',
            textAlign: 'center'
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 27,
              lineHeight: 1.3,
              color: '#eaf3ff',
              fontWeight: 600
            }}
          >
            {activeCaption.text}
          </p>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
