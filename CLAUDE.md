# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog site for Eduardo Gadotti (eduardogadotti.com), built with **Hexo v4.2.1** — a Node.js static site generator. Content is written in Markdown, rendered with EJS templates, and deployed to **Netlify** from the master branch.

The blog is written in **Brazilian Portuguese** (default language) and covers cybersecurity, InfoSec, web development, and DevSecOps topics. Selected posts also have an **English version under `/en/`**, with a flag button in the menu to switch languages (see [Internationalization](#internationalization-pt--en)).

## Common Commands

- `hexo server` — Start local dev server (localhost:4000)
- `hexo new page` — Generate static site to `source/_posts`
- `npm test` — Run the test suite (builds the site via `hexo generate` first, then validates generated output, internal links, and the `hexo server` smoke test)

## Testing

**Run `npm test` after every change** (dependency updates, theme/layout edits, config changes, custom scripts) to confirm nothing broke. This matters especially for Dependabot package bumps (hexo, renderers, generators, etc.), since the risk from those updates is entirely in the build pipeline and rendered output — there's no other safety net for them.

The suite lives in `test/` and covers:

- `test/output.test.js` — asserts key pages are generated correctly (home, archives, tags, special pages, the post linked from the theme menu) and that the RSS feed is valid and matches generated files
- `test/links.test.js` — crawls `public/` for broken internal links/assets
- `test/server.test.js` — starts `hexo server` and hits key routes, including the EN home and the translated post (exercises `hexo-server`/`morgan`)
- `test/i18n.test.js` — English version: `/en/` pages, language switch + `hreflang` pairs, the PT site untouched by EN content, and source integrity (`translation_key`/`translated_by` of every EN post)

CI (`.github/workflows/ci.yml`) runs the same suite on every push/PR, including Dependabot PRs, on Node 18 to mirror the Netlify build environment.

## Architecture

### Content (`source/`)

- `source/_posts/` — Published blog posts (Markdown)
- `source/en/_posts/` — English versions of posts (see [Internationalization](#internationalization-pt--en))
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

## Internationalization (PT / EN)

PT is the default language and keeps its URLs unchanged (`/2026/09/05/slug/`). English lives under `/en/` (`/en/2026/09/05/slug/`). Single build, single Netlify deploy. Only selected posts are translated; the rest stay PT-only.

### How it works

Hexo has no content i18n, only UI i18n. Two pieces cooperate:

- **Hexo core:** `i18n_dir: :lang` (root `_config.yml`) + `themes/clean-blog/languages/en.yml` make every route under `en/` get `page.lang = 'en'` and switch `__()` to English. PT pages get `page.lang = 'pt'`.
- **`scripts/i18n.js`** (our code): a processor reads `source/en/_posts/*.md` (Hexo ignores `_*` folders outside `source/_posts`), and a generator renders them and emits the EN routes: posts, paginated home (`/en/`, `/en/page/N/`), tag index and tag pages (`/en/tags/...`). EN posts are **deliberately not inserted into Hexo's `Post` model**, so the PT generators (index, archive, tags, RSS) never see EN content and PT output is unchanged.

The same script registers the theme helpers:

- `i18n_alternate()` — target language and URL of the language switch, plus the `hreflang` pairs. Equivalences are exact for: home, tag index, tags that exist in both languages, and posts linked by `translation_key`. **Any other page falls back to the home of the other language** (and emits no `hreflang`).
- `site_text(key)` — `config[key]` in PT, `config[key_en]` in EN (`subtitle_en`, `description_en` in the root `_config.yml`).
- `post_date(date)` — PT keeps `date_format` (`DD-MM-YYYY`); EN uses `date_format` from `languages/en.yml` (`MMMM D, YYYY`).

Theme pieces: language switch (flag + code, `themes/clean-blog/source/img/flags/`) in `_partial/menu.ejs`; `hreflang` links in `_partial/head.ejs`; AI-translation notice in `_partial/article-full.ejs`; EN menu from `menu_en` in `themes/clean-blog/_config.yml` (text items only — social icons are reused from `menu`).

### Creating an English version of a post

1. Add `translation_key: <slug of the PT post file>` to the **PT** post's front matter (e.g. `investindo-certo-gastando-menos`).
2. Create `source/en/_posts/<english-slug>.md` (file name = EN slug, `new_post_name: :title.md` convention) with the **same `date`**, so both versions share the day in the permalink:

```yaml
---
title: English Title
date: YYYY-MM-DD HH:mm:ss        # same as the PT post
tags: ["tag1", "tag2"]           # same tag names as PT, so tag pages pair up
translation_key: <pt-post-slug>  # links PT <-> EN; unique among EN posts
translated_by: ai-reviewed       # required for translated posts: shows the "translated with AI, reviewed by the author" notice with a link to the original
---
```

3. Internal links inside the EN body must point to the EN version (or to the PT one on purpose); images in `source/imgs/` are shared by both languages. Heading ids are generated from the English headings, so a manual table of contents must use the EN ids (check the built HTML).
4. Run `npm test`. `test/i18n.test.js` fails if `translation_key` is missing/duplicated, doesn't match a PT post that declares the same key, or `translated_by` isn't `ai-reviewed` or `original`.

Posts that were **already written in English** (`design-Patterns-The-solution-path`, `how-does-the-browser-know-my-location`, `need-vs-solution`) are copied verbatim to `source/en/_posts/` with `translated_by: original`: same body, no "translated with AI" notice, and the language switch/`hreflang` pair works as for the others.

The `pt-en-translator` agent (`.claude/agents/pt-en-translator.md`, with `.claude/translation/style-guide.md` and `glossary.md`) does the localization (idiomatic American English, not literal).
### Current scope and known gaps

- Translated: every post in `source/_posts/` has an EN version under `/en/` (translated by AI, or copied as-is when already in English).
- Static pages `about`, `tools`, `marketplace` and `outoftheboxpayloads` also have EN versions in `source/en/<page>/index.md` (plain Hexo pages; `i18n_dir` gives them `lang = 'en'`). Same front matter keys as the PT page plus `translated_by: ai-reviewed` (no `translation_key`). `scripts/i18n.js` pairs `en/<x>/` with `<x>/` automatically when both exist (language switch + `hreflang`). `tools` and `marketplace` are parsed by their theme partials, so keep the structure/enums identical to PT; their fixed UI strings are switched by `page.lang` inside the partials, and the AI notice comes from `_partial/translation-notice.ejs`. The dictionary is a post (`/en/2020/12/04/information-security-dictionary/`).
- The EN menu comes from `menu_en` (About, Dictionary, Links & Tools, Marketplace, Out of the Box Payloads, Tags + social icons).
- Not done yet: EN RSS feed (`/en/rss2.xml`; `hexo-generator-feed` is single-language and the existing feed autodiscovery link points to the PT feed), EN archives page, remembering the reader's language choice (deliberately no automatic redirect by `Accept-Language`, it confuses crawlers and shared links).
- EN posts support `tags` only (no categories) and are not part of Hexo's `site.posts`, so Hexo helpers/plugins that read `site.posts` (e.g. a future sitemap plugin) will not include them unless adapted.

## Deployment

Netlify watches the master branch and automatically builds and deploys on push. No GitHub Actions or manual CI configuration needed.
