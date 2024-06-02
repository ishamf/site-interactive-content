import { createEmbedder } from './embedder';
import { PCA } from 'ml-pca';
import { Matrix } from 'ml-matrix';
import type { Sentence } from './types';

export function createProjector() {
  const embedder = createEmbedder();

  const projector = {
    project: async (sentences: Sentence[]) => {
      const sentenceEmbeddings = await embedder.embedMany(
        sentences.map((sentence) => sentence.value)
      );

      const dataset = new Matrix(sentenceEmbeddings);

      const pca = new PCA(dataset, { center: true });

      const projected = pca.predict(dataset);

      return sentences.map((sentence, i) => {
        return {
          ...sentence,
          x: projected.get(i, 0),
          y: projected.get(i, 1),
        };
      });
    },
  };

  return projector;
}
