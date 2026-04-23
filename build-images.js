const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");

const sourceRoot = path.join(__dirname, "images");
const outputRoot = path.join(__dirname, "build", "previews");
const gridOutputRoot = path.join(outputRoot, "grid");
const setOutputRoot = path.join(outputRoot, "sets");
const highResOutputRoot = path.join(outputRoot, "highres");
const setVariantManifestPath = path.join(outputRoot, "set-variant-manifest.js");
const distRoot = path.join(__dirname, "dist");
const previewWidths = [480, 960];
const highResWidths = [2000];
const webpQuality = 82;
const staticFiles = ["index.html", "style.css", "script.js", "portfolio-data.js"];
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
  const metadata = typeof options.isPortrait === "boolean"
    ? null
    : await sharp(sourcePath).rotate().metadata();
  const isPortrait = typeof options.isPortrait === "boolean"
    ? options.isPortrait
    : metadata.height > metadata.width;
  const shouldRotateToLandscape = options.rotatePortraits && isPortrait;
  const buildScriptStat = await fs.stat(buildScriptPath);
  const freshAfter = shouldRotateToLandscape
    ? Math.max(sourceStat.mtimeMs, buildScriptStat.mtimeMs)
    : sourceStat.mtimeMs;

  await fs.ensureDir(outputDir);

  for (const width of options.widths || previewWidths) {
    const variants = [
      {
        filePath: path.join(outputDir, `${parsed.name}-${width}.webp`),
        format: "webp",
        quality: options.quality || webpQuality
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
  const setVariantPaths = [];

  await fs.emptyDir(outputRoot);

  for (const image of images) {
    const relativeImagePath = path.relative(sourceRoot, image).split(path.sep).join("/");
    const runtimePath = `images/${relativeImagePath}`;
    const metadata = await sharp(image).rotate().metadata();
    const isPortrait = metadata.height > metadata.width;

    await buildPreview(image, {
      outputRoot: gridOutputRoot,
      rotatePortraits: true,
      isPortrait
    });
    if (isPortrait) {
      await buildPreview(image, {
        outputRoot: setOutputRoot,
        rotatePortraits: false,
        isPortrait
      });
      setVariantPaths.push(runtimePath);
    }
    await buildPreview(image, {
      outputRoot: highResOutputRoot,
      rotatePortraits: false,
      widths: highResWidths,
      isPortrait,
      quality: 82
    });
  }

  await fs.writeFile(
    setVariantManifestPath,
    `window.__SET_VARIANT_PATHS = ${JSON.stringify(setVariantPaths)};\n`
  );

  await buildDist();

  console.log(`Built ${images.length} images into responsive previews`);
  console.log(`Prepared deploy folder: ${path.relative(__dirname, distRoot)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
