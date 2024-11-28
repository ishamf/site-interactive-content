import { mkdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { copy, remove } from "fs-extra";
import { resolve, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolveFromRoot = (...p: string[]) => resolve(__dirname, "..", ...p);

const packages = await readdir(resolveFromRoot("packages"));

await remove(resolveFromRoot("dist"));
await mkdir(resolveFromRoot("dist"));
await copy(resolveFromRoot("public"), resolveFromRoot("dist"));

for (const p of packages) {
  const packageDist = resolveFromRoot("packages", p, "dist");
  if (existsSync(packageDist)) {
    await copy(packageDist, resolveFromRoot("dist"), {
      overwrite: false,
      errorOnExist: true,
    });
  }
}
