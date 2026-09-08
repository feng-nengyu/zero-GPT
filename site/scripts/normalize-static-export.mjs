import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Next 16.3's exporter joins Windows segment paths before replacing "/"
// with ".". The browser requests flat names, while Windows emits directories.
// Keep the generated files intact and add their canonical URL filenames.
// Linux exports are already flat, so this is a no-op in GitHub Actions.
export async function normalizeSegmentFiles(outputRoot) {
  let copied = 0;
  async function collect(directory, prefix, targetDirectory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const source = path.join(directory, entry.name);
      const name = prefix + "." + entry.name;
      if (entry.isDirectory()) await collect(source, name, targetDirectory);
      else if (entry.isFile() && entry.name.endsWith(".txt")) {
        await fs.copyFile(source, path.join(targetDirectory, name));
        copied++;
      }
    }
  }
  async function visit(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const child = path.join(directory, entry.name);
      if (entry.name.startsWith("__next."))
        await collect(child, entry.name, directory);
      else if (entry.name !== "_next") await visit(child);
    }
  }
  await visit(path.resolve(outputRoot));
  return copied;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const copied = await normalizeSegmentFiles(path.join(process.cwd(), "out"));
  console.log("Static navigation files normalized: " + copied);
}
