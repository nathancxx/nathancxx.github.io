import { defineCollection, z } from "astro:content";

const stringOrDefault = (fallback: string) =>
  z.preprocess((value) => (typeof value === "string" && value.trim() ? value : fallback), z.string());

const optionalString = z.preprocess((value) => (value === null || value === undefined ? "" : String(value)), z.string()).optional();
const publishStatus = z.preprocess(
  (value) => (["draft", "published", "archived"].includes(String(value)) ? value : "published"),
  z.enum(["draft", "published", "archived"])
);
const clientVisibility = z.preprocess(
  (value) => (["public", "confidential", "hidden"].includes(String(value)) ? value : "hidden"),
  z.enum(["public", "confidential", "hidden"])
);
const photoSection = z.preprocess(
  (value) => (["corporate-events", "content", "portraits", "personal"].includes(String(value)) ? value : "corporate-events"),
  z.enum(["corporate-events", "content", "portraits", "personal"])
);
const photographyType = z.preprocess(
  (value) =>
    ["corporate-private-events", "stage-work", "photoshoot", "wedding-rom"].includes(String(value))
      ? value
      : "corporate-private-events",
  z.enum(["corporate-private-events", "stage-work", "photoshoot", "wedding-rom"])
);
const contentType = z.preprocess(
  (value) => (["embed", "case-study"].includes(String(value)) ? value : "embed"),
  z.enum(["embed", "case-study"])
);
const contentPlatform = z.preprocess(
  (value) => (["instagram", "tiktok", "linkedin"].includes(String(value)) ? value : "instagram"),
  z.enum(["instagram", "tiktok", "linkedin"])
);
const socialCategory = z.preprocess(
  (value) => {
    if (String(value) === "adult-education") return "corporate";
    return ["corporate", "real-estate", "lifestyle"].includes(String(value)) ? value : "lifestyle";
  },
  z.enum(["corporate", "real-estate", "lifestyle"])
);
const looseDate = z.preprocess((value) => {
  const date = value instanceof Date ? value : new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}, z.date());
const looseBoolean = z.preprocess((value) => value === true || value === "true", z.boolean());
const stringArray = z.preprocess((value) => (Array.isArray(value) ? value.map(String) : []), z.array(z.string()));
const numberOptional = z.preprocess((value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}, z.number().positive().optional());

const imageSchema = z.object({
  thumb: stringOrDefault(""),
  large: stringOrDefault(""),
  width: numberOptional,
  height: numberOptional,
  aspectRatio: numberOptional,
  alt: optionalString
});

const photography = defineCollection({
  type: "content",
  schema: z.object({
    title: stringOrDefault("Untitled gallery"),
    date: looseDate.default(new Date(0)),
    category: stringOrDefault("Photography"),
    section: photoSection,
    photographyType,
    venue: optionalString,
    client: optionalString,
    clientVisibility,
    featured: looseBoolean.default(false),
    publishStatus,
    coverImage: optionalString,
    googlePhotosUrl: optionalString,
    summary: optionalString,
    description: optionalString,
    guidedContext: optionalString,
    platformCaption: optionalString,
    autoSummary: looseBoolean.default(true),
    services: stringArray.default([]),
    tags: stringArray.default([]),
    testimonial: optionalString,
    images: z.array(imageSchema).default([])
  })
});

const dataProjects = defineCollection({
  type: "content",
  schema: z.object({
    title: stringOrDefault("Untitled project"),
    date: looseDate.default(new Date(0)),
    featured: looseBoolean.default(false),
    publishStatus,
    summary: optionalString,
    tools: stringArray.default([]),
    tags: stringArray.default([]),
    githubUrl: optionalString,
    demoUrl: optionalString,
    coverImage: optionalString,
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([])
  })
});

const contentWork = defineCollection({
  type: "content",
  schema: z.object({
    title: stringOrDefault("Untitled content piece"),
    date: looseDate.default(new Date(0)),
    contentType,
    platform: contentPlatform,
    socialCategory,
    featured: looseBoolean.default(false),
    publishStatus,
    summary: optionalString,
    guidedContext: optionalString,
    platformCaption: optionalString,
    autoSummary: looseBoolean.default(true),
    embedHtml: optionalString,
    externalUrl: optionalString,
    coverImage: optionalString,
    client: optionalString,
    role: optionalString,
    services: stringArray.default([]),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    tags: stringArray.default([])
  })
});

export const collections = {
  photography,
  "data-projects": dataProjects,
  "content-work": contentWork
};
