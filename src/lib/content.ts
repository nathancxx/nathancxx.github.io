import type { CollectionEntry } from "astro:content";

export type PhotographyEntry = CollectionEntry<"photography">;
export type DataProjectEntry = CollectionEntry<"data-projects">;
export type ContentWorkEntry = CollectionEntry<"content-work">;

export function published<T extends { data: { publishStatus?: string; date?: Date } }>(items: T[]) {
  return items
    .filter((item) => item.data.publishStatus !== "draft" && item.data.publishStatus !== "archived")
    .sort((a, b) => safeDate(b.data.date).getTime() - safeDate(a.data.date).getTime());
}

export function featured<T extends { data: { featured?: boolean } }>(items: T[], limit = 2) {
  const featuredItems = items.filter((item) => item.data.featured);
  return (featuredItems.length ? featuredItems : items).slice(0, limit);
}

export function galleryUrl(item: PhotographyEntry) {
  return `/photography/gallery/${entrySlug(item)}/`;
}

export function projectUrl(item: DataProjectEntry) {
  return `/data/project/${entrySlug(item)}/`;
}

export function entrySlug(item: PhotographyEntry | DataProjectEntry | ContentWorkEntry) {
  return item.id.replace(/\.(md|mdx)$/, "");
}

export function formatDate(date: Date) {
  const safe = safeDate(date);
  if (safe.getTime() === 0) return "";
  return new Intl.DateTimeFormat("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(safe);
}

export function clientLabel(item: PhotographyEntry) {
  if (item.data.clientVisibility === "hidden") return "";
  if (item.data.clientVisibility === "confidential") return "Confidential client";
  return item.data.client || "";
}

export function safeDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}
