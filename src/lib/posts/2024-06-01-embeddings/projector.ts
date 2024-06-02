import { createEmbedder } from './embedder';
import type { Sentence } from './types';

function project(a: number[], b: number[]) {
  const dotAB = a.reduce((acc, cur, i) => acc + cur * b[i], 0);
  const dotBB = b.reduce((acc, cur) => acc + cur * cur, 0);

  return dotAB / dotBB;
}

export function createProjector() {
  const embedder = createEmbedder();

  const projector = {
    project: async (x1: string, x2: string, y1: string, y2: string, sentences: Sentence[]) => {
      const [x1Vec, x2Vec, y1Vec, y2Vec, ...sentenceEmbeddings] = await embedder.embedMany([
        x1,
        x2,
        y1,
        y2,
        ...sentences.map((sentence) => sentence.value),
      ]);

      const xVec = x2Vec!.map((x, i) => x - x1Vec![i]);
      const yVec = y2Vec!.map((y, i) => y - y1Vec![i]);

      return sentences.map((sentence, i) => {
        return {
          ...sentence,
          x: project(sentenceEmbeddings[i]!, xVec),
          y: project(sentenceEmbeddings[i]!, yVec),
        };
      });
    },
  };

  return projector;
}
