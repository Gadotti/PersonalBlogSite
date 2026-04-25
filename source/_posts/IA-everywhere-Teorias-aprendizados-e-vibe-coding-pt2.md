---
title: "IA everywhere: Teorias, aprendizados e vibe-coding - Pt.2"
date: 2026-04-25 18:04:11
tags: ["ia"]
---

## Introdução

A [primeira parte deste post](/2026/04/05/IA-everywhere-Teorias-aprendizados-e-vibe-coding/) levou algumas semanas para acumular material suficiente para ser escrita. Esta segunda parte levou apenas vinte dias.

Isso já diz muito por si só. O ritmo com que os conceitos, ferramentas e práticas estão evoluindo exige que qualquer análise seja tratada como provisória. O que era novidade semana passada pode ser obsoleto hoje. 

Nessas três semanas, aprofundei o estudo e continuem testando na prática o funcionamento das IAs no contexto de codificação, como  consumo de tokens, o que entra no contexto, onde os modelos falham silenciosamente e preocuções relacionadas a segurança neste contexto. 

---

## 1. O que mudou em vinte dias

Nos vinte dias após a publicação do post anterior, algumas coisas aconteceram:

- **Lançamento do Claude Opus 4.7** com maior capacidade de raciocínio — e também maior consumo de tokens por execução.
- **Lançamento do [Claude Design](https://claude.ai/design)** — novo produto da Anthropic focado em criação de interfaces.
- **Percepção prática de que o plano Pro não é suficiente para desenvolvimento diário pesado.** Quem usa Claude Code de forma intensiva começa a bater nos limites de uso com frequência. O plano Max passa a ser necessidade real.

O terceiro ponto tem impacto direto na viabilidade econômica do fluxo de trabalho, entender por que esses limites são atingidos tão rapidamente exige entender como o **consumo de tokens realmente funciona**.

---

## 2. Entendendo a stack: as camadas da IA

Algo que entendi ser interessante e valioso foi montar uma visão mais clara sobre as camadas que compõem o funcionamento de uma ferramenta como o Claude Code. Desta forma, com um mapa mais claro que eu consiga visualizar, passei a entender melhor por que determinadas práticas funcionam, por que os custos sobem e por que a qualidade das respostas degrada em contextos longos.

As camadas que identifiquei:

| Camada | O que é |
|---|---|
| **LLM** | O modelo de linguagem em si (ex: Claude Sonnet, Opus) |
| **Harness** | A camada que orquestra a interação com o modelo — prompts, tools, agentes. Claude Code, por exemplo |
| **Deep Thinking** | Modo em que o modelo raciocina em múltiplos ciclos internos antes de responder |
| **KV Cache** | Cache de pesos intermediários que acelera execuções repetidas. KV Cache = Key Value Cache   |
| **Prompt Cache** | Persistência do KV Cache entre requisições — economiza tokens de forma efetiva |
| **Tool Calling** | Capacidade do modelo de invocar ferramentas externas (leitura de arquivo, shell, busca) |
| **Skills e Agents** | Contextos especializados e sub-agentes com escopos próprios |
| **Context Window** | O limite total de tokens que o modelo pode processar em uma interação |
| **Context Rot** | Degradação da qualidade das respostas à medida que o contexto cresce |

Compreender essa stack fez e está fazendo com que eu me quesitone e mude como uso a ferramenta, a depender do contexto. Por exemplo, qual modelo, quantos agentes, o tamanho do CLAUDE.md, a frequência de reinício da conversa, tudo isso tem impacto direto em custos e qualidade.

---

## 3. Context Window, tokens e o problema do Context Rot

O contexto de uma conversa com as IAs não é apenas o que é digitado. O que compõe o **Context Window** em uma sessão:

- O prompt atual
- O histórico completo da conversa
- Documentos e arquivos anexados
- Instruções de projeto (arquivos de instrução, arquivos de configuração, guardrails)
- Saída de tools (leitura de arquivo, execução de comandos, resultados de busca)
- Logs de erro e outputs de testes
- A própria resposta sendo gerada

Tudo isso é considerado para o limite de token. Em abril de 2026, o limite está na faixa de **1 milhão de tokens** para os planos pagos. O cálculo aproximado é o seguinte: 1 token ≈ 0,75 palavras em inglês, um pouco menos em português. Para que ter uma noção de escala, segue uma tabela ilustrativa de alguns cenários:

| Tokens | -Equivale aproximadamente a |
|---|---|
| 1k | ~750 palavras |
| 10k | Um conto longo |
| 100k | Um romance inteiro |
| 200k | ~150k palavras / vários livros |
| 1M | Repositórios de código inteiros |

O problema mais sutil não é atingir o limite. É o que acontece antes disso: o **Context Rot**.

À medida que o volume de tokens cresce, a precisão e a capacidade de recuperação de informação degradam. O modelo começa a "esquecer" detalhes de trechos anteriores da conversa, segue instruções com menos fidelidade e produz respostas de qualidade inferior, e pior: tudo isso de forma **silenciosa** e sem avisar.

O Akita capturou isso de forma direta no post *[Clean Code para Agentes de IA](https://akitaonrails.com/2026/04/20/clean-code-para-agentes-de-ia/)*:

> "Quanto mais coisa você enfia na janela, pior a precisão de detalhe. E o contexto do agente não tem só o seu código: tem CLAUDE.md, tem prompt do sistema, tem histórico de conversa, tem saída de tool, tem log de erro, tem output de teste. Tudo concorrendo pela mesma janela."

Uma estratégia a ser testada ainda em prática é reiniciar a conversa mais cedo do que parece necessário. Quando o contexto fica longo, o custo de mantê-lo passa a superar o benefício da continuidade.

---

## 4. Pensamento Estendido (Deep Thinking)

Um recurso que merece ser entendido: o **Pensamento Estendido**, também chamado de *Extended Thinking* ou *Deep Thinking*.

É o modo em que o modelo retroalimenta o próprio prompt com camadas de verificação e reprompts internos antes de gerar a resposta final. O fluxo funciona assim:

1. O modelo gera perguntas para si mesmo sobre o problema
2. Responde a essas perguntas internamente
3. Revisa os próprios resultados em múltiplos ciclos
4. Cada ciclo é uma "camada" de raciocínio
5. Mais camadas resultam em maior profundidade de análise antes da resposta final

O resultado tende a ser mais preciso em problemas complexos: raciocínio lógico, análise de múltiplos fatores, decisões com trade-offs não óbvios. O custo: cada camada consome tokens adicionais, e o pensamento estendido gasta significativamente mais do que uma resposta direta.

Em dias em que o limite não é uma ameaça iminente para minhas atividades, tenho mantido o recurso ativo já que melhora de forma **significativa** os resultados. Porém pode ser um recursos a ser ajustado em casos de necessidade futura para atividades menos complexas.

---

## 5. KV Cache e Prompt Cache: o que são e por que importam

Duas otimizações que diferenciam uma ferramenta bem implementada de uma que apenas chama a API do modelo:

**KV Cache** (Key-Value Cache) armazena os pesos intermediários calculados durante o processamento do prompt. Partes do contexto que não mudaram não precisam ser reprocessadas do zero a cada resposta. O efeito prático é execução mais rápida.

**Prompt Cache** vai um passo além: persiste o KV Cache entre requisições separadas. Quando você reinicia uma conversa mas mantém o mesmo contexto de sistema (CLAUDE.md, instruções de projeto, configurações) o Prompt Cache evita reprocessar tudo novamente. O resultado é economia de tokens e redução de latência.

Uma boa ferramenta de IA oferece os dois. Na hora de avaliar alternativas ao Claude Code ou de integrar a API diretamente em pipelines internos, passei a verificar se esses recursos estão disponíveis é critério de qualidade.

---

## 6. O problema de repositórios grandes

O Claude Code não carrega o repositório inteiro no contexto. Ele usa **tool calling** para ler arquivos dinamicamente — o modelo decide quais arquivos consultar conforme o problema exige. É uma abordagem muito mais eficiente do que tentar "memorizar" o código completo de antemão.

Mas isso não elimina o problema, apenas o desloca.

O Claude Code lê por padrão **2.000 linhas por vez** atualmente. Arquivos maiores são truncados. Em repositórios com arquivos extensos, trechos inteiros podem ser ignorados sem que o modelo sinalize isso. O resultado pode variar a cada execução para o mesmo problema, não por aleatoriedade do modelo, mas pela diferença no que foi efetivamente lido. Esta é uma informação que obtive novamente do Akita no post *[Clean Code para Agentes de IA](https://akitaonrails.com/2026/04/20/clean-code-para-agentes-de-ia/)*.

A situação piora com o Context Rot: quanto mais arquivos são lidos ao longo de uma sessão, mais o contexto cresce, e mais a qualidade das análises degrada.

Para casos onde o repositório é genuinamente grande demais, uma alternativa é indexá-lo em um banco vetorial e buscar apenas os trechos relevantes antes de enviar ao modelo. Existem ferramentas que podem fazer isso nativamente.

Uma questão relacionada e mais sutil: quando usar RAG e quando não usar? A resposta não é trivial — a evolução dos contextos longos mudou parte do cálculo. O Akita tem um post específico sobre isso que vale a leitura: *[RAG está morto? Contexto longo](https://akitaonrails.com/2026/04/06/rag-esta-morto-contexto-longo)*.

---

## 7. Segurança: novos vetores, velhos problemas

A primeira parte deste post já mencionava que a IA raramente sugere proteções de segurança que você não pediu explicitamente. Neste período, o tema ganhou novas dimensões.

### Ambiente de execução controlado

O primeiro ponto prático: **o agente precisa de um ambiente controlado para operar**. O Claude Code executa comandos de shell, lê e escreve arquivos, instala pacotes. Sem restrições, ele tem o mesmo poder de um desenvolvedor descuidado com acesso administrativo.

Algumas práticas que passei a considerar e estudando como *framework* ainda a ser validado:

- **AI Jail com wrapper** — rodar o Claude Code dentro de um container isolado, com permissões explicitamente limitadas. O repositório [ai-jail](https://github.com/akitaonrails/ai-jail) documenta uma abordagem prática para isso.
- **Bootstrap de settings com padrões definidos** — configurar explicitamente quais comandos podem ser executados automaticamente, quais precisam de aprovação humana e quais são bloqueados. O Claude Code permite essa configuração via `settings.json`.
- **Remover privilégios administrativos** dos usuários nominais nas máquinas de desenvolvimento, viabilizando um endpoint centralizado de gerenciamento. Parece óbvio, mas é sistematicamente ignorado no dia a dia.

Um caso concreto que surgiu na prática: **o Claude Code começou a disparar comandos PowerShell encodados que foram sinalizados como maliciosos pelo EDR**. Não era um ataque, era o modelo tentando executar operações legítimas de uma forma que as heurísticas do antivírus classificaram como comportamento suspeito. O ponto é: sem um ambiente controlado e visibilidade do que está sendo executado, você não tem como distinguir um falso positivo de um problema real.

### Context Poisoning: um vetor de ataque novo

Um vetor ainda pouco discutido, mas com implicações sérias: **context poisoning** — envenenamento de contexto.

O mecanismo funciona assim: conteúdo que parece uma instrução, presente em um arquivo que o modelo lê (como um `CLAUDE.md` de um repositório clonado), pode ser preservado pelo mecanismo de compactação de contexto como se fosse "feedback do usuário". O modelo seguinte na sessão segue essa instrução como se fosse genuína, sem questionar a origem.

Não é um simples **Prompt Injection**.

Na prática, isso significa que **clonar um repositório comprometido e executar o Claude Code dentro dele pode ser suficiente para injetar instruções maliciosas** na sessão do agente. A superfície de ataque se estende para Supply Chain: uma dependência comprometida em `package.json`, por exemplo, poderia conter instruções que o modelo seguiria ao analisar o projeto — exfiltrar dados, modificar configurações ou executar código arbitrário.

Esse vetor ainda está sendo mapeado pela comunidade, mas já é suficiente para adotar uma regra simples: **não executar o Claude Code em repositórios de terceiros sem uma análise prévia dos arquivos de instrução**. Especialmente em contextos onde o agente tem permissões amplas.

---

## 8. Custos, temperature e o parâmetro effort

Quase tudo influencia o consumo de tokens: o tamanho do prompt e do histórico, o número de arquivos lidos via tool calling, o uso de Pensamento Estendido, o tamanho dos documentos de instrução, o modelo escolhido e os parâmetros de configuração da sessão. Entender o que cada um desses fatores representa é o que permite gerenciar o consumo de forma intencional.

Dois parâmetros específicos merecem atenção:

**Temperature** controla a aleatoriedade das respostas em integrações via API e é chamado também do *parâmetro da criatividade*. A escala vai de 0.0 a 1.0:
- **0.0 a 0.4** — respostas determinísticas, analíticas e consistentes. Ideal para análise técnica, geração de código e tarefas com resposta correta definida.
- **0.7 a 1.0** — respostas mais variadas e criativas. Útil para geração de texto, brainstorming e tarefas abertas.
- O **padrão da API é 1.0** — que é alto para a maioria dos casos de uso técnico.

Na prática, tive problemas de inconsistência em análises técnicas antes de ajustar esse parâmetro. Para tarefas repetíveis onde você espera consistência de resultado, reduzir a temperature para a faixa de 0.2 a 0.3 faz diferença real. No meu caso, no desenvolvimento do projeto https://github.com/Gadotti/check-cve-assets acabei reduzindo para 0. 

**Effort** é um parâmetro do Claude Code que controla o quanto o modelo investe em cada tarefa. O padrão é alto — o modelo usa o máximo de recursos disponíveis. Para tarefas simples ou iterações rápidas onde o objetivo é velocidade, reduzir o effort diminui o consumo de tokens sem impacto significativo na qualidade.

Vale mencionar também: **a estratégia de Spec Driven Development documentada na parte 1 foi validada na prática nesse período**, em um desenvolvimento de funcionalidade maior, como no caso da implementação de controle de autenticação no projeto https://github.com/Gadotti/MonitoringPanel. Escrever a especificação primeiro, antes de qualquer linha de código, resultou em menos retrabalho, menos context rot por iterações desnecessárias e melhor aproveitamento dos tokens investidos. O custo é o tempo de pensar antes de agir, que acaba sendo menor do que o custo de corrigir depois.

---

## 9. Cuidado com o lock-in de ferramenta

Um ponto que merece menção antes de encerrar: **o risco de lock-in**. Com toda a configuração que se acumula, seja CLAUDE.md, skills, agents, commands ou workflows ajustados para o Claude Code especificamente, a barreira para trocar de ferramenta cresce com o tempo.

Isso não é necessariamente um problema, mas é algo para gerenciar conscientemente. Algumas práticas que ajudam:

- Manter as especificações de projeto (specs, arquitetura, regras de negócio) em formatos agnósticos de ferramenta — Markdown simples, em vez de formatos proprietários.
- Avaliar periodicamente se a ferramenta atual ainda é a melhor opção, dado que o mercado muda rapidamente.
- Construir pipelines que sejam fáceis de redirecionar para outro modelo ou provider, especialmente em integrações via API.

A velocidade com que novos modelos e ferramentas surgem torna o lock-in um risco mais real do que parece no início do projeto.

---

## 10. A quebra de paradigma

Duas mudanças fundamentais que estou observando no contexto de programação com IA, e que ainda estão se desdobrando:

**O agente como piloto, o humano como co-piloto.** A narrativa inicial era de que a IA seria um assistente, o co-piloto que ajuda o desenvolvedor. O que observo na prática é o movimento inverso: o agente é que manuseia o projeto, executa, itera, executa os testes e faz o build. O humano revisa, corrige o rumo e define os critérios e requisitos. A trajetória aponta nessa direção e é forma que estou implementando meus projetos pessoais. A questão que isso levanta — *[VS Code é o novo cartão perfurado?](https://akitaonrails.com/2026/04/11/vs-code-e-o-novo-cartao-perfurado/)* — não é mais apenas provocativa.

**Escrever código para agentes lerem, não apenas para humanos.** Os princípios de Clean Code, TDD e SOLID sempre existiram para tornar o código mais legível e manutenível para pessoas. Agora eles têm uma dimensão nova: código mal estruturado, com arquivos enormes e responsabilidades mal definidas, **custa mais tokens** para o agente processar — e pode ser processado incorretamente por truncamento. Arquivos de 5.000 linhas não são só difíceis para o próximo desenvolvedor, são também difíceis para o agente que vai analisar e modificar esse código.

Isso não é razão para abandonar esses princípios, mas é a razão para levá-los ainda mais a sério. Funções pequenas, arquivos coesos, responsabilidades bem definidas e principalmente: **testes unitários**. O que sempre foi boa prática agora também tem impacto financeiro direto e mais rapidamente perceptível.

---

## Conclusão

Está acontecendo tudo muito rápido e tudo isso é empolgante, desconfortável, amedrontador, sufocante e fascinante ao mesmo tempo.

Acredito que não é necessário para todos e uma pequena parcela das pessoas irão procurar entender como a ferramenta funciona internamente, mas saber o que entra no contexto, como o modelo degrada em sessões longas, onde os limites de leitura estão e quais são os vetores de ataque emergentes é conhecimento importante para quem está buscando gerar valor, apoiar e orientar o uso efetivo dessa nova stack.

Há muito ruído sobre o assunto, caçadores de cliques e vendadores de curso não irão faltar, portanto construir uma base sólida de entendimento e aprender a filtrar o que realmente importa é de extrema relevância dado a condição que nosso tempo é limitado.

---

## Referências

### Vídeos
- [FABIO AKITA - Flow 588](https://www.youtube.com/live/4c7pbOxYn_A?si=MzSymFdQh9ajk8sT)
- [mano deyvin - O VSCode morreu](https://youtu.be/J82ceZ0IUiQ?si=OfQfVVFAyiZ1kir2)

### Fabio Akita
- [Clean Code para Agentes de IA](https://akitaonrails.com/2026/04/20/clean-code-para-agentes-de-ia/)
- [VS Code é o novo cartão perfurado?](https://akitaonrails.com/2026/04/11/vs-code-e-o-novo-cartao-perfurado/)
- [RAG está morto? Contexto longo](https://akitaonrails.com/2026/04/06/rag-esta-morto-contexto-longo)

### Repositórios
- [AI-Jail — rodar Claude Code em container com segurança](https://github.com/akitaonrails/ai-jail)
- [Painel42 - Solução de monitoramento de eventos de segurança](https://github.com/Gadotti/MonitoringPanel)
- [Check CVE Assets - Script python para verificação integrada à IA de CVEs](https://github.com/Gadotti/check-cve-assets)

### Ferramentas
- [Claude Design](https://claude.ai/design)
- [Cursor](https://cursor.so/)
- [Windsurf](https://codeium.com/windsurf)
