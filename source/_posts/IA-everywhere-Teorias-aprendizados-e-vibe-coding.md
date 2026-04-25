---
title: "IA everywhere: Teorias, aprendizados e vibe-coding"
date: 2026-04-05 14:37:14
tags: ["ia"]
---

## Introdução

Segurança da informação e desenvolvimento seguro sempre andaram juntos (ou deveriam). Com a ascensão das ferramentas de IA no dia a dia de quem desenvolve e de quem opera, essa relação ficou ainda mais crítica e, ao mesmo tempo, expondo problemas reais e já existentes potencializado pela produtividade neste novo universo.

Nas últimas semanas entrei em um hiperfoco para correr atrás e tentar entender como ferramentas como o Claude e o Claude Code se encaixam nesse contexto, ou seja não só como aceleradores de código, mas como peças de um ecossistema que precisa ser compreendido também pela lente da segurança. Juntei referências, assisti vídeos, li relatos técnicos, testei na prática e estou tentando costurar os pontos entre produtividade, boas práticas e riscos reais.

Esse post é o meu pontapé inicial. Um compilado de ideias, aprendizados e práticas que fui reunindo ao longo desse processo, com muita referência ao trabalho do [Fabio Akita](https://akitaonrails.com/), que tem documentado publicamente sua própria jornada com *vibe coding* de forma extremamente honesta e técnica. Não é um guia definitivo nem uma palavra final sobre o assunto, pois na verdade tudo o que permeia esse assunto muda rápido e há muito mais a explorar. É só um ponta-pé inicial.

---

## 1. O princípio de tudo: Garbage In, Garbage Out

Antes de qualquer ferramenta, qualquer modelo ou qualquer fluxo de trabalho, existe um fundamento que não tem como escapar: **o resultado é tão bom quanto o que você coloca**.

Prompt vago → resultado genérico. Prompt bem construído, com contexto, restrições e objetivo claro → resultado útil de verdade.

Uma estrutura que funcionou bem para mim:

> Simule uma persona → Defina a tarefa → Liste os passos → Contexto e restrições → Objetivo final → Formato de saída

Parece burocrático, mas na prática economiza várias idas e vindas.

---

## 2. A senioridade ainda importa (e muito)

Uma das coisas mais honestas que encontrei durante os estudos veio do Akita, em seu post *["Vibe Code: qual LLM é a melhor? Vamos falar a real"](https://akitaonrails.com/2026/01/29/vibe-code-qual-llm-é-a-melhor-vamos-falar-a-real/)*:

> *"A qualidade do app é diretamente proporcional à sua senioridade. Quanto mais júnior você for, pior vai ser seu app, com ou sem IA. IAs não são gênios com vontade própria. Elas não vão adivinhar o que você QUER e nem o que você REALMENTE PRECISA."*

A IA amplifica o que você já sabe. Ela não substitui o julgamento técnico, ela acelera quem já tem esse julgamento. Esse ponto vai ganhar ainda mais peso quando chegarmos na parte de segurança.

---

## 3. O que a IA faz bem (e o que faz mal)

Baseado também na experiência documentada pelo Akita no projeto [FrankSherlock](https://github.com/akitaonrails/FrankSherlock), um organizador de imagens construído com IA, ele traz algumas questões interessantes para ficar de olho. Acabei identificando muita relação e similaridades nestes pontos identificados entre diferentes criadores de conteúdo, senti eu mesmo algumas delas na prática:

**Pontos fortes:**
- Boilerplate, scaffolding, testes unitários — entrega rápido e consistente
- Refactoring mecânico (renomear, mover código, extrair métodos)
- Seguir padrões já estabelecidos no projeto
- Pesquisa contextual rápida

**Pontos de atenção:**
- Tende a over-engineer decisões de arquitetura — precisa de freio humano constante
- Não tem conhecimento de domínio específico do *seu* negócio
- **Raramente sugere proteções de segurança que você não pediu explicitamente** — esse ponto merece atenção especial e vamos voltar a ele
- Executa qualquer coisa com igual entusiasmo — não prioriza por você

---

## 4. Contexto tem limite e isso muda a estratégia

Uma coisa que aprendi na prática: **projeto inteiro não cabe no contexto.** É melhor trabalhar por partes, com foco. O próprio Akita documenta isso em seu relato *["37 dias de imersão em vibe coding"](https://akitaonrails.com/2026/03/05/37-dias-de-imersão-em-vibe-coding-conclusão-quanto-a-modelos-de-negócio/)*.

Além disso, tudo que está na conversa, histórico, configuração do projeto ou arquivos volta como input a cada prompt. Conversas longas consomem mais tokens e podem degradar a qualidade das respostas. Boas práticas que adotei:

- Reiniciar o chat quando ele fica muito extenso
- Usar o `CLAUDE.md` como documento vivo do projeto, mas mantê-lo enxuto (o do FrankSherlock tem 702 linhas cobrindo arquitetura, stack, variáveis de ambiente, padrões de design e checklist pós-implementação, vale estudar como referência)
- Deixar claro **o que não fazer** tanto quanto o que fazer, a ferramenta é muito "pró-ativa" e isso pode estourar seu consumo de tokens

---

## 5. Skills, Agents e Commands

Três recursos do Claude Code que fazem diferença real em projetos maiores:

**Skills** são instruções especializadas que você cria e instala nas capacidades da sua conta. Pense nelas como "manuais de operação" para contextos específicos: análise de compliance, revisão de segurança, padrões de código do seu projeto. A vantagem é tirar esse conhecimento do contexto da conversa e deixá-lo disponível sob demanda. Vale estudar como criá-las: [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills).

**Commands** são atalhos customizados criados dentro da pasta `.claude/commands` do projeto. Não são nativos, você os constrói. Exemplo prático de um workflow bem estruturado: `/spec` para escrever uma especificação, `/break` para quebrá-la em issues menores, `/plan` para pesquisar e planejar antes de implementar. O repositório [HumanLayer](https://github.com/humanlayer/humanlayer) tem exemplos concretos.

**Agents** são sub-agentes especializados que podem rodar em paralelo e em segundo plano. Dá para configurar um agente por camada da aplicação, frontend, backend ou segurança cada um com seu contexto próprio. Um exemplo real e bem documentado é o [Security Engineer Agent](https://github.com/edmund-io/edmunds-claude-code/blob/main/.claude/agents/security-engineer.md) do repositório edmunds-claude-code.

A boa prática aqui é a **progressive disclosure**: segregar as Skills por contexto e chamá-las explicitamente quando necessário, em vez de jogar tudo no contexto de uma vez.

---

## 6. SDD e o workflow para projetos complexos

Um dos maiores problemas de quem começa com IA em código é a sensação de que ela "não obedece", bagunça o código ou faz uma coisa e estraga outra. Isso tem causa: falta de especificação.

É aqui que entra o **Spec Driven Development (SDD)** — desenvolver a partir de especificações claras antes de escrever uma linha de código. Com IA, isso se torna ainda mais crítico do que no desenvolvimento tradicional.

Um workflow que resolve boa parte desses problemas na prática, que acabei extraíndo do vídeo [Vibe Coding não funciona (Novo Workflow no Claude Code)](https://www.youtube.com/watch?v=Ea5yaWGqoHQ) da *Deborah Folloni*:

1. Escrever uma spec clara da feature ou comportamento
2. Quebrar a spec em issues menores e bem definidas
3. Planejar e pesquisar antes de implementar cada issue
4. Usar agentes especializados por camada
5. Manter documentação viva com regras claras de arquitetura e design

O repositório [Get Shit Done](https://github.com/gsd-build/get-shit-done) documenta esse framework de forma bem prática.

---

## 7. O ponto crítico: Segurança

Lembrando que a IA raramente sugere proteções de segurança que você não pediu e isso é um risco real. O *vibe coding* produz código funcional, mas produz igualmente rápido vulnerabilidades que passam despercebidas.

O vídeo **[1 Hacker vs 4 Vibe Coders](https://www.youtube.com/watch?v=4DzMbBYXa7M)** ilustra isso de forma bastante direta: quatro times constroem aplicações com auxílio de IA enquanto um hacker tenta invadi-las. O resultado é muito interessante, a maioria dos projetos apresentou vulnerabilidades exploráveis. Mas o mais relevante: **um dos projetos foi construído com zero vulnerabilidades**. A diferença? Senioridade e critério na hora de usar a ferramenta. Mais uma vez, a IA amplifica quem já sabe o que está fazendo, inclusive na dimensão de segurança.

Isso reforça alguns pontos práticos:

- Usar agents especializados em segurança no seu workflow (como o exemplo citado acima do edmunds-claude-code)
- Automatizar revisões de segurança como análise de CVEs e review de PRs com foco em vulnerabilidades
- Pesquisar e considerar o recurso de **Code Review do Claude para PRs** (https://claude.com/blog/code-review) como camada adicional antes do merge.

Em resumo: a velocidade que a IA entrega precisa ser acompanhada de uma cultura de segurança mais madura, não menos. Quem usa IA para codar rápido e não revisa segurança está criando uma dívida técnica perigosa.

---

## Conclusão

A pergunta que venho me fazendo é: *quais tarefas no meu dia consomem tempo, seguem um padrão repetitivo e podem ser delegadas com segurança?* É a partir daí que o uso de IA deixa de ser experimento e vira estratégia.

Mas a condição permanece: entrar com clareza, senioridade e um olhar atento para segurança. A IA não vai resolver um problema que você não sabe descrever, não vai priorizar o que você não definiu e não vai proteger o que você não pediu para proteger.

O caminho é aprender a trabalhar *com* ela, não torcer para que ela trabalhe *por* você.

---
 
## Referências

### Meu próprio projeto Vibe-coding
- [Github MonitoringPanel](https://github.com/Gadotti/MonitoringPanel)
 
### Fabio Akita
- [Blog do Akita](https://akitaonrails.com/)
- [O Akita abriu as pernas pra IA](https://akitaonrails.com/2026/02/24/rant-o-akita-abriu-as-pernas-pra-ia/)
- [Do zero à pós-produção em 1 semana — bastidores do The M.Akita Chronicles](https://akitaonrails.com/2026/02/20/do-zero-a-pos-producao-em-1-semana-como-usar-ia-em-projetos-de-verdade-bastidores-do-the-m-akita-chronicles/)
- [37 dias de imersão em vibe coding — conclusão quanto a modelos de negócio](https://akitaonrails.com/2026/03/05/37-dias-de-imersão-em-vibe-coding-conclusão-quanto-a-modelos-de-negócio/)
- [Vibe Code: qual LLM é a melhor? Vamos falar a real](https://akitaonrails.com/2026/01/29/vibe-code-qual-llm-é-a-melhor-vamos-falar-a-real/)
- [Web scraping em 2026 — bastidores do The M.Akita Chronicles](https://akitaonrails.com/2026/02/18/web-scrapping-em-2026-bastidores-do-the-m-akita-chronicles/)
- [Reescrevi o OpenClaw em Rust — funcionou? FrankClaw](https://akitaonrails.com/2026/03/16/reescrevi-o-openclaw-em-rust-funcionou-frankclaw/)
- [The Makita Chronicles — série completa](https://akitaonrails.com/tags/themakitachronicles/)
 
### Repositórios
- [FrankSherlock — organizador de imagens com IA](https://github.com/akitaonrails/FrankSherlock)
- [CLAUDE.md do FrankSherlock](https://github.com/akitaonrails/FrankSherlock/blob/master/CLAUDE.md)
- [AI-Jail — rodar Claude Code em container com segurança](https://github.com/akitaonrails/ai-jail)
- [edmunds-claude-code — exemplo de setup com agents e skills](https://github.com/edmund-io/edmunds-claude-code)
- [Security Engineer Agent](https://github.com/edmund-io/edmunds-claude-code/blob/main/.claude/agents/security-engineer.md)
- [everything-claude-code — referência completa](https://github.com/affaan-m/everything-claude-code)
- [HumanLayer — exemplos de commands customizados](https://github.com/humanlayer/humanlayer)
- [Get Shit Done — framework SDD](https://github.com/gsd-build/get-shit-done)
 
### Vídeos
- [1 Hacker vs 4 Vibe Coders](https://www.youtube.com/watch?v=4DzMbBYXa7M)
- [Claude Code Workflow](https://www.youtube.com/watch?v=Ea5yaWGqoHQ)
- [Learning Claude Code — série completa](https://www.youtube.com/watch?v=Ffh9OeJ7yxw&list=PLXicWNJqtzwxzS-qotj5JNcMysp9AtI5J&index=2)
- [Como usar Skills no Claude](https://youtu.be/h_l8wCr7M2Q?si=Q9jITnJZYDhYwhfA)
 
### Documentação e Artigos
- [How to create custom Skills no Claude](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [RAG para projetos no Claude](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)
- [Usage limit best practices](https://support.claude.com/en/articles/9797557-usage-limit-best-practices)
- [Claude for Work — exemplos por departamento](https://www.anthropic.com/learn/claude-for-work)
- [Anthropic Learn](https://www.anthropic.com/learn)
- [Code Review do Claude para PRs](https://claude.com/blog/code-review)
- [Como fazer Code Review com Claude — guia prático](https://hamy.xyz/blog/2025-12_claude-code-review)
- [Spec Driven Development (SDD)](https://www.dio.me/articles/spec-driven-development-sdd-desenvolvendo-software-a-partir-de-especificacoes-claras-a92697e969ba)