import { pipeline, env, FeatureExtractionPipeline } from '@xenova/transformers';
import { LRUCache } from 'lru-cache';
import { writable } from 'svelte/store';

// Use some initial data to avoid downloading the embedding model immediately
import initialCache from './embedding-init.json';

env.allowLocalModels = false;

type EmbedderStatus = 'pending' | 'loading' | 'ready';

export class Embedder {
  pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

  statusStore = writable<EmbedderStatus>('pending');
  loadPercentStore = writable(0);

  cache = new LRUCache<string, number[]>({
    max: 5000,
  });

  constructor() {
    this.cache.load(initialCache as any);
  }

  private loadPipeline() {
    const totals: Record<string, number> = {};
    const loadeds: Record<string, number> = {};

    this.statusStore.set('loading');

    const p = pipeline('feature-extraction', 'Supabase/gte-small', {
      progress_callback: (report: {
        status: string;
        file: string;
        loaded: number;
        total: number;
      }) => {
        if (report.status === 'progress') {
          totals[report.file] = report.total;
          loadeds[report.file] = report.loaded;

          // Around 2.2mb of wasm is not reported, so we add it manually
          const total = Object.values(totals).reduce((a, b) => a + b, 0) + 2200000;

          const loaded = Object.values(loadeds).reduce((a, b) => a + b, 0);
          
          this.loadPercentStore.set((loaded / total) * 100);
        } else if (report.status === 'initiate') {
          // We don't have the total size of the file at the start, just put 1mb
          totals[report.file] = 1000000;
        }
      },
    });

    p.then(() => {
      this.statusStore.set('ready');
    });

    return p;
  }

  private getPipeline() {
    if (!this.pipelinePromise) {
      this.pipelinePromise = this.loadPipeline();
    }
    return this.pipelinePromise;
  }

  async embed(sentence: string) {
    if (this.cache.has(sentence)) {
      return this.cache.get(sentence);
    }

    const pipeline = await this.getPipeline();

    const res = await pipeline(sentence, { normalize: true, pooling: 'mean' });

    const result: number[] = Array.from(res.data);

    this.cache.set(sentence, result);

    return result;
  }

  async embedMany(sentences: string[]) {
    return Promise.all(
      sentences.map(async (sentence) => {
        const res = await this.embed(sentence);

        if (!res) {
          throw new Error('Embedding failed');
        }

        return res;
      })
    );
  }
}
