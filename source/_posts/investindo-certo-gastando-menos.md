---
title: "Segurança com eficiência: Investindo certo, gastando menos"
date: 2026-09-05 11:49:29
tags: ["TechLeadership", "DevSecOps"]
---

![Banner](/imgs/investindo-certo/banner.png)

*Um case próprio sobre processos, maturidade e escolhas conscientes*

Existe uma crença comum no mercado de segurança da informação que elevar a maturidade de proteção de uma empresa depende, antes de tudo, de orçamento. Ou seja, quanto mais ferramentas de ponta, mais seguro o ambiente. Neste relato trago um case real, desafio vivido na pele sobre possibilitar a construção um programa de segurança maduro e eficaz mesmo sem acesso às "super ferramentas" mais caras do mercado, desde que os processos internos estejam bem estruturados.

Para início de conversa antes de comprar ferramentas, é preciso arrumar a casa. Isto significa documentar processos, definir políticas, estruturar objetivos, montar uma equipe dedicada e oficializar procedimentos. Implementar segurança gastando menos não se trata de cortar investimentos a qualquer custo e não usar a falta de orçamento como muleta para falta de ações.

## Sumário
- [O cenário: complexidade real](#O-cenario-complexidade-real)
- [1. Prevenção: evitando o problema antes que ele exista](#1-Prevencao-evitando-o-problema-antes-que-ele-exista)
- [2. Monitoramento: visibilidade contínua](#2-Monitoramento-visibilidade-continua)
- [3. Automação: consistência e escala](#3-Automacao-consistencia-e-escala)
- [4. Investigação: o olhar crítico humano](#4-Investigacao-o-olhar-critico-humano)
- [5. Análise crítica: gestão de riscos orientada a dados](#5-Analise-critica-gestao-de-riscos-orientada-a-dados)
- [O comparativo de custos: o ponto central do case](#O-comparativo-de-custos-o-ponto-central-do-case)
- [Conclusões](#Conclusoes)

## O cenário: complexidade real

O contexto da implementação do programa de segurança deste case não é trivial. Ativos heterogêneos distribuídos entre cloud, on-premises, desktops e celulares, com integrações externas constantes. Centenas de sistemas internos e de terceiros sustentados pela equipe, em um modelo de trabalho remoto com acessos descentralizados envolvendo entre 100 a 200 colaboradores.

Diante de uma superfície de ataque tão ampla, a resposta não pode ser "proteger tudo com a mesma intensidade", é preciso saber priorizar. O foco para apresentação deste case escolhido foi o **ciclo de desenvolvimento e as aplicações sustentadas**, estruturando a estratégia em cinco frentes complementares: Prevenção, Monitoramento, Automação, Investigação e Análise Crítica.

## 1. Prevenção: evitando o problema antes que ele exista

A primeira linha de defesa é cultural e educativa. Isso inclui treinamentos de onboarding, materiais internos e documentação alinhada ao negócio, disponibilizados através de plaformas internas e base de conhecimento. No nível técnico, a extensão do SonarQube no ambiente de desenvolvimento apresenta validações obrigatórias já na fase de novos projetos. Todo trabalho é apoiado por frameworks reconhecidos como OWASP e ISO 27001, que dão consistência e credibilidade ao processo.

## 2. Monitoramento: visibilidade contínua

Esta é a frente com maior impacto de orçamento do case, combinando diversas ferramentas, muitas delas open-source, para garantir cobertura ampla:

- **SAST + SCA contínuos**: o SonarQube Community realiza análise estática de código, qualidade e security hotspots, enquanto o Dependency-Track cuida da análise de bibliotecas utilizadas (supply chain).
- **Análise de configurações web**: uso automatizado da ferramenta SSL Labs, da Qualys, para uma análise profunda das configurações web expostas.
- **OCS Inventory + CVE Reporting**: o OCS Inventory mapeia os programas instalados nas máquinas e na rede da empresa, enquanto uma API personalizada de consulta ao NIST cobre os pontos cegos, checando componentes, sistemas web ou ativos que o inventário automático não alcança.
- **Painel centralizador de eventos**: um dashboard próprio reúne os principais sinais gerados por todas essas fontes.
- **Desenvolvimento interno com IA**: análise de aplicações em Shadow IT para complementar combertura de CVEs publicados.

## 3. Automação: consistência e escala

Automatizar é o que permite que o processo escale sem crescer proporcionalmente o time. O Jenkins funcionou como o "maestro" da operação, disparando scripts, majoritariamente em Python, integrados aos pipelines de desenvolvimento para verificações e integrações contínuas. A regra é simples: qualquer tarefa repetida mais de uma vez é candidata a automação.

Do lado da comunicação, um hub de notificação próprio centraliza e distribui alertas via Telegram, Discord, webhooks e e-mail, garantindo que a informação certa chegue à pessoa certa no momento certo.

## 4. Investigação: o olhar crítico humano

Nenhuma ferramenta substitui a análise humana qualificada. Esta frente reserva tempo dedicado de pessoas para pesquisa e análise manual, avaliando cenários externos além da realidade imediata da empresa. O objetivo é ser proativo, antecipando ameaças em vez de apenas reagir a elas.

Acredito muito na frase: *"Ferramentas são meios. Os resultados vêm de pessoas capacitadas."*. São as pessoas que poderão questionar, monitorar e avaliar o processo: 
- o que é falso positivo? 
- O que é, de fato, um risco real? 
- A classificação automática da ferramenta faz sentido no contexto específico? 
- Existem pontos cegos?

## 5. Análise crítica: gestão de riscos orientada a dados

Parafraseando Peter Drucker, *"sem métricas a segurança é apenas uma suposição"*. Por isso, indicadores e alertas precisam comunicar algo relevante, apontando lacunas de treinamento, documentação ou processo, priorizando tratamentos e sinalizando reincidências. Os alertas complementam os indicadores, mas seguem uma regra rígida: mostrar apenas o que é, de fato, importante.

Toda a gestão de processo é sustentada por métricas e ferramentas próprias, incluindo um sistema interno de chamados, crucial para acompanhamento das atividades e definição de responsáveis.

A ISO 27001 aparece aqui não como burocracia, mas como metodologia estruturada, ajudando a definir papéis e responsabilidades claros, priorizar riscos relevantes e integrar a segurança ao negócio como algo que agrega valor, não como obstáculo. Como framework de referência, ela fortalece processos, facilita auditorias e aumenta a credibilidade de toda a operação. **Não é necessário absorver o custo de uma certificação oficial para seguir as boas práticas de um determinado framework.**

## O comparativo de custos: o ponto central do case

É aqui que a proposta ganha números concretos. Comparando as soluções próprias e open-source utilizadas com seus equivalentes comerciais no mercado (considerando um cenário de aproximadamente 60 desenvolvedores):

| Ferramenta usada | Equivalente de mercado | Valor/ano (mercado) |
|---|---|---|
| Jenkins (CI/CD) | GitHub Enterprise | R$ 80.000 |
| SonarQube (SAST) | GitHub Advanced Security | R$ 115.500 |
| Dependency-Track (SCA) | Snyk | R$ 77.000 |
| Sistema para registro de incidentes/riscos | PagerDuty Business | R$ 13.000 |
| Hub de notificações | Moogsoft | R$ 53.500 |
| ZAP/OWASP (DAST) | Acunetix (Invicti) | R$ 107.000 |
| OCS Inventory + CVE Reporting | Tenable.io / Tenable SC | R$ 192.000 |
| Scraping de ransomware | Darkfeed | R$ 50.700 |
| Elastic + Kibana | Datadog Enterprise e IBM Security QRadar SIEM | R$ 1.000.000

Somado, o mercado cobraria cerca de **R$ 1.700.000 por ano** pelas soluções equivalentes às construídas internamente, para sustentar centenas de eventos de segurança da informação por ano, com um time de poucos colaboradores dedicados e mais de 15 soluções customizadas.

## Conclusões

O case deixa claro que as soluções apresentadas não são necessariamente melhores do que as disponíveis no mercado, mas isso não significa que não seja possível construir um processo maduro sem elas. Ferramentas são importantes, mas processos e pessoas são essenciais. Arrisco a resumir a reflexão deste case com a frase: *para quem não tem nada, metade já é o dobro*.

Algumas reflexões finais guiam a continuidade do trabalho:

- Automatizar e monitorar continuamente.
- Não reinventar a roda, mas também não depender cegamente do mercado.
- Inventariar de forma contínua.
- Assumir o controle do processo, em vez de ser controlado por ele.

Julgo que ainda assim há pontos em que não vale a pena economizar: capacitação e pessoas qualificadas, contratação de pentests e auditorias regulares seguem como investimentos inegociáveis, independentemente do orçamento disponível para ferramentas.

No fim, o case demonstra que maturidade em segurança da informação não é sinônimo de gasto elevado, é sinônimo de processo bem desenhado, priorização inteligente e pessoas capacitadas para interpretar e extrair o melhor das ferramentas.