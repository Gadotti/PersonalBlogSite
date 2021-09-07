---
title: 'Microsoft Teams não faz logoff?'
date: 2021-09-07 17:52:00
tags:
---
# Microsoft Teams não faz logoff?

#### Avisos importantes:
1. Este artigo não explora qualquer vulnerabilidade do MS Teams, já que a própria Microsoft entende que o problema descrito não é um bug.
2. O conteúdo é para fins educacionais apenas, utilize para entender como manter a sua conta segura. 
3. Não utilize as informações aqui contidas para obter vantagens indevidas de contas que você não possui autorização para acesso.
4. As opiniões aqui contidas se limitam a apenas opiniões próprias particulares e não se estendem ou representam quaisquer empregadores com os quais já possui, possuo ou irei possuir vínculos.

## Sumário
- [1. Contexto](#1-Contexto)
- [2. Como é a identificação da sessão do usuário?](#2-Como-e-a-identificacao-da-sessao-do-usuario)
- [3. Persistindo acesso após o logoff do usuário](#3-Persistindo-acesso-apos-o-logoff-do-usuario)
- [4. A inexistência de parâmetros seguros do cookie agrava a situação](#4-A-inexistencia-de-parametros-seguros-do-cookie-agrava-a-situacao)
- [5. Quebrando outros pilares da segurança](#5-Quebrando-outros-pilares-da-seguranca)
- [6. Comportamento inconsistente](#6-Comportamento-inconsistente)
- [7. Formas de exploração: *XSS, phishing, malware ou ambiente coletivo compartilhado comprometido*](#7-Formas-de-exploracao-XSS-phishing-malware-ou-ambiente-coletivo-compartilhado-comprometido)
- [8. Posicionamento da Microsoft](#8-Posicionamento-da-Microsoft)
- [9. Recomendações e embasamentos](#9-Recomendacoes-e-embasamentos)
- [10. Conclusões](#10-Conclusoes)
- [11. Vídeo resumo](#11-Video-resumo)

## 1. Contexto
Neste artigo irei demonstrar como a sessão do usuário no aplicativo de comunicação *Teams* da Microsoft é identificada, a estrutura das mensagens de comunicação e os riscos envolvidos na prática implementada pela Microsoft.

Aqui serão demonstrados comportamentos inadequados referentes à finalização da sessão da autenticação do usuário, comportamento que foi relatado em Março de 2021 à Microsoft, 5 meses antes da publicação deste material. 

A própria Microsoft entende não ser um problema a ser tratado ou que deva ser priorizado, portanto a divulgação destas informações não fere nenhum princípio ético. O intuito é informar os usuários para que possam mitigar potenciais violações em suas próprias contas.

## 2. Como é a identificação da sessão do usuário?
Existem duas principais formas para utilização do *Teams*:
1. Através do navegador, aplicativo web. (Que nem *multibrowser* é, pois não funciona no *Firefox*)
2. Através do aplicativo a ser instalado no desktop.

Nas duas formas o funcionamento será o mesmo, o aplicativo desktop é apenas uma "*casca com navegador imbutido*", ou seja, a mesma aplicação *web* que está rodando no navegador, está rodando no aplicativo *desktop*. Logo todas as informações descritas aqui serão válidas em ambos os casos.

Ao navegar pelos *cookies* do sistema (*dev tools*), é possível identificar que a aplicação faz uso de uma série de *cookies*. Entre todos os *cookies* em uso existe um, e apenas um, que realiza o controle da sessão: o "**skypetoken_asm**".

![Demonstração sessão da aplicação](/imgs/teams/token_sessao.PNG)

Note que o Teams possui um *cookie* de controle de sessão com nome de outro aplicativo, o **Skype**. Arrisco dizer que o *Teams* é um aglomerado de reaproveitamento de código legado, o que justificaria a sua baixa qualidade e performance.

De qualquer forma, é possível comprovar que este é o único vínculo para identificação da sessão. Se obtermos a mensagem de comunicação do *chat* que é realizada, replicando em um emissor isolado (*Postman, por exemplo*) e incluirmos apenas o **skypetoken_asm**, a mensagem é enviada com sucesso em nome do usuário da sessão.

![Envio menssagem com sessão ativa](/imgs/teams/mensagem_enviada_sessao_ativa.PNG)

Com este cenário pronto, agora podemos enviar ou editar mensagens fora do aplicativo *Teams*, de forma autêntica e isolada. Vamos utilizar este ambiente para as próximas observações.

## 3. Persistindo acesso após o logoff do usuário
O verdadeiro problema começa aqui, após o usuário terminar sua sessão através do botão "**Terminar sessão**" é possível ***persistir*** o acesso do usuário, continuando a enviar mensagens novas, editar mensagens, entre outras operações possíveis da conta. Isto ocorre por que, apesar do usuário ***solicitar explicitamente que deseja encerrar sua sessão***, isto não ocorre de fato nos servidores da *Microsoft*.

Esta é uma prática comum quando se confunde autenticação com autorização. O login no Teams é "*gerenciado*" através de uma autorização e não existe de fato o gerenciamento de uma autenticação. Isto faz com que, segundo a política deles, a autorização obtida ainda seja válida pelas próximas **24 horas**.

Sendo assim, qualquer um que tenha coletado o *token* de autorização do *cookie*, poderá se passar pelo usuário de forma autêntica por pelo menos 24 horas após ter explicitamente solicitado o término daquela sessão.

Nas imagens abaixo, é demonstrado a sequência realizada. O término da sessão é solicitado e em seguida através do *Postman*, a mensagem é reenviada utilizando a mesma sessão anteriormente obtida e efetuada com sucesso.

![Envio menssagem com sessão ativa](/imgs/teams/terminando_sessão.PNG)

![Envio mensagem com sucesso após logoff](/imgs/teams/envio_mensage_apos_logoff.PNG)

As consequências são quase óbvias.

## 4. A inexistência de parâmetros seguros do cookie agrava a situação
A situação é agravada porque o *cookie* que armazena a sessão (**skypetoken_asm**), não possui os parâmetros mínimos de segurança necessários e recomendados, sendo o '**secure**' que impede que ele seja trafegado com conexão que não seja HTTPS e '**httpOnly**' que impede que códigos *javascript* obtenham o valor do *cookie*.

![Sem as propriedades seguras](/imgs/teams/sem_httponly_secure.PNG)

Na prática isso significa que o *cookie* pode ser obtido através de um código que é executado no console do navegador, fazendo com que o usuário clique em algum link malicioso, incorporando a aplicação dentro de um *frame* e o disponibilizando através de uma aplicação controlada pelo atacante ou através de uma possível vulnerabilidade XSS (*Cross-site script*) que possa a vir ser descoberta no *Teams*, são apenas alguns exemplos de como a não existência do parâmetro '**httpOnly**' facilita obter esta informação.

Na imagem abaixo, demonstra como é possível obter a informação desejada através de *javascript*.

![Obtendo token via console](/imgs/teams/capturando_via_console.PNG)

Soma-se ao fato de que o navegador aceitará o tráfego dessa informação sensível através de protocolos **não criptografados**, de forma aberta na rede se assim for forçado, já que o '**secure**' também não está habilitado, logo será possível que o *cookie* seja trafegado via HTTP (**e não somente via HTTPS**).

## 5. Quebrando outros pilares da segurança
Além da possível quebra da autenticidade da informação, a situação ainda permite a quebra da integridade, já que é possível também editar as mensagens já enviadas e não somente enviar novas.

A partir do momento que a sessão é obtida, conforme demonstrado, outras operações também serão possíveis se passando pelo usuário de forma legítima. As demonstrações de envio e edição de mensagens servem apenas para exemplificação.

## 6. Comportamento inconsistente
É curioso se realizarmos uma teste com outras abas abertas da aplicação. Ao terminarmos a sessão em uma das abas, outras abas se desconectarão automaticamente. Isto indica claramente a intenção que ao solicitar o *logoff*, qualquer outro dispositivo conectado através daquela mesma sessão deveria ser imediatamente desconectado.

![Comportamento segunda aba](/imgs/teams/deslogando_segunda_aba.gif)

## 7. Formas de exploração: *XSS, phishing, malware ou ambiente coletivo compartilhado comprometido*
Como já comentado, uma das formas de se obter o *cookie* de sessão pode ser através da exploração do XSS (*Cross-Site scripting*), porém é importante o alerta para outros possíveis cenários onde este sequestro pode ocorrer, como por exemplo:

- *phishing*;
- engenharia social;
- *malware*;
- *sniffing*.

Cenários em que a estação de trabalho é compartilhada, uso de máquinas públicas, uso em *lan-house*, *coworking* ou até mesmo o uso da internet através de rede públicas (aeroportos, cafés, etc) também são cenários possíveis de serem explorados para sequestrar uma sessão, principalmente pela falta dos parâmetros mencionados anteriormente.

## 8. Posicionamento da Microsoft
De minha parte, houveram 2 tentativas para relatar a situação à Microsoft. A primeira tentativa obteve uma resposta rápida demais, informando que o relatório estava sendo encerrado e nem um "*case number*" foi gerado, concluíndo e informando que deveria ser assim mesmo que a aplicação deveria funcionar.

Na segunda tentativa, fiz um relato mais completo, informando os cenários possíveis de exploração, preocupações e principalmente, embasamento técnico com referências de fontes diversas descrevendo e comprovando que a operação se utiliza de uma má prática de gerenciamento. Desta vez o relatório demorou muito mais para ser respondido, ganhou um "*case number*" e ficou certo tempo em análise. Porém, no final das contas, a resposta foi muito próxima da anterior. Informaram que entendem a situação, mas que vão manter assim por não entenderam ser um problema de segurança e que se houver uma revisão futura eles podem considerar a implementação dessa "melhoria", encerrando o caso.

![Resposta da Microsoft](/imgs/teams/resposta_da_ms.PNG)

Não seria a primeira vez que a empresa se utiliza de esquivas, talvez para evitar assumir problemas para que não haja necessidade de liberação de *patches* de segurança ou pagamentos de *bounties*

## 9. Recomendações e embasamentos
Os embasamentos são bem claros nesse sentido, em referências da principal fonte que determina estas boas práticas, a **OWASP**, é possível extrair duas citações relevantes:

> "In order to close and invalidate the session on the server side, it is mandatory for the web application to take active actions when the session expires, **or the user actively logs out**, by using the functions and methods offered by the session management mechanisms"

E também:

> "Logout Button: Web applications must provide a visible and easily accessible logout (logoff, exit, or close session) button that is available on the web application header or menu and reachable from every web application resource and page, so that the user can manually close the session at any time. As described in Session_Expiration section, **the web application must invalidate the session at least on server side**."

Outras referências que citam e comentam sobre boas práticas referente ao gerenciamento de sessões das aplicações:
    1. https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication
    2. https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
    3. https://owasp.org/www-project-mobile-top-10/2014-risks/m9-improper-session-handling
    4. https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/06-Testing_for_Logout_Functionality.html

## 10. Conclusões
Baseado em referências, melhores práticas e em minha experiência como profissional da área de segurança, entendo que a forma que o ***MS Teams*** trabalha com o gerenciamento e o encerramento da sessão são **inadequadas**, permitindo o aumento da superfície de ataques para pessoas motivadas em obter vantagem indevida.

Recomendaria no mínimo as implementadas a serem aplicadas:
- Um método de gerenciamento de sessão mais forte. Sendo uma aplicação utilizada e visada mundialmente, não deveria depender única e exclusivamente de apenas um *token* em um cookie para identificar o usuário.
- Habilitar as propriedades mínimas de segurança da aplicação, permitindo apenas seu tráfego por protocolo criptografado e sem acesso ao seu conteúdo pelo *javascript* ou qualquer linguagem de front-end (*httpOnly* e *secure*).
- Principalmente: invalidar a sessão do usuário **imediatamente** após ser solicitado o encerramento da mesma.

Nós, como usuários do *MS Teams* podemos:
- Não utilizar o aplicativo em rede ou máquinas públicas.
- Não utilizar o aplicativo em computadores de terceiros.
- Torcer pelo melhor

## 11. Vídeo resumo
Vídeo em que apresento resumidamente todo o conteúdo aqui descrito, na prática.
[![Video demonstrativo](/imgs/teams/video_tumb.PNG)](https://vimeo.com/594973983)