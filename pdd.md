# Product Design Document: Photographer + Data Analyst Portfolio Website

## 1. Product Summary

Build a clean, high-performance dual-purpose portfolio website for a photographer and data analyst. The website acts as both a photography showcase and a data analyst showcase.

The photography side should be clean, minimal, off-white, and image-led. The data side can be more analytical and technical, but should still share the same modern sans-serif visual system.

The publishing system should avoid portfolio-builder lock-in. New photography galleries should be created from simple local folders and Markdown files, then converted into static site content during build.

## 2. Core Principle

The site has two distinct audiences:

1. Photography clients, agencies, and collaborators.
2. Data/tech recruiters, employers, and collaborators.

Photography and data work should be visibly separated through dedicated pages, while the homepage acts as a refined gateway into both.

New events should not require hand-designing a page. A gallery folder plus `gallery.md` should be enough for the site to render a polished gallery.

## 3. Current Architecture

```text
inbox/galleries/[gallery-folder]/
    gallery.md
    source images
        ↓
npm run build
        ↓
scripts/import-magic-directory.mjs
        ↓
src/content/photography/[slug].md
public/images/galleries/[slug]/*.webp
public/images/galleries/[slug]/manifest.json
        ↓
Astro static build
        ↓
dist/
        ↓
GitHub Pages or Cloudflare Pages
```

The public website is fully static. There is no production backend, runtime CMS, or hosted upload service in the current system.

## 4. Technology Stack

```text
Framework: Astro
Language: TypeScript
Content: Markdown/MDX with YAML frontmatter
Styling: Global CSS
Image processing: Sharp
Gallery layout: Flickr justified-layout package
Lightbox: Custom static frontend JavaScript
Publishing workflow: Magic directory importer
Deployment: GitHub Actions / GitHub Pages, Cloudflare Pages
Package manager: npm
```

## 5. Main Routes

```text
/
/photography
/photography/corporate-events
/photography/gallery/[slug]
/content
/data
/data/project/[slug]
/contact
```

## 6. Homepage Requirements

The homepage should include:

- A minimal hero section with a personal positioning statement.
- A portrait/image card.
- Three short descriptors: `Corporate event photographer`, `Data analyst`, and `Curious Builder`.
- A `Find out more` button that scrolls to the corporate event work section.
- Corporate event work section showing recent photography cards.
- Data work section showing selected data/tech work.
- Contact card or contact call-to-action.

The hero should not overload the user with multiple competing CTAs. Photography and data CTAs should appear in their relevant sections.

## 6.1 Social Media Page Requirements

The site includes a top-level `/content/` page labelled as `Social media` in navigation and sitemap areas.

The Social media page should be one public page for now, but the implementation should keep the general social media grid and featured case study as separate components so case studies can become standalone pages later.

Page structure:

- Hero
- Category-filtered embed grid
- Featured case study section
- Contact CTA

Content examples live in:

```text
src/content/content-work/[slug].mdx
```

Recommended frontmatter:

```yaml
title: Social Media Post
date: 2026-06-19
contentType: embed
platform: instagram
socialCategory: corporate
publishStatus: published
summary: Short description.
guidedContext: Strategic angle, useful facts, client value, and metrics for AI-assisted copy.
platformCaption: Optional caption or transcript context.
embedHtml: "<blockquote>...</blockquote>"
externalUrl: https://example.com
coverImage: /images/example.webp
services:
  - Short-form editing
tags:
  - event-content
```

Social media embeds support AI-assisted body copy by default. Use `guidedContext` as the single AI guidance field for both strategic framing and factual context. Set `autoSummary: false` only when a specific embed should not be touched by the AI summary generator.

Allowed `contentType` values:

```text
embed
case-study
```

Allowed `platform` values:

```text
instagram
tiktok
linkedin
```

Allowed `socialCategory` values:

```text
corporate
lifestyle
real-estate
```

The Social media page should select `Corporate` by default. Tab order should be `Corporate`, `Lifestyle`, `Real estate`, then `All`.

## 7. Photography Page Requirements

