import { pipeline, env, ImageFeatureExtractionPipeline } from '@xenova/transformers';
import { LRUCache } from 'lru-cache';
import { writable } from 'svelte/store';

env.allowLocalModels = false;

type EmbedderStatus = 'pending' | 'loading' | 'ready';

export class Embedder {
  pipelinePromise: Promise<ImageFeatureExtractionPipeline> | null = null;

  statusStore = writable<EmbedderStatus>('pending');
  loadPercentStore = writable(0);

  cache = new LRUCache<string, number[]>({
    max: 5000,
  });

  loadInitialCache(data: any) {
    this.cache.load(data);
  }

  private loadPipeline() {
    const totals: Record<string, number> = {};
    const loadeds: Record<string, number> = {};

    this.statusStore.set('loading');

    // Obtained by letting it run once
    const totalSizeOfModel = 89122045;

    const p = pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32', {
      progress_callback: (report: {
        status: string;
        file: string;
        loaded: number;
        total: number;
      }) => {
        console.log('Progress:', report);
        if (report.status === 'progress') {
          totals[report.file] = report.total;
          loadeds[report.file] = report.loaded;

          // Around 2.2mb of wasm is not reported, so we add it manually
          const total =
            (totalSizeOfModel || Object.values(totals).reduce((a, b) => a + b, 0)) + 2200000;

          const loaded = Object.values(loadeds).reduce((a, b) => a + b, 0);

          this.loadPercentStore.set((loaded / total) * 100);
        } else if (report.status === 'initiate') {
          // We don't have the total size of the file at the start, just put 1mb
          totals[report.file] = 1000000;
        }
      },
    });

    p.then(() => {
      console.log(
        'Actual total sum of all files:',
        Object.values(totals).reduce((a, b) => a + b, 0)
      );

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

  async embed(imageUrl: string): Promise<number[]> {
    const cachedData = this.cache.get(imageUrl);
    if (cachedData) {
      return cachedData;
    }

    const pipeline = await this.getPipeline();

    console.log('Embedding', imageUrl);

    const res = await pipeline(imageUrl);

    const result: number[] = Array.from(res.data);

    this.cache.set(imageUrl, result);

    // Used to prepare the cache
    console.log('embeddingsCache:', JSON.stringify(this.cache.dump()));

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

export const globalEmbedder = new Embedder();
