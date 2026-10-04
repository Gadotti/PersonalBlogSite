/* global hexo */
'use strict';

// Versao em ingles do blog (PT e o idioma padrao e continua em source/_posts).
//
// O Hexo nao tem i18n de conteudo, so de interface: o theme_locals/i18n do core
// ja define page.lang = "en" (e troca o __()) para toda rota sob "en/" gracas ao
// "i18n_dir: :lang" do _config.yml. Este script cobre o que falta:
//   - le source/en/_posts/*.md (o Hexo ignora pastas "_*" fora de source/_posts),
//   - gera posts, home paginada e tags sob /en/ sem tocar no model Post, para que
//     os geradores PT (index, archive, tag, feed) continuem vendo so conteudo PT,
//   - registra os helpers usados pelo theme (botao de idioma, hreflang, textos).
// Detalhes de uso: secao "Internationalization" do CLAUDE.md.

const { parse: parseFrontMatter } = require('hexo-front-matter');
const { Permalink, slugize, full_url_for: fullUrlFor } = require('hexo-util');
const { basename, extname, join } = require('path');

const EN = 'en';
const PT = 'pt';
const EN_PREFIX = 'en/';

const LANGS = {
  [PT]: { code: 'PT', flag: 'br', title: 'Ler em português' },
  [EN]: { code: 'EN', flag: 'us', title: 'Read in English' }
};

// Conteudo bruto dos .md de source/en/_posts, alimentado pelo processor abaixo.
const rawFiles = new Map();

// Pares de rotas equivalentes entre idiomas ("2026/.../post/" <-> "en/2026/.../post/").
// Recalculado a cada geracao; consultado pelos helpers na hora de renderizar.
const state = { pairs: new Map() };

// "index.html" e barras sobrando saem; "" representa a home.
function normalizePath(path) {
  const clean = String(path || '').replace(/^\/+/, '').replace(/index\.html$/, '');
  return clean && !clean.endsWith('/') ? `${clean}/` : clean;
}

function toDate(value) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

// Processor: o Hexo so chama processors para arquivos que ele "enxerga", e e isso
// que faz o `hexo server` regenerar quando um .md de source/en/_posts muda. Tambem
// roda com type "skip" (arquivo inalterado no db.json), por isso le sempre.
hexo.extend.processor.register(`${EN_PREFIX}_posts/*path`, function (file) {
  if (file.type === 'delete') {
    rawFiles.delete(file.path);
    return;
  }
  // Mesma regra do Hexo para source/_posts: ignora ocultos/temporarios e nao-markdown.
  if (!/\.(md|markdown)$/i.test(file.path) || /(^|\/)[_.]/.test(file.params.path)) return;
  return file.read().then(raw => {
    rawFiles.set(file.path, raw);
  });
});

function buildPost(ctx, relPath, raw) {
  const { config } = ctx;
  const data = parseFrontMatter(raw);
  const body = data._content;
  delete data._content;

  const date = toDate(data.date);
  if (!data.title || !date) {
    throw new Error(`[i18n] ${relPath}: front matter precisa de "title" e "date" validos`);
  }
  if (data.published === false || (!config.future && date.getTime() > Date.now())) return null;

  const slug = slugize(basename(relPath, extname(relPath)), { transform: config.filename_case });
  const permalink = new Permalink(config.permalink);
  const month = String(date.getMonth() + 1);
  const day = String(date.getDate());
  const path = EN_PREFIX + permalink.stringify({
    year: String(date.getFullYear()),
    month: month.padStart(2, '0'),
    day: day.padStart(2, '0'),
    i_month: month,
    i_day: day,
    title: slug
  });

  const tagNames = [].concat(data.tags || data.tag || []).filter(Boolean).map(String);
  delete data.tag;

  return ctx.post.render(join(ctx.source_dir, relPath), { content: body, engine: 'md' }).then(rendered => ({
    ...data,
    lang: EN,
    slug,
    date,
    updated: toDate(data.updated) || date,
    content: rendered.content,
    path,
    permalink: fullUrlFor.call(ctx, path),
    layout: 'post',
    categories: [],
    tags: tagNames.map(name => ({
      name,
      slug: slugize(name, { transform: config.filename_case }),
      path: `${EN_PREFIX}${config.tag_dir}/${slugize(name, { transform: config.filename_case })}/`
    }))
  }));
}

// Mesmo contrato de lista do Warehouse que o theme usa (page.posts.each(...)).
function collection(items) {
  return Object.defineProperty(items, 'each', { value: Array.prototype.forEach });
}

// Paginacao no formato do hexo-pagination: pagina 1 em `base`, demais em `base`page/N/.
function paginate(ctx, base, posts, { layout, data }) {
  const perPage = ctx.config.per_page || posts.length || 1;
  const total = Math.max(Math.ceil(posts.length / perPage), 1);
  const pageUrl = n => (n === 1 ? base : `${base}${ctx.config.pagination_dir}/${n}/`);

  const routes = [];
  for (let current = 1; current <= total; current++) {
    routes.push({
      path: pageUrl(current),
      layout,
      data: {
        ...data,
        lang: EN,
        base,
        total,
        current,
        current_url: pageUrl(current),
        posts: collection(posts.slice((current - 1) * perPage, current * perPage)),
        prev: current > 1 ? current - 1 : 0,
        prev_link: current > 1 ? pageUrl(current - 1) : '',
        next: current < total ? current + 1 : 0,
        next_link: current < total ? pageUrl(current + 1) : ''
      }
    });
  }
  return routes;
}