The Photography page should be a clean browsing page.

It should show category tabs:

```text
Corporate & private events
Stage work
Photoshoot
Wedding & ROM
All
```

Default selected tab:

```text
Corporate & private events
```

The `All` tab sits at the rightmost end and shows every published gallery in reverse date order.

The page should not over-explain the category system. Users should see the tabs and gallery cards immediately.

## 8. Photography Categories

Each gallery must be classified through `photographyType` in its source `gallery.md`.

Allowed values:

```text
corporate-private-events
stage-work
photoshoot
wedding-rom
```

Display labels:

```text
corporate-private-events -> Corporate & private events
stage-work -> Stage work
photoshoot -> Photoshoot
wedding-rom -> Wedding & ROM
```

If `photographyType` is missing or invalid, the gallery should still be displayed where possible instead of crashing the site. The importer should default missing values to:

```text
corporate-private-events
```

## 9. Magic Directory Workflow

Routine gallery publishing should use:

```text
inbox/galleries/
```

Each gallery gets one folder:

```text
inbox/galleries/my-event/
  gallery.md
  DSC001.jpg
  DSC002.jpg
  DSC003.webp
```

Then run:

```bash
npm run build
```

`npm run build` must run the magic importer before the Astro build. Users should not need to run a separate import command during normal publishing.

The importer should:

- scan `inbox/galleries/*`
- treat each folder as one gallery
- slugify the folder name
- read optional `gallery.md`
- create a starter `gallery.md` if missing
- process `.jpg`, `.jpeg`, `.png`, and `.webp`
- generate 480px long-edge WebP thumbnails
- generate 2800px long-edge WebP large images
- strip EXIF/GPS metadata
- save output to `public/images/galleries/[slug]/`
- create or update `src/content/photography/[slug].md`
- create or update `public/images/galleries/[slug]/manifest.json`
- avoid reprocessing unchanged files when possible

Generated files should be committed. Raw inbox files should not be committed.

## 10. gallery.md Fields

Source file:

```text
inbox/galleries/[gallery-folder]/gallery.md
```

Smallest useful file:

```md
---
title: My Event
photographyType: corporate-private-events
guidedContext: "The angle, useful facts, client value, venue, services, and moments the AI summary should use."
---

Optional write-up here.
```

Recommended full example:

```md
---
title: My Event
photographyType: corporate-private-events
date: 2026-06-19
category: Corporate Event
client: Client Name
clientVisibility: public
featured: false
publishStatus: published
summary: Short card summary.
description: Longer gallery description.
guidedContext: "Strategic angle, useful facts, client value, venue, services, and moments for AI-assisted gallery summary."
autoSummary: true
services:
  - Event photography
  - Speaker coverage
tags:
  - corporate
  - event
coverImage: /images/galleries/my-event/image-001-large.webp
---

Optional write-up here.
```

### Required

`title`
: Human-readable gallery title. If missing, the importer may infer it from the folder name.

### Strongly Recommended

`photographyType`
: Determines the photography category tab.

`publishStatus`
: Determines whether the gallery is publicly listed. Use `published` for live galleries.

`date`
: Used for sorting. Format should be `YYYY-MM-DD`.

### Optional

`category`
: Small label shown on cards.

`client`
: Client name.

`clientVisibility`
: Allowed values are `public`, `confidential`, and `hidden`.

`featured`
: Marks the gallery as eligible for featured placements.

`summary`
: Short text for cards and previews.

`description`
: Longer gallery-page description.

`guidedContext`
: Single guidance field for AI-assisted summaries. Use this for strategy, factual details, client context, deliverables, audience, useful metrics, and notable moments.

`autoSummary`
: AI summaries are enabled implicitly for photography galleries. Set this to `false` only when a gallery should not be touched by the AI summary generator.

`services`
: List of services provided.

`tags`
: List of tags.

`coverImage`
: Explicit cover image path. If omitted, the first image from the manifest can be used.

## 11. Generated Markdown

Generated photography content lives in:

```text
src/content/photography/[slug].md
```

