'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');

const PORT = 47331;
const BASE_URL = `http://localhost:${PORT}`;
const ROOT_DIR = path.join(__dirname, '..');
// Invoca o script real do Hexo com o proprio node, em vez do shim .bin/hexo(.cmd),
// para nao depender de "shell: true" no Windows (mais lento e gera aviso DEP0190).
const HEXO_BIN = path.join(ROOT_DIR, 'node_modules', 'hexo', 'bin', 'hexo');

let serverProcess;

async function fetchComTimeout(url, timeoutMs) {
  return fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let ultimoErro;

  while (Date.now() < deadline) {
    try {
      const res = await fetchComTimeout(url, 2000);
      if (res.ok) return;
    } catch (erro) {
      ultimoErro = erro;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`hexo server nao respondeu em ${timeoutMs}ms (${url}): ${ultimoErro}`);
}

before(async () => {
  serverProcess = spawn(process.execPath, [HEXO_BIN, 'server', '--port', String(PORT)], {
    cwd: ROOT_DIR,
    stdio: 'pipe',
  });

  await waitForServer(`${BASE_URL}/`, 20000);
});

after(() => {
  if (serverProcess) serverProcess.kill();
});

const ROTAS_CHAVE = ['/', '/archives/', '/tags/', '/rss2.xml', '/about/', '/2020/12/04/dicionario-seguranca/'];

for (const rota of ROTAS_CHAVE) {
  test(`hexo server responde 200 em "${rota}"`, async () => {
    const res = await fetchComTimeout(`${BASE_URL}${rota}`, 5000);
    assert.equal(res.status, 200, `esperado status 200 em "${rota}", recebido ${res.status}`);
  });
}
