import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const imagesDir = path.join(rootDir, "images");
const outputPath = path.join(imagesDir, "image-manifest.js");
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const toWebPath = (value) => value.split(path.sep).join("/");

const entries = await readdir(imagesDir, { withFileTypes: true });
const manifest = {};

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith(".")) {
    continue;
  }

  const folderPath = path.join(imagesDir, entry.name);
  const childNames = await readdir(folderPath);
  const imagePaths = [];

  for (const childName of childNames.sort()) {
    if (childName.startsWith(".")) {
      continue;
    }

    const absoluteChildPath = path.join(folderPath, childName);
    const childStats = await stat(absoluteChildPath);

    if (!childStats.isFile()) {
      continue;
    }

    const extension = path.extname(childName).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      continue;
    }

    imagePaths.push(toWebPath(path.relative(rootDir, absoluteChildPath)));
  }

  manifest[entry.name] = imagePaths;
}

const fileContents = `window.IMAGE_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`;
await writeFile(outputPath, fileContents, "utf8");

console.log(`Wrote ${outputPath}`);
