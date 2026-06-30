import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { BaseCheckpointSaver, copyCheckpoint, getCheckpointId, type Checkpoint, type CheckpointListOptions, type CheckpointMetadata, type CheckpointTuple } from '@langchain/langgraph-checkpoint';
import type { RunnableConfig } from '@langchain/core/runnables';

const DEFAULT_NS = '__default__';

function nsDir(root: string, threadId: string, checkpointNs: string): string {
  const ns = checkpointNs || DEFAULT_NS;
  return join(root, threadId, 'checkpoints', ns);
}

function checkpointPath(root: string, threadId: string, checkpointNs: string, checkpointId: string): string {
  return join(nsDir(root, threadId, checkpointNs), `${checkpointId}.ckpt.json`);
}

function writesPath(root: string, threadId: string, checkpointNs: string, checkpointId: string): string {
  return join(nsDir(root, threadId, checkpointNs), `${checkpointId}.writes.json`);
}

export class FileCheckpointer extends BaseCheckpointSaver {
  readonly #root: string;

  constructor(root?: string) {
    super();
    this.#root = root ?? join(process.cwd(), '.aix', 'sessions');
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = (config.configurable?.checkpoint_ns as string | undefined) ?? '';
    const checkpointId = getCheckpointId(config);

    if (typeof threadId !== 'string') return undefined;

    const dir = nsDir(this.#root, threadId, checkpointNs);

    if (checkpointId) {
      return this.#loadCheckpoint(dir, threadId, checkpointNs, checkpointId, config);
    }

    // No checkpoint_id specified — return the latest
    try {
      const files = await readdir(dir);
      const ids = files
        .filter(f => f.endsWith('.ckpt.json'))
        .map(f => f.replace(/\.ckpt\.json$/, ''))
        .sort((a, b) => b.localeCompare(a));
      const latest = ids[0];
      if (!latest) return undefined;
      return this.#loadCheckpoint(dir, threadId, checkpointNs, latest, config);
    } catch {
      return undefined;
    }
  }

  async *#listGenerator(
    dir: string,
    threadId: string,
    checkpointNs: string,
    beforeCheckpointId?: string,
    limit?: number,
    filter?: Record<string, any>,
  ): AsyncGenerator<CheckpointTuple> {
    let count = 0;
    try {
      const files = await readdir(dir);
      const ids = files
        .filter(f => f.endsWith('.ckpt.json'))
        .map(f => f.replace(/\.ckpt\.json$/, ''))
        .sort((a, b) => b.localeCompare(a));

      for (const id of ids) {
        if (beforeCheckpointId && id >= beforeCheckpointId) continue;

        const tuple = await this.#loadCheckpoint(
          dir, threadId, checkpointNs, id,
          { configurable: { thread_id: threadId, checkpoint_ns: checkpointNs, checkpoint_id: id } },
        );
        if (!tuple) continue;

        if (filter && tuple.metadata) {
          const meta = tuple.metadata as Record<string, unknown>;
          if (!Object.entries(filter).every(([k, v]) => meta[k] === v)) continue;
        }

        yield tuple;
        count++;
        if (limit !== undefined && count >= limit) break;
      }
    } catch {
      // directory doesn't exist
    }
  }

  list(config: RunnableConfig, options?: CheckpointListOptions): AsyncGenerator<CheckpointTuple> {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = (config.configurable?.checkpoint_ns as string | undefined) ?? '';
    const beforeCheckpointId = options?.before?.configurable?.checkpoint_id as string | undefined;

    if (typeof threadId !== 'string') {
      return (async function* () {})();
    }

    const dir = nsDir(this.#root, threadId, checkpointNs);
    return this.#listGenerator(dir, threadId, checkpointNs, beforeCheckpointId, options?.limit, options?.filter);
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
  ): Promise<RunnableConfig> {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = (config.configurable?.checkpoint_ns as string | undefined) ?? '';
    const preparedCheckpoint = copyCheckpoint(checkpoint);

    if (typeof threadId !== 'string') {
      throw new Error('Failed to put checkpoint: thread_id is required');
    }

    const dir = nsDir(this.#root, threadId, checkpointNs);
    await mkdir(dir, { recursive: true });

    const [[, serializedCheckpoint], [, serializedMetadata]] = await Promise.all([
      this.serde.dumpsTyped(preparedCheckpoint),
      this.serde.dumpsTyped(metadata),
    ]);

    const ckptFile = checkpointPath(this.#root, threadId, checkpointNs, checkpoint.id);
    const parentCheckpointId = config.configurable?.checkpoint_id as string | undefined;

    await writeFile(ckptFile, JSON.stringify({
      checkpoint: Array.from(serializedCheckpoint),
      metadata: Array.from(serializedMetadata),
      parentCheckpointId,
    }), 'utf-8');

    return {
      configurable: {
        thread_id: threadId,
        checkpoint_ns: checkpointNs,
        checkpoint_id: checkpoint.id,
      },
    };
  }

  async putWrites(config: RunnableConfig, writes: [string, unknown][], taskId: string): Promise<void> {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = (config.configurable?.checkpoint_ns as string | undefined) ?? '';
    const checkpointId = config.configurable?.checkpoint_id;

    if (typeof threadId !== 'string') {
      throw new Error('Failed to put writes: thread_id is required');
    }
    if (typeof checkpointId !== 'string') {
      throw new Error('Failed to put writes: checkpoint_id is required');
    }

    const dir = nsDir(this.#root, threadId, checkpointNs);
    await mkdir(dir, { recursive: true });

    const writesFile = writesPath(this.#root, threadId, checkpointNs, checkpointId);

    let existing: Array<[string, string, number[]]> = [];
    if (existsSync(writesFile)) {
      try {
        const raw = await readFile(writesFile, 'utf-8');
        existing = JSON.parse(raw);
      } catch {
        existing = [];
      }
    }

    for (const [channel, value] of writes) {
      const [, serialized] = await this.serde.dumpsTyped(value);
      existing.push([taskId, channel, Array.from(serialized)]);
    }

    await writeFile(writesFile, JSON.stringify(existing), 'utf-8');
  }

  async deleteThread(threadId: string): Promise<void> {
    const dir = join(this.#root, threadId);
    if (existsSync(dir)) {
      await rm(dir, { recursive: true, force: true });
    }
  }

  async #loadCheckpoint(
    _dir: string,
    threadId: string,
    checkpointNs: string,
    checkpointId: string,
    _config: RunnableConfig,
  ): Promise<CheckpointTuple | undefined> {
    const ckptFile = checkpointPath(this.#root, threadId, checkpointNs, checkpointId);
    if (!existsSync(ckptFile)) return undefined;

    try {
      const raw = await readFile(ckptFile, 'utf-8');
      const { checkpoint: ckptBytes, metadata: metaBytes, parentCheckpointId } = JSON.parse(raw);

      const checkpoint = await this.serde.loadsTyped(
        'json',
        new Uint8Array(ckptBytes),
      ) as Checkpoint;

      const metadata = await this.serde.loadsTyped(
        'json',
        new Uint8Array(metaBytes),
      ) as CheckpointMetadata;

      // Load pending writes
      const writesFile = writesPath(this.#root, threadId, checkpointNs, checkpointId);
      let pendingWrites: [string, string, unknown][] | undefined = undefined;
      if (existsSync(writesFile)) {
        try {
          const writesRaw = await readFile(writesFile, 'utf-8');
          const storedWrites: Array<[string, string, number[]]> = JSON.parse(writesRaw);
          pendingWrites = await Promise.all(
            storedWrites.map(async ([tid, ch, val]) => {
              const value = await this.serde.loadsTyped('json', new Uint8Array(val));
              return [tid, ch, value] as [string, string, unknown];
            }),
          );
        } catch {
          pendingWrites = [];
        }
      }

      const tuple: CheckpointTuple = {
        config: {
          configurable: {
            thread_id: threadId,
            checkpoint_ns: checkpointNs,
            checkpoint_id: checkpointId,
          },
        },
        checkpoint,
        metadata,
      };

      if (pendingWrites !== undefined) {
        tuple.pendingWrites = pendingWrites;
      }

      if (typeof parentCheckpointId === 'string') {
        tuple.parentConfig = {
          configurable: {
            thread_id: threadId,
            checkpoint_ns: checkpointNs,
            checkpoint_id: parentCheckpointId,
          },
        };
      }

      return tuple;
    } catch {
      return undefined;
    }
  }
}
