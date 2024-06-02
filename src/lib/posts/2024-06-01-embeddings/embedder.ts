import { pipeline, env } from '@xenova/transformers';
import { LRUCache } from 'lru-cache';

env.allowLocalModels = false;

export function createEmbedder() {
  let pipelinePromise: ReturnType<typeof loadPipeline> | null = null;

  const cache = new LRUCache<string, number[]>({
    max: 5000,
  });

  function loadPipeline() {
    return pipeline('feature-extraction', 'Supabase/gte-small', { progress_callback: console.log });
  }

  function getPipeline() {
    if (!pipelinePromise) {
      pipelinePromise = loadPipeline();
    }
    return pipelinePromise;
  }

  const embedder = {
    embed: async (sentence: string) => {
      if (cache.has(sentence)) {
        return cache.get(sentence);
      }

      const pipeline = await getPipeline();

      const res = await pipeline(sentence, { normalize: true, pooling: 'mean' });

      const result: number[] = Array.from(res.data);

      cache.set(sentence, result);

      return result;
    },

    embedMany: async (sentences: string[]) => {
      return Promise.all(
        sentences.map(async (sentence) => {
          const res = await embedder.embed(sentence);

          if (!res) {
            throw new Error('Embedding failed');
          }

          return res;
        })
      );
    },
  };

  return embedder;
}
