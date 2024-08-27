import shoesPhoto from './builtin/shoes.jpg?url';
import mugPhoto from './builtin/mug.jpg?url';
import glassesPhoto from './builtin/glasses.jpg?url';
import walletPhoto from './builtin/wallet.jpg?url';
import { globalEmbedder } from './embedder';
import type { NoteData } from './types';

export async function getInitialData(): Promise<NoteData[]> {
  // Embed the images and load into the cache
  await Promise.all([walletPhoto, mugPhoto, glassesPhoto].map((i) => globalEmbedder.embed(i)));

  return [
    {
      originalImage: walletPhoto,
      note: 'A wallet',
      embedding: await globalEmbedder.embed(shoesPhoto),
    },
    {
      originalImage: mugPhoto,
      note: 'A mug',
      embedding: await globalEmbedder.embed(mugPhoto),
    },
    {
      originalImage: glassesPhoto,
      note: 'Glasses',
      embedding: await globalEmbedder.embed(glassesPhoto),
    },
  ];
}