function buildRoutes(ctx, locals, posts) {
  posts.sort((a, b) => b.date - a.date);

  const postsByKey = new Map();
  for (const post of posts) {
    const key = post.translation_key;
    if (!key) continue;
    if (postsByKey.has(key)) {
      throw new Error(`[i18n] translation_key "${key}" repetido em mais de um post EN`);
    }
    postsByKey.set(key, post);
  }

  const tags = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tags.has(tag.slug)) tags.set(tag.slug, { ...tag, posts: [] });
      tags.get(tag.slug).posts.push(post);
    }
  }
  const tagList = [...tags.values()].sort((a, b) => a.name.localeCompare(b.name));

  // Equivalencias exatas entre idiomas (o que nao esta aqui cai na home do outro idioma).
  const pairs = new Map();
  const pair = (pt, en) => {
    pairs.set(pt, en);
    pairs.set(en, pt);
  };
  pair('', EN_PREFIX);
  pair(`${ctx.config.tag_dir}/`, `${EN_PREFIX}${ctx.config.tag_dir}/`);

  const ptTagPaths = new Set();
  locals.tags.forEach(tag => ptTagPaths.add(normalizePath(tag.path)));
  for (const tag of tagList) {
    const ptPath = tag.path.substring(EN_PREFIX.length);
    if (ptTagPaths.has(ptPath)) pair(ptPath, tag.path);
  }

  const ptKeys = new Set();
  locals.posts.forEach(ptPost => {
    const key = ptPost.translation_key;
    if (key && postsByKey.has(key)) {
      ptKeys.add(key);
      pair(normalizePath(ptPost.path), postsByKey.get(key).path);
    }
  });
  for (const key of postsByKey.keys()) {
    if (!ptKeys.has(key)) {
      ctx.log.warn(`[i18n] translation_key "${key}" sem post PT correspondente em source/_posts`);
    }
  }

  // Paginas estaticas (about, tools...): "en/<x>/" pareia com "<x>/" quando ambas existem.
  const ptPagePaths = new Set();
  locals.pages.forEach(page => ptPagePaths.add(normalizePath(page.path)));
  locals.pages.forEach(page => {
    const enPath = normalizePath(page.path);
    if (!enPath.startsWith(EN_PREFIX)) return;
    const ptPath = enPath.substring(EN_PREFIX.length);
    if (ptPath && ptPagePaths.has(ptPath)) pair(ptPath, enPath);
  });
  state.pairs = pairs;

  return [
    ...posts.map(post => ({ path: post.path, data: post, layout: ['post'] })),
    ...paginate(ctx, EN_PREFIX, posts, { layout: ['index'], data: {} }),
    {
      path: `${EN_PREFIX}${ctx.config.tag_dir}/`,
      layout: ['page'],
      data: { title: 'Tags', type: 'tags', lang: EN, tag_list: tagList }
    },
    ...tagList.flatMap(tag =>
      paginate(ctx, tag.path, tag.posts, { layout: ['archive', 'index'], data: { tag: tag.name } })
    )
  ];
}

hexo.extend.generator.register('i18n-en', function (locals) {
  return Promise.all([...rawFiles.entries()].map(([relPath, raw]) => buildPost(this, relPath, raw))).then(posts =>
    buildRoutes(this, locals, posts.filter(Boolean))
  );
});

// Dado da pagina atual: idioma de destino do botao, URL equivalente (se existir) e
// os pares hreflang. Sem traducao exata, o botao leva para a home do outro idioma.
hexo.extend.helper.register('i18n_alternate', function () {
  const current = this.page.lang === EN ? EN : PT;
  const target = current === EN ? PT : EN;
  const here = normalizePath(this.path || this.page.path);
  const exact = state.pairs.has(here) ? state.pairs.get(here) : null;

  return {
    ...LANGS[target],
    lang: target,
    exact: exact !== null,
    path: exact !== null ? exact : target === EN ? EN_PREFIX : '',
    hreflangs:
      exact === null
        ? []
        : [
            { hreflang: current, path: here },
            { hreflang: target, path: exact },
            { hreflang: 'x-default', path: current === PT ? here : exact }
          ]
  };
});

// config[key] no idioma da pagina, com fallback para o valor padrao (PT).
hexo.extend.helper.register('site_text', function (key) {
  const localized = this.page.lang === EN ? this.config[`${key}_${EN}`] : undefined;
  return localized || this.config[key];
});

// Data no formato do idioma: EN usa o date_format do en.yml; PT segue config.date_format.
// (Nao da para perguntar ao __() em PT: ele cai no en.yml como fallback de qualquer chave.)
hexo.extend.helper.register('post_date', function (value) {
  return this.date(value, this.page.lang === EN ? this.__('date_format') : undefined);
});
