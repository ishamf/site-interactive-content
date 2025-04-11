import { writeFile } from "fs/promises";
import { createReadStream } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { resolve, dirname, relative, join } from "path";
import { globSync } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolveFromRoot = (...p: string[]) => resolve(__dirname, "..", ...p);

const ignorePattern = ["**/*.html", "**/*.map", "_headers", "manifest.json"];

async function calculateMD5Hash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("md5");
    const stream = createReadStream(filePath);

    stream.on("data", (data: any) => {
      hash.update(data);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
}

async function main() {
  const distPath = resolveFromRoot("dist");

  const files = globSync("**/*", {
    cwd: distPath,
    nodir: true,
    ignore: ignorePattern,
  });

  console.log(`Found ${files.length} files to include in manifest`);

  const manifest = {
    updated: Date.now(),
    files: [] as { path: string; md5: string }[],
  };

  for (const file of files) {
    const fullPath = join(distPath, file);
    const hash = await calculateMD5Hash(fullPath);
    manifest.files.push({ path: file, md5: hash });
  }

  // Write manifest to file
  const manifestPath = join(distPath, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(
    `Manifest written to ${relative(resolveFromRoot(), manifestPath)}`
  );
}

main().catch((error) => {
  console.error("Error generating manifest:", error);
  process.exit(1);
});
