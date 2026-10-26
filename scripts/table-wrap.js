/* global hexo */
'use strict';

// Embrulha as tabelas do Markdown em um container com rolagem horizontal, para
// tabelas largas nao estourarem a coluna no celular. Tabelas geradas pelo
// highlight (gutter/code) ficam de fora.
hexo.extend.filter.register('after_post_render', function (data) {
  data.content = data.content.replace(/<table>[\s\S]*?<\/table>/g, function (table) {
    if (/class="(gutter|code)"/.test(table)) return table;
    return '<div class="table-wrap">' + table + '</div>';
  });
  return data;
});
