# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog site for Eduardo Gadotti (eduardogadotti.com), built with **Hexo v4.2.1** — a Node.js static site generator. Content is written in Markdown, rendered with EJS templates, and deployed to **Netlify** from the master branch.

The blog is written in **Brazilian Portuguese** and covers cybersecurity, InfoSec, web development, and DevSecOps topics.

## Common Commands

- `hexo server` — Start local dev server (localhost:4000)
- `hexo new page` — Generate static site to `source/_posts`
- `npm test` — Run the test suite (builds the site via `hexo generate` first, then validates generated output, internal links, and the `hexo server` smoke test)

## Testing

**Run `npm test` after every change** (dependency updates, theme/layout edits, config changes, custom scripts) to confirm nothing broke. This matters especially for Dependabot package bumps (hexo, renderers, generators, etc.), since the risk from those updates is entirely in the build pipeline and rendered output — there's no other safety net for them.

The suite lives in `test/` and covers:

- `test/output.test.js` — asserts key pages are generated correctly (home, archives, tags, special pages, the post linked from the theme menu) and that the RSS feed is valid and matches generated files
- `test/links.test.js` — crawls `public/` for broken internal links/assets
- `test/server.test.js` — starts `hexo server` and hits key routes (exercises `hexo-server`/`morgan`)

CI (`.github/workflows/ci.yml`) runs the same suite on every push/PR, including Dependabot PRs, on Node 18 to mirror the Netlify build environment.

## Architecture

### Content (`source/`)

- `source/_posts/` — Published blog posts (Markdown)
- `source/_drafts/` — Draft posts
- `source/imgs/` — Image assets (organized by topic)
- Special pages: `source/about/`, `source/tools/`, `source/outoftheboxpayloads/`, `source/tags/`

### Theme (`themes/clean-blog/`)

- `layout/` — EJS templates (index, post, page, archive layouts)
- `source/` — CSS (Stylus), JavaScript, favicon
- `_config.yml` — Theme-specific config (menu, social links, Google Analytics)

### Configuration

- `_config.yml` (root) — Hexo settings: permalink pattern (`:year/:month/:day/:title/`), language (pt), pagination (10 per page), syntax highlighting, RSS feed
- `themes/clean-blog/_config.yml` — Theme settings: navigation menu, social media links, analytics tracking

## Creating a New Post

Posts use this front matter format:

```yaml
---
title: Post Title
date: YYYY-MM-DD HH:mm:ss
tags: ["tag1", "tag2"]
cover: /imgs/path/cover.jpg
---
```

Place the `.md` file in `source/_posts/`. Cover images go in `source/imgs/`.

## Deployment

Netlify watches the master branch and automatically builds and deploys on push. No GitHub Actions or manual CI configuration needed.
