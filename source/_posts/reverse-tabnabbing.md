---
title: 'Já ouviu falar em Reverse Tabnabbing?'
date: 2020-10-02 18:08:53
cover: /imgs/reverse_tabnabbing/cover.jpg
tags: ["hacking", "security"]
---

## Já ouviu falar em Reverse Tabnabbing?

Talvez não seja uma vulnerabilidade muito comum, já que não é uma das listadas no [TOP 10 do OWASP](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_Top_10), mas isto não quer dizer que não mereça nossa atenção.

Trata-se de uma vulnerabilidade em que uma página aberta através de outra página é capaz de redirecionar essa aba de origem para outra página, possibilitando manipular e alterar a aba de origem através da aba secundária aberta. Como o usuário estava na nova aba que foi aberta, é provável que não note que na aba original a página foi alterada, especialmente se o site possuir a mesma aparência da original. Se o usuário utilizar nesta nova página maliciosa, seus dados confidenciais serão enviados para o site de phishing em vez de para o legítimo.

## Como funciona
Se ficou confuso, veja o fluxograma abaixo que ilustra a sequência.

![Fluxograma de uma exploração](/imgs/reverse_tabnabbing/reverso_tabnabbing_diagram.png)

Isto é possível quando o site de origem realiza a abertura de links, seja por tags *html* ou por *javascript*, sem as devidas propriedades informadas que mitigam este controle.

Veja este exemplo de exploração, onde o site malicioso redireciona o usuário para uma página de login *fake* do Gmail.

![Demonstração de uma exploração](/imgs/reverse_tabnabbing/reverse_tabnabbing_demo.gif)

Consegue imaginar as variações de phishing que podem ser aplicadas? Até os usuários mais atentos podem ser enganados com este tipo de redirecionamento, que pode facilmente passar despercebido.

## Códigos vulneráveis

Abaixo os principais métodos de como este comportamento pode ser explorado:

HTML:

```html
<a href="site-a-ser-aberto.com" target="_blank">Link para o site mal intencionado</a>
```

JS:

```js
window.open('https://site-a-ser-aberto.com');
```

O que o destino malicioso fará:

```js
if (window.opener) {    
  //Aqui ele redireciona a aba de origem para qualquer site que escolher
  window.opener.location = "https://fake-gmail.com"; 
}
```

## Isso não é comigo!

Será mesmo? Você pode pensar:
> "Não permito na minha aplicação que os usuário informe endereços url em nenhum lugar"

Tudo bem, mas e se sua aplicação possuir uma vulnerabilidade XSS, onde é possível manipular a informação? Ou se possui uma outra vulnerabilidade de SQL Injection onde é possível manipular a url que é carregada a partir de um banco de dados?

E você pode ainda pensar:
> "Garanto que meu sistema não terá nenhuma dessas vulnerabilidades de XSS ou SQL Injection"

OK, mas se a página que sua aplicação está abrindo possui uma vulnerabilidade de XSS e é possível executar códigos JS inseridos arbitrariamente? Você também garante a segurança da aplicação de um terceiro?

## Mitigação

Para os dois tipos de chamadas, basta adicionar as duas propriedades **'noopener,noreferrer'** que impedirão que o destino tenha controle sobre o opener location.

Exemplos:
HTML:
```html
<a href="site_malicioso.com" target="_blank" rel="noopener noreferrer">Link para site malicioso</a>
```

JS
```js
//Note que aqui é o terceiro parâmetro
window.open('https://site_malicioso.com', '', 'noopener,noreferrer');
```

## Conclusão

O que precisamos ter em mente é sempre o foco em reduzir a superfície de ataque, por mais que uma vulnerabilidade sozinha não cause muitos problemas, é a combinação entre elas que geralmente causam as maiores dores de cabeça.

Detalhes como este tornam sua aplicação muito mais segura e com diferencial competitivo no mercado.


## Referências

- <https://owasp.org/www-community/attacks/Reverse_Tabnabbing>
- <https://security.christmas/2019/12>