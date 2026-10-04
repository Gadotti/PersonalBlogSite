'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const { parse: parseFrontMatter } = require('hexo-front-matter');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const EN_POSTS_DIR = path.join(ROOT, 'source', 'en', '_posts');
const PT_POSTS_DIR = path.join(ROOT, 'source', '_posts');

function load(relativePath) {
  const filePath = path.join(PUBLIC_DIR, relativePath);
  assert.ok(
    fs.existsSync(filePath),
    `esperava que "${relativePath}" existisse em public/ apos "hexo generate" (rode "npm test" para gerar o build antes dos testes)`
  );
  return cheerio.load(fs.readFileSync(filePath, 'utf8'));
}

function listHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHtml(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

function enPosts() {
  return fs
    .readdirSync(EN_POSTS_DIR)
    .filter(name => name.endsWith('.md'))
    .map(name => ({ name, data: parseFrontMatter(fs.readFileSync(path.join(EN_POSTS_DIR, name), 'utf8')) }));
}

// Post de referencia: o primeiro post EN que tem traducao PT (translation_key).
const PT_PATH = '2026/09/05/investindo-certo-gastando-menos/';
const EN_PATH = 'en/2026/09/05/investing-smartly-spending-less/';

describe('versao em ingles (source/en/_posts -> /en/)', () => {
  test('home EN usa lang=en, textos em ingles e lista o post traduzido', () => {
    const $ = load('en/index.html');
    assert.equal($('html').attr('lang'), 'en');
    assert.match($('.subheading').text(), /Articles, technology and programming/);
    assert.ok($(`a[href="/${EN_PATH}"]`).length > 0, 'home EN nao lista o post traduzido');
  });

  test('post EN tem lang=en, aviso de traducao com link para o original e data em ingles', () => {
    const $ = load(`${EN_PATH}index.html`);
    assert.equal($('html').attr('lang'), 'en');
    const notice = $('.alert-info').text();
    assert.match(notice, /Translated from Portuguese with AI assistance/);
    assert.ok($(`.alert-info a[href="/${PT_PATH}"]`).length > 0, 'aviso sem link para o post original em PT');
    assert.match($('.meta').text(), /September 5, 2026/);
  });

  test('indice de tags EN e paginas de tag EN sao geradas e linkadas pelo post', () => {
    load('en/tags/index.html');
    const $ = load(`${EN_PATH}index.html`);
    const tagLinks = $('.post-tags a')
      .map((_, el) => $(el).attr('href'))
      .get();
    assert.ok(tagLinks.length > 0 && tagLinks.every(href => href.startsWith('/en/tags/')), `tags do post EN: ${tagLinks}`);
    for (const href of tagLinks) load(`${href.replace(/^\//, '')}index.html`);
  });

  test('o diretorio source/en/_posts nao vaza como pagina publicada', () => {
    assert.equal(fs.existsSync(path.join(PUBLIC_DIR, 'en', '_posts')), false);
  });
});

describe('botao de idioma e hreflang', () => {
  test('post PT aponta para o post EN equivalente e declara hreflang pt/en/x-default', () => {
    const $ = load(`${PT_PATH}index.html`);
    assert.equal($('.lang-switch a').attr('href'), `/${EN_PATH}`);
    assert.equal($('.lang-switch a').attr('hreflang'), 'en');
    const alternates = Object.fromEntries(
      $('link[rel="alternate"][hreflang]')
        .map((_, el) => [[$(el).attr('hreflang'), $(el).attr('href')]])
        .get()
    );
    assert.match(alternates.en, new RegExp(`/${EN_PATH}$`));
    assert.match(alternates.pt, new RegExp(`/${PT_PATH}$`));
    assert.match(alternates['x-default'], new RegExp(`/${PT_PATH}$`));
  });

  test('post EN aponta de volta para o post PT equivalente', () => {
    const $ = load(`${EN_PATH}index.html`);
    assert.equal($('.lang-switch a').attr('href'), `/${PT_PATH}`);
    assert.equal($('.lang-switch a').attr('hreflang'), 'pt');
  });

  test('home PT <-> home EN', () => {
    assert.equal(load('index.html')('.lang-switch a').attr('href'), '/en/');
    assert.equal(load('en/index.html')('.lang-switch a').attr('href'), '/');
  });

  test('pagina PT sem traducao cai na home EN e nao declara hreflang', () => {
    const $ = load('archives/index.html');
    assert.equal($('.lang-switch a').attr('href'), '/en/');
    assert.equal($('link[rel="alternate"][hreflang]').length, 0);
  });

  test('paginas estaticas (about, tools, marketplace, outoftheboxpayloads) pareiam PT <-> EN com hreflang', () => {
    for (const slug of ['about', 'tools', 'marketplace', 'outoftheboxpayloads']) {
      const pt = load(`${slug}/index.html`);
      const en = load(`en/${slug}/index.html`);
      assert.equal(pt('.lang-switch a').attr('href'), `/en/${slug}/`, `${slug}: PT -> EN`);
      assert.equal(en('.lang-switch a').attr('href'), `/${slug}/`, `${slug}: EN -> PT`);
      assert.equal(en('html').attr('lang'), 'en');
      assert.ok(en('link[rel="alternate"][hreflang="pt"]').length === 1, `${slug}: hreflang pt`);
      assert.ok(en('.alert-info').length === 1, `${slug}: aviso de traducao`);
    }
  });

  test('em todas as paginas geradas o botao de idioma aponta para uma pagina que existe', () => {
    for (const file of listHtml(PUBLIC_DIR)) {
      const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
      const href = $('.lang-switch a').attr('href');
      if (href === undefined) continue; // paginas sem layout do tema (ex.: redirects)
      const target = path.join(PUBLIC_DIR, href.replace(/^\//, ''), href.endsWith('/') ? 'index.html' : '');
      assert.ok(fs.existsSync(target), `${path.relative(PUBLIC_DIR, file)}: botao de idioma aponta para "${href}", que nao existe`);
    }
  });
});

describe('o conteudo PT nao foi alterado pela versao EN', () => {
  test('home PT nao lista posts EN e mantem a data no formato DD-MM-YYYY', () => {
    const $ = load('index.html');
    assert.equal($('html').attr('lang'), 'pt');
    assert.equal($('a[href^="/en/"]').not('.lang-switch a').length, 0, 'home PT linka para conteudo EN');
    assert.match($('.post-meta').first().text(), /\d{2}-\d{2}-\d{4}/);
  });

  test('feed RSS (PT) nao contem itens da versao EN', () => {
    const xml = fs.readFileSync(path.join(PUBLIC_DIR, 'rss2.xml'), 'utf8');
    assert.doesNotMatch(xml, /\/en\//);
  });
});

describe('integridade dos posts EN (fonte)', () => {
  test('todo post EN tem title, date e translated_by valido', () => {
    for (const { name, data } of enPosts()) {
      assert.ok(data.title, `${name}: sem title`);
      assert.ok(data.date, `${name}: sem date`);
      assert.ok(['ai-reviewed', 'original'].includes(data.translated_by), `${name}: translated_by deve ser "ai-reviewed" ou "original"`);
    }
  });

  test('translation_key e unico entre os posts EN e aponta para um post PT que declara a mesma chave', () => {
    const keys = new Set();
    for (const { name, data } of enPosts()) {
      const key = data.translation_key;
      assert.ok(key, `${name}: sem translation_key`);
      assert.ok(!keys.has(key), `${name}: translation_key "${key}" repetido`);
      keys.add(key);

      const ptFile = path.join(PT_POSTS_DIR, `${key}.md`);
      assert.ok(fs.existsSync(ptFile), `${name}: nao existe source/_posts/${key}.md (translation_key = slug do post PT)`);
      assert.equal(parseFrontMatter(fs.readFileSync(ptFile, 'utf8')).translation_key, key, `${key}.md (PT) nao declara translation_key`);
    }
  });
});
