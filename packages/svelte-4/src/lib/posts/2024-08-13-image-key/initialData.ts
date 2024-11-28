import mugPhotoRaw from './builtin/mug.jpg?url';
import glassesPhotoRaw from './builtin/glasses.jpg?url';
import walletPhotoRaw from './builtin/wallet.jpg?url';
import { globalEmbedder } from './embedder';
import type { NoteData } from './types';
import { randomId } from './utils';

import initialCache from './embedding-init.json';

const needRebase = new URL(import.meta.url).origin !== location.origin;

function rebaseWithScriptDomain(assetUrl: string) {
  if (!needRebase) return assetUrl;
  if (!assetUrl.startsWith('/')) return assetUrl;

  const url = new URL(import.meta.url);

  url.pathname = assetUrl;

  return url.toString();
}

const mugPhoto = rebaseWithScriptDomain(mugPhotoRaw);
const glassesPhoto = rebaseWithScriptDomain(glassesPhotoRaw);
const walletPhoto = rebaseWithScriptDomain(walletPhotoRaw);

export async function getInitialData(): Promise<NoteData[]> {
  // Use some initial data to avoid downloading the embedding model immediately
  const [walletEmbedding, mugEmbedding, glassesEmbedding] = initialCache;
  globalEmbedder.preloadEmbeddingForImage(walletPhoto, walletEmbedding);
  globalEmbedder.preloadEmbeddingForImage(mugPhoto, mugEmbedding);
  globalEmbedder.preloadEmbeddingForImage(glassesPhoto, glassesEmbedding);

  // Embed the images and load into the cache
  await Promise.all([walletPhoto, mugPhoto, glassesPhoto].map((i) => globalEmbedder.embed(i))).then(
    (res) => {
      // Used to prepare the cache
      console.log('embeddingsCache:', JSON.stringify(res));
    }
  );

  return [
    {
      id: randomId(),
      originalImage: walletPhoto,
      note: 'A wallet',
      embedding: await globalEmbedder.embed(walletPhoto),
    },
    {
      id: randomId(),
      originalImage: mugPhoto,
      note: 'A mug',
      embedding: await globalEmbedder.embed(mugPhoto),
    },
    {
      id: randomId(),
      originalImage: glassesPhoto,
      note: 'Glasses',
      embedding: await globalEmbedder.embed(glassesPhoto),
    },
  ];
}
