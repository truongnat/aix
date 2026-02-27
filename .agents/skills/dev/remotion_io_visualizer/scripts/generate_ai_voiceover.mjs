#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const [propsPath, audioOutputPath] = process.argv.slice(2);

if (!propsPath || !audioOutputPath) {
  console.error('Usage: node generate_ai_voiceover.mjs <props_json_path> <audio_output_path>');
  process.exit(1);
}

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const commandExists = (name) => spawnSync('which', [name], { stdio: 'ignore' }).status === 0;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const defaultCaptionsFromProps = (props) => {
  const firstStructure = props.showcase?.structure?.[0]?.title ?? 'project architecture';
  const firstUseCase = props.showcase?.use_cases?.[0]?.title ?? 'domain workflow';
  const successTitle = props.showcase?.success_output?.title ?? 'landing page output';

  return [
    { start_s: 0.4, end_s: 4.6, text: 'agentic-sdlc makes delivery deterministic and auditable from day one.' },
    { start_s: 4.7, end_s: 9.8, text: `We begin with structure proof, starting from ${firstStructure} and connected runtime layers.` },
    { start_s: 9.9, end_s: 15.4, text: 'Next, we execute real CLI commands for setup, checks, and trace inspection.' },
    { start_s: 15.5, end_s: 21.8, text: `Then we map practical use cases such as ${firstUseCase} to business outcomes.` },
    { start_s: 21.9, end_s: 27.6, text: `Final success output: ${successTitle} shipped from real runtime evidence.` }
  ];
};

const normalizeCaptions = (captions, maxSeconds = 28) => {
  const raw = (captions || [])
    .map((line, index) => {
      const start = Number(line.start_s ?? 0);
      const end = Number(line.end_s ?? start + 2);
      return {
        start_s: clamp(Number.isFinite(start) ? start : index * 4, 0, maxSeconds),
        end_s: clamp(Number.isFinite(end) ? end : start + 3.5, 0.2, maxSeconds),
        text: String(line.text ?? '').trim()
      };
    })
    .filter((line) => line.text.length > 0)
    .sort((a, b) => a.start_s - b.start_s);

  const normalized = [];
  for (const line of raw) {
    const prevEnd = normalized.length === 0 ? 0 : normalized[normalized.length - 1].end_s;
    const start = Math.max(line.start_s, prevEnd);
    const end = Math.max(start + 0.8, line.end_s);
    normalized.push({
      ...line,
      start_s: clamp(start, 0, maxSeconds),
      end_s: clamp(end, 0.8, maxSeconds)
    });
  }

  return normalized;
};

const generateScriptFromCaptions = (captions) => captions.map((line) => line.text).join(' ');

const tryGenerateWithOpenAI = async (props, fallbackCaptions) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL_TEXT || 'gpt-4o-mini';
  const prompt = {
    workflow_id: props.workflow_id,
    instance_id: props.instance_id,
    structure: props.showcase?.structure?.map((s) => `${s.title} (${s.path})`) || [],
    cli_commands: props.showcase?.cli_commands || [],
    use_cases: props.showcase?.use_cases?.map((u) => `${u.title}: ${u.outcome}`) || [],
    success_output: props.showcase?.success_output?.title || null
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a video script editor. Return strict JSON with keys: captions (array of {start_s,end_s,text}) and script (string). Keep total duration <= 28s and narrative value-first.'
        },
        {
          role: 'user',
          content: `Create a concise narration for a software showcase video that must include: 1) structure 2) CLI 3) use-cases 4) success output. Keep 5-7 caption lines. Context: ${JSON.stringify(
            prompt
          )}. Fallback captions for style reference: ${JSON.stringify(fallbackCaptions)}`
        }
      ]
    })
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`OpenAI text generation failed: ${resp.status} ${msg}`);
  }

  const body = await resp.json();
  const raw = body?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('OpenAI returned empty text response');
  const parsed = JSON.parse(raw);

  const captions = normalizeCaptions(parsed.captions);
  const script = String(parsed.script || generateScriptFromCaptions(captions)).trim();

  if (!captions.length || !script) {
    throw new Error('OpenAI response missing captions/script');
  }

  return { captions, script };
};

const tryGenerateSpeechWithOpenAI = async (script, outputPath) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return false;

  const ttsModel = process.env.OPENAI_MODEL_TTS || 'gpt-4o-mini-tts';
  const voice = process.env.OPENAI_TTS_VOICE || 'alloy';

  const resp = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: ttsModel,
      voice,
      input: script,
      response_format: 'mp3'
    })
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`OpenAI TTS failed: ${resp.status} ${msg}`);
  }

  const buffer = Buffer.from(await resp.arrayBuffer());
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);
  return true;
};

const tryGenerateSpeechLocalFallback = async (script, outputPath) => {
  if (process.platform !== 'darwin') return false;
  if (!commandExists('say') || !commandExists('ffmpeg')) return false;

  const tempAiff = path.join(os.tmpdir(), `workflow-voice-${Date.now()}.aiff`);
  const say = spawnSync('say', ['-o', tempAiff, script], { stdio: 'ignore' });
  if (say.status !== 0) return false;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const ffmpeg = spawnSync('ffmpeg', ['-y', '-i', tempAiff, outputPath], { stdio: 'ignore' });
  await fs.rm(tempAiff, { force: true });
  return ffmpeg.status === 0;
};

const main = async () => {
  const props = await readJson(propsPath);
  const fallbackCaptions = normalizeCaptions(
    props.showcase?.voiceover?.captions?.length ? props.showcase.voiceover.captions : defaultCaptionsFromProps(props)
  );

  let captions = fallbackCaptions;
  let script = generateScriptFromCaptions(fallbackCaptions);
  let voiceSource = 'none';

  try {
    const generated = await tryGenerateWithOpenAI(props, fallbackCaptions);
    if (generated) {
      captions = generated.captions;
      script = generated.script;
      voiceSource = 'openai-script';
      console.log('AI script generated with OpenAI.');
    }
  } catch (err) {
    console.warn(`OpenAI script generation skipped: ${err.message}`);
  }

  const relativeAudioPath = `media/${path.basename(audioOutputPath)}`;
  let audioPathInProps = null;

  try {
    const openAiTts = await tryGenerateSpeechWithOpenAI(script, audioOutputPath);
    if (openAiTts) {
      audioPathInProps = relativeAudioPath;
      voiceSource = 'openai-tts';
      console.log(`AI voiceover generated: ${audioOutputPath}`);
    }
  } catch (err) {
    console.warn(`OpenAI voice generation skipped: ${err.message}`);
  }

  if (!audioPathInProps) {
    const localTts = await tryGenerateSpeechLocalFallback(script, audioOutputPath);
    if (localTts) {
      audioPathInProps = relativeAudioPath;
      voiceSource = voiceSource === 'openai-script' ? 'openai-script+local-tts' : 'local-tts';
      console.log(`Local fallback voiceover generated: ${audioOutputPath}`);
    }
  }

  props.showcase = props.showcase || {};
  props.showcase.voiceover = {
    audio: audioPathInProps,
    source: voiceSource,
    captions
  };

  await fs.writeFile(propsPath, JSON.stringify(props, null, 2));
  console.log(`Updated props voiceover metadata: ${propsPath}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
