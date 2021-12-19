---
title: Uma visão geral sobre o novo OWASP Top 10 versão 2021
date: 2021-12-12 16:02:14
tags: ["security","owasp"]
---

# Uma visão geral sobre o novo OWASP Top 10 versão 2021

As referências e diretrizes do OWASP tem auxiliando profissionais, estudantes e empresas a enxergar um norte e uma base para as melhores práticas quando o assunto é segurança da informação, especialmente no desenvolvimento de sistemas.
 
A versão de 2017 do [OWASP Top 10](https://wiki.owasp.org/images/0/06/OWASP_Top_10-2017-pt_pt.pdf) tem sido utilizado mundialmente nos últimos anos, um guia absolutamente polido, direto e claro sobre os vetores de ataque, cenários de ataque e formas de mitigação.
 
Após 4 anos, foi anunciado a atualização desta lista: O [OWASP Top 10 2021](https://owasp.org/Top10/). Foram alguma alterações, que podem ser visivelmente mapeadas nesta imagem a seguir:
![Mapping](/imgs/owasp_top10_2021/mapping.png)
 
Algumas observações que considero relevantes:
 
# 1. Cross-Site Scripting (XSS)
 
Este item deixou de existir como item isolado na versão 2021, que passa a integrar a categoria "Injection" (agora em terceiro lugar).

No meu entendimento, foi a alteração **menos** feliz. Agora, não existe mais uma documentação detalhada sobre as injeções de script e DOM, ainda tão presentes nas aplicações WEB.
 
Ainda é uma vulnerabilidade extremamente popular e explorada, que em muitos casos possui um alto impacto no sistemas. Com esta junção, perde-se o foco para o XSS, já que o item possui o direcionamento apenas para injeção de SQL em sua descrição e exemplificação.
 
Para estes casos, ainda precisaremos utilizar a referência da versão 2017.
 
# 2. XML External Entities (XXE)
 
Acredito e entendo ser justo a junção deste item com o "A5: Security Misconfiguration", já que nos últimos anos se intensificou a migração do uso do XML para JSON, mitigando e reduzindo assim a possibilidade da exploração deste tipo de vulnerabilidade.
 
O problema é que o novo "A5: Security Misconfiguration" não possui atualização de suas referências para incluir a descrição sobre o XXE, agora absorvido por sua categoria. Receio que desta forma a vulnerabilidade perderá sua valoração e conhecimento. Corre-se o risco de que novos programadores que utilizam somente a nova versão 2021, nunca tomem conhecimento sobre o que é XXE e como mitigar.
 
# 3. Server-Side Request Forgery (SSRF)
 
Aqui entendo ser um acerto a criação desta nova categoria. Estávamos precisando de uma referência para o SSRF, no entanto acredito que a categoria poderia ser aproveitada para incluir outros tipos de redirecionamento, como por exemplo [Reverse Tabnabbing](https://eduardogadotti.com/2020/10/02/reverse-tabnabbing/).
 
# Conclusão
 
Entendo ser de extrema importância existir atualizações do OWASP e acompanharmos a sua evolução, recomento que façam uma leitura minuciosa da nova versão https://owasp.org/Top10/ e também a sua versão anterior (https://wiki.owasp.org/images/0/06/OWASP_Top_10-2017-pt_pt.pdf), caso não conheçam.
 
Infelizmente, no meu entendimento, perdemos algumas referências importantes e que ainda são relevantes para o cenário. 

Outra grande desvantagem desta atualização, é o formato em que ela se apresenta. Na versão 2017, cada item estava formado em uma única página A4, organizado de forma visual muito direta, clara e de fácil entendimento e absorção.
 
Espero que a versão 2021 ainda seja melhor formatada e documentada, para que estes pontos de melhoria possam ser integrados.
 
Minha sugestão é estarmos atentos sim à versão 2021, mas manterei a versão 2017 debaixo dos meus braços.

