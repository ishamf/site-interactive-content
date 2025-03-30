export function loadWorker(name: string) {
  // Separate this from the URL constructor to prevent Vite from transforming it
  const builtWorkerPath = `/workers/${name}.js`;

  const workerURL = import.meta.env.DEV
    ? new URL(`../workers/${name}.ts`, import.meta.url)
    : new URL(builtWorkerPath, import.meta.url);

  const loadScript = `import "${workerURL}";`;
  const blob = new Blob([loadScript], { type: 'application/javascript' });
  const blobURL = URL.createObjectURL(blob);
  const worker = new Worker(blobURL, {
    type: 'module',
  });
  URL.revokeObjectURL(blobURL);
  return worker;
}
