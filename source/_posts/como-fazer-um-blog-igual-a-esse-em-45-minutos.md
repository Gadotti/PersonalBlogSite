---
title: Como fazer um blog igual a esse em 45 minutos?
date: 2020-07-14 18:10:17
tags: ["tools"]
cover: /imgs/hexo/banner.jpg
---
# Como fazer um blog igual a esse em 45 minutos?

Por um tempo já eu estava me perguntando qual era a melhor maneira de postar artigos e tornar visível meus projetos. Github? Linkedin? Medium? Cada um tem seu propósito e parece que faltava um caminho de origem para tudo isso. 

A ideia de fazer um site próprio não era exatamente nova, mas me desanima a ideia de ter que desenvolver todo um layout HTML, CSS e Js do zero, sem mencionar o tempo em manutenção que teria que investir.

Levei essa conversa para um amigo, que me indicou ótimas ferramentas que resolveriam exatamente a minha dor (valeu [Cleyson](https://cgreinhold.dev/)!). A ideia é utilizar o combo <https://hexo.io/> + <https://www.netlify.com/>. 

Com essas duas ferramentas montei, editei, personalizei e publiquei e blog em 45 minutos.

## O que é o **hexo**?

[**Hexo**](https://hexo.io) é um framework de blog baseado em *NodeJs* completo, simples e rápido. Também é possível ativar diversos plugins, temas e APIs. Possui uma documentação completa e direta (<https://hexo.io/docs/>) e diversos temas para escolher e usar (<https://hexo.io/themes/>)

## O que é o **Netlify**?

[**Netlify**](https://www.netlify.com/) é, entre muitas coisas, uma ferramenta para publicar e integrar *continuous deployment* com o repositório. Através desse serviço é possível também adquirir um domínio, ou é possível ficar no *free* vinculado ao domínio do *netlifly*.

## # Get Started

1. [Hexo](#1-Hexo)
2. [Repositório](#2-Repositorio)
3. [Netlify](#3-Netifly)

### 1. Hexo
1. Instale o NodeJS
2. Instale Git (opcional)
3. Execute o comando > **npm install -g hexo-cli**
4. Cmd > *D:\MinhaPastas\MeuBlogSite*
5. Cmd > hexo init *D:\MinhaPastas\MeuBlogSite*
6. Cmd > **npm install**

Neste momento já será possível observar a estrutura base e funcional do blog criado na pasta escolhida. 

Agora é necessário escolher e atribuir um tema. Na área de temas (https://hexo.io/themes/), escolha um e anote o link do repositório *github*.

Seguindo o exemplo com o tema **Geek**

1. Crie uma pasta para o tema dentro da pasta **theme** dos arquivos existente 
2. Exemplo: *D:\Sistemas\PersonalBlogSite\themes\geek*
3. Copie o tema > Cmd > "*D:\Sistemas\PersonalBlogSite\themes\geek*" > *git clone https://github.com/sanjinhub/hexo-theme-geek.git geek*.
4. Altere a propriedade '**theme**' do arquivo '**_config.yml**' para '**geek**'
5. Execute para Testar > **hexo server**
6. Executa para criar novos posts > **hexo new "Este é um novo artigo"**

Os temas possuem diversas configurações possíveis e personalizações. Explore as opções para melhor adaptação.

![Hexo](/imgs/hexo/hexo_code.PNG)

### 2. Repositório

Defina um repositório de sua escolha e publique o arquivos do blog. Escolhi o [GitHub](https://github.com/) e optei por deixá-lo publico, caso queiram verificar qualquer propriedade ou configuração que realizei.

* <https://github.com/Gadotti/PersonalBlogSite>

### 3. Netifly

Aqui é onde o site será feito o *deploy* e publicado. O serviço de integração possui um plano básico *free* que cobre a nossa necessidade aqui apresentada.

O serviço possui um passo a passo auto-explicativo bem didático. Basta dar as permissões necessárias ao seu repositório, e as principais configurações serão realizada automaticamente.

O serviço será configurado com *continuous deployment*, isso significa que sempre que o *push* for realizado em seu repositório, um novo *deploy* será executado automaticamente, sem que você precise realizar qualquer outra ação para ver o seu novo artigo publicado.

![Netfily](/imgs/hexo/netlifly_dashboard.PNG)

## Conclusão

É uma ótima opção para agilizar o desenvolvimento de seu próprio site, sem ficar *refém* de serviços como *wordpress* ou *medium*, onde o nível de personalização possui limites.

Também adoro a possibilidade de trocar de temas quando quiser, que pode ser realizada com a mesma facilidade.

Apesar de facilidade e abstração fornecida, todo o código fica disponível para que qualquer alteração desejada seja possível de ser realizada ou seja, ainda é 100% personalizável.