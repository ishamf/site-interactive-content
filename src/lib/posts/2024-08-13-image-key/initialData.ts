import mugPhoto from './builtin/mug.jpg?url';
import glassesPhoto from './builtin/glasses.jpg?url';
import walletPhoto from './builtin/wallet.jpg?url';
import { globalEmbedder } from './embedder';
import type { NoteData } from './types';
import { randomId } from './utils';

export async function getInitialData(): Promise<NoteData[]> {
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
