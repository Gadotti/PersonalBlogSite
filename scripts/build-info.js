/* global hexo */
'use strict';

// COMMIT_REF é definido pelo Netlify a cada build. Fora do Netlify (hexo server)
// a variável não existe e o rodapé simplesmente não exibe a informação.
function shortCommit() {
  const ref = process.env.COMMIT_REF || '';
  return /^[0-9a-f]{7,40}$/i.test(ref) ? ref.substring(0, 7) : null;
}

hexo.extend.helper.register('build_info', function () {
  const sha = shortCommit();
  return sha ? 'build ' + sha : '';
});
