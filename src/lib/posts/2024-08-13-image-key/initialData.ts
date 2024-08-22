import shoesPhoto from './builtin/shoes.jpg?url';
import mugPhoto from './builtin/mug.jpg?url';
import glassesPhoto from './builtin/glasses.jpg?url';
import { globalEmbedder } from './embedder';
import type { StoredData } from './types';

export async function getInitialData(): Promise<StoredData[]> {
  // Embed the images and load into the cache
  await Promise.all([shoesPhoto, mugPhoto, glassesPhoto].map((i) => globalEmbedder.embed(i)));

  return [
    {
      originalImage: shoesPhoto,
      data: 'Some shoes',
      embedding: await globalEmbedder.embed(shoesPhoto),
    },
    {
      originalImage: mugPhoto,
      data: 'A mug',
      embedding: await globalEmbedder.embed(mugPhoto),
    },
    {
      originalImage: glassesPhoto,
      data: 'Glasses',
      embedding: await globalEmbedder.embed(glassesPhoto),
    },
  ];
}
