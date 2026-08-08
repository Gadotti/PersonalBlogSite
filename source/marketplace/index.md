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

  Exemplos:
  ## Serviços
- name: Consultoria em Segurança da Informação
  kind: servico
  badge: Mais procurado
  featured: true
  icon: shield
  price: A partir de R$ 2.500
  price_note: por projeto
  description: Diagnóstico de maturidade em segurança, definição de controles e plano de ação priorizado para a sua empresa.
  features: Diagnóstico de maturidade | Plano de ação priorizado por risco | Apoio na implementação de controles | Relatório executivo para a diretoria
  url: mailto:gadotti.eduardo@gmail.com?subject=Consultoria%20em%20Seguran%C3%A7a%20da%20Informa%C3%A7%C3%A3o
  cta: Solicitar proposta
  status: disponivel
  notes: "Escopo definido após reunião de alinhamento sem custo.\nAtendimento remoto para todo o Brasil e presencial em Santa Catarina."

- name: Pentest de Aplicações Web
  kind: servico
  icon: bug
  price: Sob consulta
  price_note: conforme escopo
  description: Teste de intrusão em aplicações e APIs seguindo OWASP Top 10 e OWASP ASVS, com relatório técnico e executivo.
  features: Recon e mapeamento de superfície | Exploração manual e automatizada | Relatório com PoC e criticidade CVSS | Reteste das correções incluso
  url: mailto:gadotti.eduardo@gmail.com?subject=Pentest%20de%20Aplica%C3%A7%C3%B5es%20Web
  cta: Pedir orçamento
  status: sob-consulta
  notes: Necessária autorização formal do responsável pelo ambiente antes do início dos testes.

## Produtos Digitais
* name: Checklist de Desenvolvimento Seguro
  kind: produto
  badge: Novo
  icon: check-square-o
  price: R$ 49
  price_note: pagamento único
  description: Guia prático em PDF com mais de 120 verificações de segurança para aplicar do design ao deploy.
  features: 120+ itens organizados por fase do SDLC | Referências OWASP e CWE em cada item | Versão editável em planilha | Atualizações gratuitas por 1 ano
  url: mailto:gadotti.eduardo@gmail.com?subject=Checklist%20de%20Desenvolvimento%20Seguro
  cta: Comprar
  status: disponivel
  
-->

## Produtos Digitais
- name: Planilha LGPD: Organize seu ROPA sem Burocracia
  kind: produto
  badge: Novo
  icon: check-square-o
  price: R$ 39,90
  price_note: pagamento único
  description: Planilha pronta em Google Sheets/Excel para montar o Registro de Operações de Tratamento de Dados (ROPA) exigido pela LGPD — estruturada para pequenas e médias empresas, sem juridiquês.
  url: https://go.hotmart.com/P106826473V?dp=1
  cta: Comprar
  status: disponivel