The generated Markdown should remain simple. It does not need an explicit `images:` array.

Gallery image data should come from:

```text
public/images/galleries/[slug]/manifest.json
```

Fallback order for gallery images:

1. Explicit `images:` in Markdown, for backwards compatibility.
2. `manifest.json`.
3. Build-time folder scan where possible.
4. Friendly empty-gallery message.

## 12. Image Processing

For each source image:

- Auto-orient image.
- Convert to sRGB.
- Strip EXIF/GPS metadata.
- Generate thumbnail WebP: 480px long edge.
- Generate large WebP: 2800px long edge.
- Record `width`, `height`, and `aspectRatio`.

Output naming:

```text
public/images/galleries/[slug]/image-001-thumb.webp
public/images/galleries/[slug]/image-001-large.webp
```

Recommended quality:

```text
thumb: 80
large: 86
```

No JPEG, AVIF, small, standard, or original exports are required.

## 13. Gallery Layout and Lightbox

The gallery layout should use justified rows, not masonry.

Requirements:

- Use `justified-layout` for thumbnail row calculations.
- Preserve portrait, landscape, and square aspect ratios.
- Lazy-load thumbnails.
- Render the first 30 images initially.
- Use `Load More` for additional images in batches of 30.
- Load large images only when opened in the lightbox.
- Support keyboard navigation.
- Support visible previous/next buttons.
- Fit portrait and landscape images correctly in the lightbox.

Large galleries should remain usable at 100+ images and should not eagerly render all images on first load.

## 14. Data Project Content

Data projects live in:

```text
src/content/data-projects/[slug].mdx
```

Recommended frontmatter:

```yaml
title: Project Title
date: 2026-06-19
featured: true
publishStatus: published
summary: Short project summary.
tools:
  - Python
  - SQL
tags:
  - analytics
githubUrl: https://github.com/example/project
demoUrl: https://example.com
coverImage: /images/data/project-cover.webp
```

The MDX body is used for the narrative case study.

## 15. Validation Philosophy

Validation should protect the site from broken builds, but routine publishing should remain forgiving.

Preferred behavior:

- Missing optional metadata should not break display.
- Invalid optional metadata should be warned about where possible.
- Missing images should produce a friendly empty state instead of a crash.
- Published galleries should still favor complete metadata, but the site should prioritize displaying the work.

Validation should check:

- date format where provided
- allowed `publishStatus` values
- allowed `clientVisibility` values
- allowed `photographyType` values
- existing cover image where provided
- image manifest paths where available
- positive image dimensions and aspect ratios

## 16. Deployment

GitHub Pages:

```text
.github/workflows/deploy-pages.yml
```

Cloudflare Pages:

```text
Build command: npm run build
Output directory: dist
```

No Cloudflare-specific code should be required.

## 17. Git Rules

Do not commit:

```text
node_modules/
dist/
inbox/
.env
.env.*
.portfolio-auth/
.google-auth/
.DS_Store
```

Commit:

```text
src/content/photography/[slug].md
public/images/galleries/[slug]/*.webp
public/images/galleries/[slug]/manifest.json
src/content/data-projects/[slug].mdx
```

This keeps the live site portable without committing original source images.

## 18. Current Non-Goals

The current product does not include:

- Hosted upload dashboard
- Production backend
- Client proofing galleries
- Private client login
- Payment system
- Booking system
- CRM
- RAW file editing
- Full-resolution client delivery

## 19. Acceptance Criteria

The system is working when:

- A new folder in `inbox/galleries/` can become a gallery after `npm run build`.
- The generated gallery appears on `/photography`.
- `photographyType` controls the category tab.
- `All` shows every published gallery newest-to-oldest.
- The default Photography tab is `Corporate & private events`.
- Gallery images use generated local WebP assets.
- The justified gallery preserves image shapes.
- The lightbox handles portrait and landscape images correctly.
- `npm run validate` passes.
- `npm run build` passes.
- The generated `dist/` can deploy to GitHub Pages and Cloudflare Pages.
