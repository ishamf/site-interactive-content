import { Embedder } from './embedder';
import { PCA } from 'ml-pca';
import { Matrix } from 'ml-matrix';
import type { Sentence } from './types';

export class Projector {
  pca: PCA | null = null;

  constructor(private embedder: Embedder) {}

  updatePCA(dataset: Matrix) {
    this.pca = new PCA(dataset, { center: true });
  }

  async project(sentences: Sentence[], updatePCA = false) {
    const sentenceEmbeddings = await this.embedder.embedMany(
      sentences.map((sentence) => sentence.value)
    );

    const dataset = new Matrix(sentenceEmbeddings);

    if (!this.pca || updatePCA) {
      this.updatePCA(dataset);
    }

    const projected = this.pca!.predict(dataset);

    return sentences.map((sentence, i) => {
      return {
        ...sentence,
        x: projected.get(i, 0),
        y: projected.get(i, 1),
      };
    });
  }
}
