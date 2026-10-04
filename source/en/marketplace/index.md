---
title: Marketplace
date: 2026-08-07 00:00:00
type: marketplace
subtitle: Products and services I offer
translated_by: ai-reviewed
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

## Digital Products
- name: LGPD Spreadsheet: Organize Your ROPA Without the Red Tape
  kind: produto
  icon: check-square-o
  price: R$ 39.90
  price_note: one-time payment
  description: A ready-to-use Google Sheets/Excel spreadsheet for building the Record of Processing Activities (ROPA) required by the LGPD (Brazil's General Data Protection Law) — designed for small and midsize businesses, with no legalese.
  url: https://go.hotmart.com/P106826473V?dp=1
  cta: Buy
  status: disponivel

## Services
- name: Web Application Penetration Testing
  kind: servico
  icon: bug
  price: On request
  price_note: depending on scope
  description: Penetration testing of applications and APIs, with technical and executive reports.
  features: Recon and attack surface mapping | Manual and automated exploitation | Report with proofs of concept and severity ratings | Retesting of fixes included
  url: mailto:gadotti.eduardo@gmail.com?subject=Pentest%20de%20Aplica%C3%A7%C3%B5es%20Web
  cta: Request a quote
  status: sob-consulta
  notes: Formal authorization from the person responsible for the environment is required before testing begins.

- name: Information Security Consulting
  kind: servico
  featured: true
  icon: shield
  price: On request
  price_note: per project
  description: Security maturity assessment, control definition and a prioritized action plan for your company.
  features: Maturity assessment | Risk-prioritized action plan | Support with implementing controls | Executive report for senior management
  url: mailto:gadotti.eduardo@gmail.com?subject=Consultoria%20em%20Seguran%C3%A7a%20da%20Informa%C3%A7%C3%A3o
  cta: Request a proposal
  status: sob-consulta
  notes: "Scope is defined after a free discovery meeting.\nRemote engagements anywhere in Brazil; on-site in Blumenau and the surrounding area."

- name: ISO 27001 Certification Consulting
  kind: servico
  badge: From zero to certified
  icon: list
  price: On request
  price_note: per hour
  description: End-to-end support for implementing your ISMS, from the initial assessment to the certification audit — with the timeline, policies and controls built together with your team.
  features: Environment assessment and gap analysis | Timeline and activity plan for each phase | Development of policies, standards and procedures | Risk assessment and Statement of Applicability | Implementation of Annex A controls | Preparation for the certification audit
  url: mailto:gadotti.eduardo@gmail.com?subject=Consultoria%20para%20Certifica%C3%A7%C3%A3o%20ISO%2027001
  cta: Request a proposal
  status: sob-consulta
  notes: "The work is done in phases, with deliverables and follow-up meetings laid out in the timeline.\nThe certification itself is issued by an independent, accredited certification body — the consulting work prepares the company for the audit, but it neither replaces the audit nor guarantees its outcome.\nAlso available to companies that are already certified and need support maintaining their ISMS and going through recertification audits."
