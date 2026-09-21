'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function readPublicFile(relativePath) {
  const filePath = path.join(PUBLIC_DIR, relativePath);
  assert.ok(
    fs.existsSync(filePath),
    `esperava que "${relativePath}" existisse em public/ apos "hexo generate" (rode "npm test" para gerar o build antes dos testes)`
  );
  return fs.readFileSync(filePath, 'utf8');
}

describe('paginas geradas pelo build (hexo generate)', () => {
  test('pagina inicial contem titulo e subtitulo do site', () => {
    const html = readPublicFile('index.html');
    assert.match(html, /Eduardo Gadotti/);
    assert.match(html, /Artigos, tecnologia e programa/);
  });

  test('pagina de arquivos (archives) e gerada', () => {
    readPublicFile('archives/index.html');
  });

  test('pagina de indice de tags e gerada', () => {
    readPublicFile('tags/index.html');
  });

  for (const pagina of ['about', 'tools', 'outoftheboxpayloads']) {
    test(`pagina especial "${pagina}" e gerada`, () => {
      readPublicFile(`${pagina}/index.html`);
    });
  }

  test('post fixo referenciado no menu do tema continua acessivel no permalink esperado', () => {
    readPublicFile('2020/12/04/dicionario-seguranca/index.html');
  });

  test('paginas de amostra nao vazam erros de template/renderer', () => {
    const amostras = ['index.html', 'archives/index.html', '2020/12/04/dicionario-seguranca/index.html'];
    for (const relativePath of amostras) {
      const html = readPublicFile(relativePath);
      assert.doesNotMatch(
        html,
        /\bundefined\b/,
        `"${relativePath}" contem a string "undefined" - possivel falha silenciosa de helper/renderer`
      );
      assert.doesNotMatch(html, /\[object Object\]/, `"${relativePath}" contem "[object Object]"`);
    }
  });
});

describe('feed RSS (hexo-generator-feed)', () => {
  test('rss2.xml existe e tem estrutura valida com itens', () => {
    const xml = readPublicFile('rss2.xml');
    const $ = cheerio.load(xml, { xmlMode: true });
    assert.equal($('rss').length, 1, 'elemento raiz <rss> nao encontrado no feed');
    assert.ok($('item').length > 0, 'feed RSS nao contem nenhum <item>');
  });

  test('links do feed apontam para paginas realmente geradas no build', () => {
    const xml = readPublicFile('rss2.xml');
    const $ = cheerio.load(xml, { xmlMode: true });
    const links = $('item > link')
      .slice(0, 5)
      .map((_, el) => $(el).text())
      .get();

    assert.ok(links.length > 0, 'nenhum link de item encontrado no feed para validar');

    for (const link of links) {
      const url = new URL(link);
      const relativeFile = path.join(url.pathname.replace(/^\//, ''), 'index.html');
      const filePath = path.join(PUBLIC_DIR, relativeFile);
      assert.ok(
        fs.existsSync(filePath),
        `link do RSS "${link}" nao corresponde a nenhum arquivo gerado (esperado em public/${relativeFile})`
      );
    }
  });
});
