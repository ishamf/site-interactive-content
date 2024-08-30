import type { NoteData } from './types';

export function embeddingSimilarity(a: number[], b: number[]) {
  // Using cosine similarity

  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let aMagnitudeSq = 0;
  let bMagnitudeSq = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    aMagnitudeSq += a[i] ** 2;
    bMagnitudeSq += b[i] ** 2;
  }

  const aMagnitude = Math.sqrt(aMagnitudeSq);
  const bMagnitude = Math.sqrt(bMagnitudeSq);

  return dotProduct / (aMagnitude * bMagnitude);
}

export function closestEmbedding(embeddings: number[][], target: number[]) {
  let bestIndex = -1;
  let bestSimilarity = -Infinity;

  for (let i = 0; i < embeddings.length; i++) {
    const similarity = embeddingSimilarity(embeddings[i], target);

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestIndex = i;
    }
  }

  return bestIndex;
}

export function sortedNoteBySimilarity(
  embeddings: NoteData[],
  target: number[] | undefined
): { note: NoteData; similarity: number | undefined }[] {
  const res = embeddings.map((note) => ({
    note,
    similarity: target ? embeddingSimilarity(note.embedding, target) : undefined,
  }));

  if (target) {
    return res.sort((a, b) => b.similarity! - a.similarity!);
  }

  return res;
}

export function randomId() {
  return Math.random().toString(32).slice(2);
}
