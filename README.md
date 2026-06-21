# Photographer + Data Analyst Portfolio Website

Astro-powered static portfolio for photography and data analyst work.

The public site is fully static and deploys to GitHub Pages or Cloudflare Pages. Routine photography updates use the repo-local magic directory workflow:

```text
drop images into inbox/galleries/[gallery-folder]/
add or edit gallery.md
run npm run build
commit the generated Markdown and WebP files
```

`npm run build` automatically imports magic-directory galleries before building the site. No separate import command is needed for normal updates.

## Commands

```bash
npm install
npm run dev
npm run validate
npm run build
npm run preview
npm run social-copy
```

Use `npm run dev` while designing and reviewing locally. Use `npm run build` before committing or deploying.

## Site Sections

Main routes:

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

Photography, social media, and data work are intentionally separated so each audience can browse the proof that matters to them.

## Photography Galleries

Photography galleries are usually created from:

```text
inbox/galleries/[gallery-folder]/gallery.md
```

Minimum `gallery.md`:

```yaml
---
title: Corporate Event Name
photographyType: corporate-private-events
guidedContext: "The angle, useful facts, client value, venue, services, and moments the AI summary should use."
---
```

`guidedContext` is the single field for AI guidance. Put both the strategic angle and useful facts inside it. `autoSummary` is enabled implicitly for photography galleries, so you only need to set `autoSummary: false` when you do not want AI-assisted summary generation for that gallery.

When the AI summary runs for photography, it updates the generated gallery body and the frontmatter `summary` field, so gallery cards and gallery detail pages both use the improved description.

## Social Media Work

Social media examples live in:

```text
src/content/content-work/[slug].mdx
```

The public page is:

```text
/content/
```

The Social media page is intentionally one page for now, but the code separates the general embed grid from the featured case-study section. This makes it easy to split case studies into standalone pages later.

Typical frontmatter:

```yaml
title: Social Media Post
date: 2026-06-19
contentType: embed
platform: instagram
socialCategory: corporate
publishStatus: published
summary: Short description.
guidedContext: Strategic angle, useful facts, client value, and any metrics for AI-assisted copy.
embedHtml: "<blockquote>...</blockquote>"
externalUrl: https://example.com
coverImage: /images/example.webp
metrics:
  - value: 3k+
    label: likes
services:
  - Short-form editing
tags:
  - event-content
```

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

Use `corporate` for business-facing, education, training, professional, event, or brand authority content.
Use `lifestyle` for people-led, creator-style, behind-the-scenes, personality, travel, daily-life, or informal brand content.
Use `real-estate` for property, agent, developer, home-tour, or listing-adjacent content.

The Social media page selects `Corporate` by default. Tab order is `Corporate`, `Lifestyle`, `Real estate`, then `All`.

Use `embedHtml` for native platform embeds. Use `coverImage` plus `externalUrl` when you prefer a screenshot/preview card.

The Social media section shows each embed or linked visual preview in a side-by-side row with the MDX body text beside it. Keep that body text short and concise.

Metrics render as small highlight pills beside the text. Add them only when you want to publicly showcase numbers such as likes, comments, views, or saves.

### Editing Social Media Embeds

To add a normal embedded social post:

1. Create a new file in `src/content/content-work/`, such as `my-video.mdx`.
2. Set `contentType: embed`.
3. Set `platform` to `instagram`, `tiktok`, or `linkedin`.
4. Set `socialCategory` to `corporate`, `lifestyle`, or `real-estate`.
5. Paste the platform's embed code into `embedHtml`.
6. Add `externalUrl` so visitors can open the original post.
7. Add short text under the frontmatter, or use the AI-assisted copy workflow below.

To use a screenshot or image instead of a native embed:

1. Put the image somewhere under `public/images/`.
2. Set `coverImage` to that public path.
3. Leave `embedHtml` blank.
4. Set `externalUrl` if the card should link to the original post.

To hide a social media item without deleting it:

```yaml
publishStatus: draft
```

To remove an embedded post permanently, delete its `.mdx` file from `src/content/content-work/`.

### AI-Assisted Summaries

The full build imports magic-directory galleries first, then runs:

```bash
npm run social-copy
```

This script is optional and non-blocking. If `OPENAI_API_KEY` is not set, it skips generation and the build continues normally.

