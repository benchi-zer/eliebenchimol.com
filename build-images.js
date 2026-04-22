const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");

const sourceRoot = path.join(__dirname, "images");
const outputRoot = path.join(__dirname, "build", "previews");
const gridOutputRoot = path.join(outputRoot, "grid");
const setOutputRoot = path.join(outputRoot, "sets");
const distRoot = path.join(__dirname, "dist");
const outputWidths = [800];
const webpQuality = 82;
const staticFiles = ["index.html", "style.css", "script.js"];
const buildScriptPath = __filename;

const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);

async function collectImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectImages(fullPath));
      continue;
    }

    if (entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function isFresh(filePath, sourceMtimeMs) {
  try {
    const outputStat = await fs.stat(filePath);
    return outputStat.size > 0 && outputStat.mtimeMs >= sourceMtimeMs;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function buildPreview(sourcePath, options = {}) {
  const relativePath = path.relative(sourceRoot, sourcePath);
  const parsed = path.parse(relativePath);
  const outputDir = path.join(options.outputRoot, parsed.dir);
  const sourceStat = await fs.stat(sourcePath);
  const metadata = await sharp(sourcePath).rotate().metadata();
  const shouldRotateToLandscape = options.rotatePortraits && metadata.height > metadata.width;
  const buildScriptStat = await fs.stat(buildScriptPath);
  const freshAfter = shouldRotateToLandscape
    ? Math.max(sourceStat.mtimeMs, buildScriptStat.mtimeMs)
    : sourceStat.mtimeMs;

  await fs.ensureDir(outputDir);

  for (const width of outputWidths) {
    const variants = [
      {
        filePath: path.join(outputDir, `${parsed.name}-${width}.webp`),
        format: "webp",
        quality: webpQuality
      }
    ];

    for (const variant of variants) {
      if (await isFresh(variant.filePath, freshAfter)) {
        continue;
      }

      let pipeline = sharp(sourcePath).rotate();

      if (shouldRotateToLandscape) {
        pipeline = pipeline.rotate(90);
      }

      pipeline = pipeline.resize({
        width,
        withoutEnlargement: true
      });

      await pipeline.webp({ quality: variant.quality }).toFile(variant.filePath);
    }
  }
}

async function buildDist() {
  await fs.emptyDir(distRoot);

  await Promise.all(staticFiles.map(async (file) => {
    await fs.copy(path.join(__dirname, file), path.join(distRoot, file));
  }));

  await fs.copy(outputRoot, path.join(distRoot, "build", "previews"));
}

async function main() {
  if (!await fs.pathExists(sourceRoot)) {
    throw new Error(`Missing source directory: ${sourceRoot}`);
  }

  const images = await collectImages(sourceRoot);

  await fs.emptyDir(outputRoot);

  for (const image of images) {
    const relativeImagePath = path.relative(sourceRoot, image);
    const isDetailsImage = relativeImagePath.split(path.sep)[0] === "details";

    await buildPreview(image, {
      outputRoot: gridOutputRoot,
      rotatePortraits: true
    });
    await buildPreview(image, {
      outputRoot: setOutputRoot,
      rotatePortraits: isDetailsImage
    });
  }

  await buildDist();

  console.log(`Built ${images.length} images into responsive previews`);
  console.log(`Prepared deploy folder: ${path.relative(__dirname, distRoot)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
