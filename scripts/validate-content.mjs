import { readFileSync, readdirSync } from "node:fs";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const contentDir = path.join(root, "src", "content");
const errors = [];
const warnings = [];
const allowedPhotographyTypes = ["corporate-private-events", "stage-work", "photoshoot", "wedding-rom"];
const allowedContentTypes = ["embed", "case-study"];
const allowedContentPlatforms = ["instagram", "tiktok", "linkedin"];
const allowedSocialCategories = ["corporate", "lifestyle", "real-estate"];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

async function existsPublic(publicPath) {
  if (!publicPath || typeof publicPath !== "string") return false;
  if (/^https?:\/\//.test(publicPath)) return true;
  if (!publicPath.startsWith("/")) return false;
  try {
    await access(path.join(publicDir, publicPath.slice(1)));
    return true;
  } catch {
    return false;
  }
}

async function readContentFiles(collection, extensions) {
  const dir = path.join(contentDir, collection);
  const files = (await readdir(dir)).filter((file) => extensions.some((extension) => file.endsWith(extension))).sort();
  return Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(dir, file);
      const parsed = matter(await readFile(fullPath, "utf8"));
      return {
        file,
        slugFromFile: file.replace(/\.(md|mdx)$/, ""),
        data: parsed.data,
        body: parsed.content.trim()
      };
    })
  );
}

function imageCandidates(gallery) {
  const frontmatterImages = Array.isArray(gallery.data.images)
    ? gallery.data.images.filter((image) => image && typeof image === "object" && (image.thumb || image.large))
    : [];
  if (frontmatterImages.length > 0) return frontmatterImages;

  const manifestImages = imageCandidatesFromManifest(gallery.slugFromFile);
  if (manifestImages.length > 0) return manifestImages;

  return imageCandidatesFromFolder(gallery.slugFromFile);
}

function imageCandidatesFromManifest(slug) {
  try {
    const manifestPath = path.join(publicDir, "images", "galleries", slug, "manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    return (manifest.sourceFiles || [])
      .map((file) => ({
        thumb: file.outputThumb ? `/images/galleries/${slug}/${file.outputThumb}` : "",
        large: file.outputLarge ? `/images/galleries/${slug}/${file.outputLarge}` : ""
      }))
      .filter((image) => image.thumb || image.large);
  } catch {
    return [];
  }
}

function imageCandidatesFromFolder(slug) {
  try {
    const galleryDir = path.join(publicDir, "images", "galleries", slug);
    const files = readdirSync(galleryDir).filter((file) => file.endsWith(".webp")).sort();
    return files.map((file) => ({
      thumb: `/images/galleries/${slug}/${file}`,
      large: `/images/galleries/${slug}/${file}`
    }));
  } catch {
    return [];
  }
}


async function validatePhotography() {
  const galleries = await readContentFiles("photography", [".md", ".mdx"]);
  const seenFiles = new Set();

  for (const gallery of galleries) {
    if (seenFiles.has(gallery.slugFromFile)) warn(`Duplicate filename slug seen: ${gallery.slugFromFile}`);
    seenFiles.add(gallery.slugFromFile);

    if (!gallery.data.title) warn(`Photography gallery "${gallery.file}" has no title; filename fallback will be used.`);
    if (gallery.data.slug && gallery.data.slug !== gallery.slugFromFile) {
      warn(`Photography gallery "${gallery.file}" slug does not match filename; filename route will be used.`);
    }
    if (gallery.data.publishStatus && !["draft", "published", "archived"].includes(String(gallery.data.publishStatus))) {
      warn(`Photography gallery "${gallery.file}" has invalid publishStatus; it will render as published.`);
    }
    if (gallery.data.section && !["corporate-events", "content", "portraits", "personal"].includes(String(gallery.data.section))) {
      warn(`Photography gallery "${gallery.file}" has invalid section; corporate-events fallback will be used.`);
    }
    if (gallery.data.photographyType && !allowedPhotographyTypes.includes(String(gallery.data.photographyType))) {
      warn(`Photography gallery "${gallery.file}" has invalid photographyType; corporate-private-events fallback will be used.`);
    }

    const images = imageCandidates(gallery);
    if (images.length === 0) {
      fail(`Photography gallery "${gallery.file}" has no usable images. Add at least one image with thumb or large.`);
      continue;
    }

    for (const [index, image] of images.entries()) {
      const displayPath = image.large || image.thumb;
      const thumbPath = image.thumb || image.large;
      if (!(await existsPublic(displayPath))) {
        warn(`Photography gallery "${gallery.file}" image ${index + 1} large path was not found: ${displayPath}`);
      }
      if (!(await existsPublic(thumbPath))) {
        warn(`Photography gallery "${gallery.file}" image ${index + 1} thumb path was not found: ${thumbPath}`);
      }
    }
  }
}

async function validateDataProjects() {
  const projects = await readContentFiles("data-projects", [".md", ".mdx"]);
  for (const project of projects) {
    if (!project.data.title) warn(`Data project "${project.file}" has no title; filename fallback will be used.`);
    if (project.data.coverImage && !(await existsPublic(project.data.coverImage))) {
      warn(`Data project "${project.file}" coverImage was not found: ${project.data.coverImage}`);
    }
  }
}

async function validateContentWork() {
  const items = await readContentFiles("content-work", [".md", ".mdx"]);
  for (const item of items) {
    if (!item.data.title) warn(`Content item "${item.file}" has no title; filename fallback will be used.`);
    if (item.data.publishStatus && !["draft", "published", "archived"].includes(String(item.data.publishStatus))) {
      warn(`Content item "${item.file}" has invalid publishStatus; it will render as published.`);
    }
    if (item.data.contentType && !allowedContentTypes.includes(String(item.data.contentType))) {
      warn(`Content item "${item.file}" has invalid contentType; embed fallback will be used.`);
    }
    if (item.data.platform && !allowedContentPlatforms.includes(String(item.data.platform))) {
      warn(`Content item "${item.file}" has invalid platform; instagram fallback will be used.`);
    }
    const socialCategory = String(item.data.socialCategory || "");
    if (socialCategory === "adult-education") {
      warn(`Content item "${item.file}" uses legacy socialCategory "adult-education"; use "corporate" instead.`);
    } else if (item.data.socialCategory && !allowedSocialCategories.includes(socialCategory)) {
      warn(`Content item "${item.file}" has invalid socialCategory; lifestyle fallback will be used.`);
    }
    if (item.data.coverImage && !(await existsPublic(item.data.coverImage))) {
      warn(`Content item "${item.file}" coverImage was not found: ${item.data.coverImage}`);
    }
  }
}

await validatePhotography();
await validateDataProjects();
await validateContentWork();

for (const warning of warnings) console.warn(`Warning: ${warning}`);

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} issue${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Content validation passed.");