Set the key in the root `.env` file:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.4-mini
OPENAI_REASONING_EFFORT=low
```

Shell environment variables still override values in `.env`. The script uses OpenAI's Responses API and asks for low reasoning effort because this is a language-writing task, not a reasoning-heavy task.

To let the AI helper write concise, portfolio-style copy for a social media item or photography gallery, add:

```yaml
guidedContext: "Your preferred framing, angle, or selling point."
platformCaption: "Paste the post caption, transcript, or on-video spoken context here."
```

`guidedContext` has the highest priority. Use it for both strategy and facts: audience impact, client value, purpose, notable moments, deliverables, and any metrics. `platformCaption` is supporting context for social media posts, so the model should use it as evidence rather than simply repeating it.

`autoSummary` is enabled implicitly for social media and photography content. To opt out for a specific item, add:

```yaml
autoSummary: false
```

Then add an AI summary block in the body:

```md
{/* ai-summary:start */}
Existing fallback copy goes here.
{/* ai-summary:end */}
```

When `OPENAI_API_KEY` is available, the script writes only inside that block. Anything outside the block is preserved.

By default, existing AI summary blocks are preserved so normal builds do not constantly rewrite your copy. To intentionally refresh every AI-powered response, run:

```bash
npm run social-copy -- --regenerate
```

The same flag also works through the full build command:

```bash
npm run build -- --regenerate
```

Without `--regenerate`, the script only fills AI-powered items that do not already have an AI summary block.

The script rejects very short or incomplete AI outputs, so it should not overwrite good copy with fragments.

Optional model override:

```bash
OPENAI_MODEL=gpt-5.4-mini OPENAI_REASONING_EFFORT=low npm run social-copy
```

If you want to test a different OpenAI model later, set `OPENAI_MODEL` to that model name.

### Editing Case Studies

Case studies use the same folder:

```text
src/content/content-work/
```

Set:

```yaml
contentType: case-study
featured: true
```

The frontmatter controls the side media window:

```yaml
embedHtml: "<blockquote>...</blockquote>"
externalUrl: https://example.com
coverImage: /images/example.webp
```

The text underneath the frontmatter becomes the written case-study copy. Edit that Markdown body directly to change the case-study story.

## Photography Categories

The photography page has these category tabs:

```text
Corporate & private events
Stage work
Photoshoot
Wedding & ROM
All
```

Each gallery chooses its category with the `photographyType` field in `gallery.md`.

Allowed `photographyType` values:

```text
corporate-private-events
stage-work
photoshoot
wedding-rom
```

The Photography page selects `Corporate & private events` by default. The `All` tab sits at the rightmost end and shows every published gallery in reverse date order.

## Magic Directory Gallery Workflow

Create one folder per gallery:

```text
inbox/galleries/my-event/
  gallery.md
  DSC001.jpg
  DSC002.jpg
  DSC003.webp
```

Supported source image formats:

```text
.jpg
.jpeg
.png
.webp
```

The smallest useful `gallery.md` is:

```md
---
title: My Event
photographyType: corporate-private-events
---

Optional write-up here.
```

Then run:

```bash
npm run build
```

The build runs the magic importer first. It will:

- process images from `inbox/galleries/[slug]/`
- create 480px long-edge thumbnail WebPs
- create 2800px long-edge large WebPs
- strip image metadata during processing
- write generated images to `public/images/galleries/[slug]/`
- write `manifest.json` for fast repeat imports
- create or update `src/content/photography/[slug].md`
- build the final static site into `dist/`

Generated Markdown stays intentionally simple. It does not need an explicit `images:` list; the site reads gallery images from:

```text
public/images/galleries/[slug]/manifest.json
```

If `gallery.md` is missing, the importer creates a starter file using the folder name.

Raw inbox images are ignored by Git:

```text
inbox/
```

Commit the generated Markdown files, generated WebP files, and `manifest.json` files. That keeps the published site portable without committing original camera JPEGs.

## gallery.md Fields

Recommended fields:

```yaml
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
services:
  - Event photography
  - Speaker coverage
tags:
  - corporate
  - event
coverImage: /images/galleries/my-event/image-001-large.webp
```

Required in practice:

```yaml
title: My Event
```

Strongly recommended:

```yaml
photographyType: corporate-private-events
publishStatus: published
```

If optional metadata is missing, the site should still display the gallery where possible.

### Field Notes

`title`
: Human-readable gallery title.

`photographyType`
: Controls which Photography tab the gallery appears under.

`date`
: Used for sorting. Format should be `YYYY-MM-DD`.

`category`
: Small card label, such as `Corporate Event`, `Stage Work`, `Photoshoot`, or `Wedding & ROM`.

`client`
: Optional client name.

`clientVisibility`
: Controls client-name display. Allowed values are `public`, `confidential`, and `hidden`.

`featured`
: Marks the gallery as eligible for featured placements.

`publishStatus`
: Use `published` for live galleries. Other supported values are `draft` and `archived`.

`summary`
: Short text for cards and previews.

`description`
: Longer description for the gallery page.

`services`
: Optional list of services provided.

`tags`
: Optional list of tags.

`coverImage`
: Optional explicit cover image. If omitted, the site uses the first processed gallery image where possible.

## Data Projects

Data projects live in:

```text
src/content/data-projects/[slug].mdx
```

Typical frontmatter:

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

The MDX body is used for the project write-up.

## Deployment

GitHub Pages uses:

```text
.github/workflows/deploy-pages.yml
```

Cloudflare Pages settings:

```text
Build command: npm run build
Output directory: dist
```

No Cloudflare-specific code is required.
