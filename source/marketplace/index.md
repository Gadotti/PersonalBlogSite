---
title: Marketplace
date: 2026-08-07 00:00:00
type: marketplace
subtitle: Produtos e serviços que ofereço
---

<!--
  COMO MANTER ESTA PÁGINA
  ------------------------------------------------------------------
  Cada "## Título" vira uma categoria (e um botão de filtro).
  Cada item começa com "- name:" seguido dos campos indentados abaixo.

  Campos disponíveis (todos opcionais, exceto name):

    name .......... Nome do produto/serviço
    kind .......... produto | servico   (define o selo colorido do card)
    badge ......... Texto livre de destaque (ex.: Mais procurado)
    featured ...... true  -> card ganha destaque visual
    icon .......... Ícone Font Awesome 4 sem o prefixo (ex.: shield, code, book) [https://fontawesome.com/v4/icons/]
    image ......... Caminho da imagem de capa (ex.: /imgs/marketplace/foo.jpg)
                    Se informado, substitui o ícone.
    price ......... Valor principal exibido (ex.: R$ 2.500 ou Sob consulta)
    price_note .... Complemento do valor (ex.: por projeto, /mês, à vista)
    description ... Descrição curta exibida no card
    features ...... Itens separados por " | " (viram lista com check)
    url ........... Link do botão de ação (http, mailto:, https://wa.me/...)
    cta ........... Texto do botão (padrão: "Tenho interesse")
    status ........ disponivel | sob-consulta | esgotado
    notes ......... Observação extra, exibida ao clicar em "Detalhes".
                    Para várias linhas use aspas e \n:  notes: "linha 1\nlinha 2"

  A ordem dos campos não importa. Linhas em branco entre itens são ignoradas.
  
-->

## Produtos Digitais
- name: Planilha LGPD: Organize seu ROPA sem Burocracia
  kind: produto
  icon: check-square-o
  price: R$ 39,90
  price_note: pagamento único
  description: Planilha pronta em Google Sheets/Excel para montar o Registro de Operações de Tratamento de Dados (ROPA) exigido pela LGPD — estruturada para pequenas e médias empresas, sem juridiquês.
  url: https://go.hotmart.com/P106826473V?dp=1
  cta: Comprar
  status: disponivel

## Serviços
- name: Pentest de Aplicações Web
  kind: servico
  icon: bug
  price: Sob consulta
  price_note: conforme escopo
  description: Teste de intrusão em aplicações e APIs, com relatório técnico e executivo.
  features: Recon e mapeamento de superfície | Exploração manual e automatizada | Relatório com prova de conceito e criticidade | Reteste das correções incluso
  url: mailto:gadotti.eduardo@gmail.com?subject=Pentest%20de%20Aplica%C3%A7%C3%B5es%20Web
  cta: Pedir orçamento
  status: sob-consulta
  notes: Necessária autorização formal do responsável pelo ambiente antes do início dos testes.

- name: Consultoria em Segurança da Informação
  kind: servico
  featured: true
  icon: shield
  price: Sob consulta
  price_note: por projeto
  description: Diagnóstico de maturidade em segurança, definição de controles e plano de ação priorizado para a sua empresa.
  features: Diagnóstico de maturidade | Plano de ação priorizado por risco | Apoio na implementação de controles | Relatório executivo para a diretoria
  url: mailto:gadotti.eduardo@gmail.com?subject=Consultoria%20em%20Seguran%C3%A7a%20da%20Informa%C3%A7%C3%A3o
  cta: Solicitar proposta
  status: sob-consulta
  notes: "Escopo definido após reunião de alinhamento sem custo.\nAtendimento remoto para todo o Brasil e presencial para Blumenau e região."

- name: Consultoria para Certificação ISO 27001
  kind: servico
  badge: Do zero à certificação
  icon: list
  price: Sob consulta
  price_note: por hora
  description: Acompanhamento de ponta a ponta na implantação do SGSI, do diagnóstico inicial até a auditoria de certificação — com cronograma, políticas e controles construídos junto com o seu time.
  features: Avaliação do ambiente e análise de lacunas | Cronograma e plano de atividades por fase | Desenvolvimento de políticas, normas e procedimentos | Análise de riscos e Declaração de Aplicabilidade | Implantação dos controles do Anexo A | Preparação para a auditoria de certificação
  url: mailto:gadotti.eduardo@gmail.com?subject=Consultoria%20para%20Certifica%C3%A7%C3%A3o%20ISO%2027001
  cta: Solicitar proposta
  status: sob-consulta
  notes: "Trabalho conduzido em fases, com entregas e reuniões de acompanhamento definidas no cronograma.\nA certificação em si é emitida por um organismo certificador acreditado e independente — a consultoria prepara a empresa para a auditoria, mas não substitui nem garante o resultado dela.\nAtende também empresas que já são certificadas e precisam de apoio na manutenção do SGSI e nas auditorias de recertificação."