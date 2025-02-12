import { createWriteStream, createReadStream, existsSync } from 'fs';
import { createHash } from 'crypto';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

async function downloadFile(url: string, target: string) {
  const stream = createWriteStream(target);
  const res = await fetch(url);

  if (!res.body) {
    throw new Error(`Failed to download ${url}`);
  }

  await finished(Readable.fromWeb(res.body as any).pipe(stream));
}

async function hashFile(target: string) {
  const hash = createHash('sha256');
  const stream = createReadStream(target);

  stream.pipe(hash);

  await finished(stream);

  return hash.digest('hex');
}

const files = [
  {
    url: 'https://huggingface.co/Supabase/bge-small-en/resolve/main/onnx/model_quantized.onnx',
    target: 'playwright-cache/model_quantized.onnx',
    hash: '93b3c104db8309d72a822d18eaae67ccdedaf81bdea0d03dd477dfb666e75e77',
  },
];

for (const file of files) {
  if (existsSync(file.target)) {
    const fileHash = await hashFile(file.target);

    if (fileHash === file.hash) {
      console.log(`File ${file.target} is already downloaded and has the correct hash`);
      continue;
    }
  }

  await downloadFile(file.url, file.target);

  console.log(`Downloaded ${file.url} to ${file.target}`);
}
