'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

test('links e assets internos do HTML gerado nao estao quebrados', async () => {
  // linkinator so publica build ESM; em Node < 22 o require() sincrono desse
  // pacote falha com ERR_REQUIRE_ESM, entao ele precisa ser carregado via import().
  const { LinkChecker } = await import('linkinator');
  const checker = new LinkChecker();
  const result = await checker.check({
    path: PUBLIC_DIR,
    recurse: true,
    // Links externos (dominio proprio, redes sociais, etc.) sao pulados de proposito:
    // o objetivo aqui e pegar regressao de renderer/generator no HTML interno,
    // nao testar disponibilidade de sites de terceiros.
    linksToSkip: [/^https?:\/\//i, /^mailto:/i, /^tel:/i],
  });

  const quebrados = result.links.filter((link) => link.state === 'BROKEN');

  if (quebrados.length > 0) {
    const detalhes = quebrados
      .map((link) => `  - ${link.url} (status ${link.status}) referenciado em ${link.parent}`)
      .join('\n');
    assert.fail(`Foram encontrados links/assets internos quebrados apos o build:\n${detalhes}`);
  }
});
