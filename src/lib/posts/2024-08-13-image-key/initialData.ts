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

  const url = new URL(import.meta.url);

  url.pathname = assetUrl;

  return url.toString();
}

const mugPhoto = rebaseWithScriptDomain(mugPhotoRaw);
const glassesPhoto = rebaseWithScriptDomain(glassesPhotoRaw);
const walletPhoto = rebaseWithScriptDomain(walletPhotoRaw);

const rebaseMap = {
  [mugPhotoRaw]: mugPhoto,
  [glassesPhotoRaw]: glassesPhoto,
  [walletPhotoRaw]: walletPhoto,
};

export async function getInitialData(): Promise<NoteData[]> {
  // Use some initial data to avoid downloading the embedding model immediately
  const rebasedInitialCache = needRebase
    ? (initialCache as [string, any][]).map(([k, v]) => [rebaseMap[k] || k, v])
    : initialCache;
  globalEmbedder.loadInitialCache(rebasedInitialCache as any);

  // Embed the images and load into the cache
  await Promise.all([walletPhoto, mugPhoto, glassesPhoto].map((i) => globalEmbedder.embed(i)));

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
