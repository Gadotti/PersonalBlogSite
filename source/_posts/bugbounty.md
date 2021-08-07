---
title: 'O que não te contam sobre BugBounty'
date: 2021-08-07 14:30:00
tags: ["security","bugbounty"]
---

## O que não te contam sobre BugBounty
É a sensação, é o *hype* do momento no mundo da tecnologia. Notícias bombásticas de vazamentos e notícias inusitadas de crianças ganhando milhares e milhares de dólares por recompensas de falhas encontradas e reportadas a grandes empresas. Nada como valores na tela para fazer crescer o olho de quem anseia o dinheiro fácil.

E assim se dá a largada para o mundo dos *BugBounty's*, atraindo todo tipo de gente. Promessa de cursos que garantem o seu primeiro prêmio de *BugBounty* em **4 meses**, *workshops*, livros e tudo é claro, por uma pequena pechincha, afinal de contas o que é 100 reais, 500 reais ou até mesmo 2.000 mil reais quando, afinal de contas, você pode ganhar **100.000,00 dólares**, não é mesmo?

A verdade é que não é bem assim. Uma pessoa normal não aprende tudo o que precisa saber sobre segurança da informação em 4 meses. Uma pessoa que entra nessa especialidade, unicamente atraída por possíveis grandes prêmios, não se manterá motivada a seguir esse caminho. **A verdade é que não existem atalhos para o aprendizado**.

Sabe outra realidade dura? Você acredita que as empresas realmente querem te pagar uma recompensa? Ingênuo se você pensa que sim. A verdade é que farão de tudo para que seu relatório seja inválido, não aplicável, que não ofereça risco, que seja duplicado ou simplesmente, que não vão corrigir mesmo que seja válido e por isso, um *tapinha* nas costas e "obrigado pelo seu esforço".

Mas quem quer arrancar dinheiro de você não vai te contar isso, com certeza não. Tenho observado denúncias de perfis que estão publicando *prints* falsos de recompensas que recebem, tudo para atrair pessoas a esse "negócio" que ficou parecido com a promessa de ganhos astronômicos com "investimentos" em *DayTrade*. Cuidado.

## Casos

Já publiquei diversos relatórios em diferentes plataformas, já recebi todo tipo de retorno possível e é muito nítido a falta de seriedade na análise de algumas empresas. Veja algumas:

#### Caso 1
Relatei que em um determinado aplicativo de mensagem instantânea, há uma falha de validação do segundo fator de validação de login com IPs não autorizados. A autorização pode ser efetuada com um IP totalmente diferente em relação ao IP do login, qual é a lógica dessa segurança? Não sei, mas a empresa aparentemente não vê nenhum problema, conforme resposta que recebi no print abaixo.

![Caso 1 HackerOne](/imgs/bugbountys/1-HackerOne.PNG)

#### Caso 2
Aqui em um outro aplicativo de mensagem instantânea, reportei uma falha em não invalidar a sessão do usuário quando este pede o logoff do aplicativo, seja na sua versão web ou desktop. 

Imagina você em uma estação pública, se conecta para trocar algumas mensagens e ao clicar em "Sair", acha que sua conta está protegida, quando na verdade qualquer um que coletar a sessão do seu navegador (*que por sinal não está protegida de acesso via javascript, está aberto no LocalStorage do navegador*) poderá se passar por você com acesso total.

Foi necessário realizar o processo de relato **duas vezes**, porque na primeira haviam rejeitado sem nem ao menos entender o que era o problema. Na segunda, depois de muita espera e esforço em provar que era um problema e quais eram as melhores práticas baseadas no OWASP, veio a resposta decepcionante no print abaixo informando que sim, a submissão é válida, mas ele marcaram para ver em uma futura revisão do produto e por isso não tem uma data para correção e então, claro, não vai ter bounty, mesmo se ele decidirem corrigir amanhã. "**Tapinha nas costas e obrigado**"

![Caso 2 Private](/imgs/bugbountys/2-Private.PNG)

#### Casos 3, 4, 5
Aqui outros prints de relatórios diversos em outras plataformas. Casos que simplesmente informam que não vão corrigir, não é válido, é duplicado ou reduzido a criticidade para aceitar sem precisar pagar *bounty*. Curiosamente 3 dos relatórios meus foram completamente anonimizados, por que? Se posteriormente realizarem a correção, não tenho mais como provar que relatei o problema.

**Provas de *rate-limit* no login não aplicado:**
![Caso 3 Bugcrowd](/imgs/bugbountys/3-BugCrowd.PNG)

**Relatório completamente anonimizados depois de um tempo:**
![Caso 4 Bugcrowd](/imgs/bugbountys/4-BugCrowd.PNG)

**Outros relatórios completamente anonimizados:**
![Caso 5 Bugcrowd](/imgs/bugbountys/5-BugCrowd.PNG)

## Conclusão

Não existe nenhum compromisso real, não há garantias de que você será pago, apesar de que sim, existem os pagamentos. Mas não há nenhum contrato legal que irá te defender ou proteger.

Dito isso, não estou influenciando para que desistam desta atividade, longe disso, mas que o faça com consciência. Não faça pelo *bounty* somente, use como treinamento para aprimorar seus conhecimentos, que não seja sua única motivação. Lembre-se, **grandes profissionais não vivem de *BugBounty’s*** e há um motivo para isso, **não há consistência**.

**Bons estudos!**