import { mkdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { copy, remove } from "fs-extra";
import { resolve, dirname, relative, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolveFromRoot = (...p: string[]) => resolve(__dirname, "..", ...p);

const root = resolveFromRoot();

const packages = await readdir(resolveFromRoot("packages"));

await remove(resolveFromRoot("dist"));
await mkdir(resolveFromRoot("dist"));

function createLogFilter(sourcePath: string) {
  function logFilter(p: string) {
    const subPath = relative(sourcePath, p);

    const relSourcePath = relative(root, sourcePath);
    const relDestPath = relative(root, resolveFromRoot("dist"));

    console.log(join(relDestPath, subPath), "<-", join(relSourcePath, subPath));

    return true;
  }

  return logFilter;
}

await copy(resolveFromRoot("public"), resolveFromRoot("dist"), {
  overwrite: false,
  errorOnExist: true,
  filter: createLogFilter(resolveFromRoot("public")),
});

for (const p of packages) {
  const packageDist = resolveFromRoot("packages", p, "dist");
  if (existsSync(packageDist)) {
    await copy(packageDist, resolveFromRoot("dist"), {
      overwrite: false,
      errorOnExist: true,
      filter: createLogFilter(packageDist),
    });
  }
}
