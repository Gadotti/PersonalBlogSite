---
title: Relação entre Cookies, Gerenciamento Sessões Web e Segurança
date: 2021-11-28 17:15:47
tags:
---
 
# Relação entre Cookies, Gerenciamento Sessões Web e Segurança
O artigo a seguir foi extraído de uma palestra ministrada em 29/10/2019 sobre propriedades de segurança de cookies no contexto do gerenciamento de sessões do usuário de uma aplicação web. O intuito é destacar a importância do uso correto das propriedades em cookies.
 
O conteúdo não é considerado avançado, porém ainda assim de extrema importância para entender e manter o básico em relação à segurança da informação.
 
Se preferir, a palestra pode ser conferida através do link do youtube: https://www.youtube.com/watch?v=XLG07IcNSFs
 
# Sumário
- [Introdução](#Introducao)
- [Sobre diferentes usos dos Cookies](#Sobre-diferentes-usos-dos-Cookies)
- [Possíveis propriedade dos Cookies](#Possiveis-propriedade-dos-Cookies)
- [1. HttpOnly](#1-HttpOnly)
- [2. Secure](#2-Secure)
- [3. SameSite](#3-SameSite)
- [Relação com a segurança](#Relacao-com-a-seguranca)
- [XSS](#XSS)
- [RCE](#RCE)
- [Conclusão](#Conclusao)
 
# Introdução
 
Apenas para contextualização, alguns conceitos básicos sobre o que será abordado ao longo do artigo.
 
#### O que são Cookies?
Essencialmente são informações que são armazenadas em nossos navegadores, criadas pelos sistemas em que navegamos e reenviadas a este durante o nosso uso.
 
O fluxo se inicia quando o servidor envia a informação ao navegador que a armazena conforme indicado. A cada requisição realizada, automaticamente são incluídos os cookies de mesmo domínio no envio ao servidor, devolvendo o valor originalmente armazenado.
 
Podem ser consultados através do 'Developer Tools' (F12) de nossos navegadores, na opção 'Armazenamento' ou equivalente.
![Browser DevTools](/imgs/cookies/devtools.PNG)
 
#### O que é sessão?
A "Sessão" nesse contexto é uma reserva temporária de alguma informação no servidor, podendo indicar o código que representa a sessão de um usuário específico. Por exemplo:
```
2r5b2c3loehdubuh0ppy2f50 ⇔ Eduardo Gadotti
```
 
Neste caso o código representado, indica no servidor que representa o usuário "Eduardo Gadotti".
Esse armazenamento pode ser em memória, banco de dados ou em arquivos e normalmente se concretiza após a autenticação realizada (login e senha)
 
 
# Sobre diferentes usos dos Cookies
O cookies e suas informações podem e são utilizados para os mais diferentes objetivos, como por exemplo controle de idioma selecionado, preferências de uso do usuário, algum tipo de rastreamento, entre outros. No entanto, para ser mais objetivo, irei focar no uso para o controle de sessão de usuários.
 
Sendo uma informação que representa a identificação do usuário, ela se torna **sensível** e então necessária de ser **protegida**.
 
O controle de sessão ainda pode ser realizada de outras formas, basicamente menos seguras, como:
- LocalStorage
- URL
- Campo ocultos
 
Vale lembrar que o uso de cookies para o gerenciamento de sessões não são inseguros, seu uso incorreto é que o fazem.
 
# Possíveis propriedades dos Cookies
Os cookies possuem 3 propriedades que são possíveis gerenciar, sendo todas para o tratamento de questões de segurança.
- HttpOnly
- Secure
- SameSite
 
# 1. HttpOnly
Ao ativar esta propriedade, faz com que código que está rodando seu navegador do sistema, não consiga acessar diretamente a informação contida no cookie. Em outras palavras, as rotinas *javascript* de front-end não poderão coletar ou acessar a informação do cookie.
 
Isto irá mitigar que códigos maliciosos injetados na aplicação, e que rodam no *client-side* (XSS), não tenham sucesso em sequestrar a sessão de usuários.
![Propriedades Cookies](/imgs/cookies/http_only_1.PNG)

Na imagem seguinte, é possível observar que não foi possível coletar o cookie ASP.NET_SessionId, que estava com a propriedade *httpOnly* ativada.
![Lendo Cookies](/imgs/cookies/http_only_2.PNG)
 
# 2. Secure
Com a propriedade ativa, irá mitigar a possibilidade de interceptação da informação através de tráfego não criptografado (HTTP), quando há exploração de MitM. Cookie não será enviado ou recebido caso as requisições não estejam trafegando através de HTTPS.
 
Em outras palavras:
- HTTPS? Cookie enviado pela internet ao servidor
- HTTP? Cookie não é enviado pela internet
 
Logo esta propriedade só deve ser ativada para sistemas que realizam a comunicação via HTTPS, o que é recomendado de qualquer forma.
 
# 3. SameSite
Esta propriedade possui forte relação com a mitigação de vulnerabilidades do tipo CSRF (Cross-Site Request Forgery).
![Fluxoframa funcionamento SameSite](/imgs/samesite/fluxograma.jpg)

A explicação completa do seu funcionamento já foi demonstrado através de um artigo anterior e pode ser conferido em https://eduardogadotti.com/2021/02/13/samesite/
 
# Relação com a segurança
O controle e ativação de uma ou mais propriedades não são as soluções para todos os problemas de segurança, mas servem para reduzir a superfície de ataque. Neste sentido, a recomendação é que sempre se ative as propriedades **httpOnly** e **secure**.

Quanto ao uso da propriedade **SameSite**, apesar do uso do valor **Strict** implicar no cenário mais seguro, nem sempre é possível dado o contexto de uso da aplicação em questão. Sendo assim, é necessário avaliar o uso correto e aplicar outros controles se necessário.
 
Outra recomendação importante quanto a segurança da sessão, é que se crie um novo código de sessão a cada novo login. É possível que ao navegar em uma tela de autenticação, o sistema já faça a distribuição de um código de sessão ainda não relacionado com usuário. Após a autenticação com sucesso, é indicado que esta sessão seja renovada, mais uma vez evitando assim o sequestro de sessões utilizando diferentes estratégias.
 
# XSS
A exploração de XSS são os principais vetores para coletar valores de cookies, portanto a importância do uso da propriedade **httpOnly** por exemplo. Vulnerabilidade do tipo XSS são comuns de serem encontradas em praticamente todos os sistemas, é raro a existência de um sistema Web que esteja absolutamente blindado contra este tipo de exploração.
 
Existem ainda outros casos em que a exploração de XSS se dá através da injeção de valor nos próprios cookies, isto pode ocorrer quando a aplicação no servidor utiliza a informação para realizar outra operação ou para renderizar alguma mensagem na página. O que nos leva ao próximo tópico.
 
# RCE
Em alguns casos mais raros, a injeção de valores em cookies podem levar a exploração de Remote Code Execution (RCE), encontrado em alguns cenários de aplicações PHP, que utilizam o valor do cookie para criar uma pasta no servidor para armazenar qualquer arquivo ou informação relacionada àquela sessão.
 
Por exemplo
```
MKDIR rrvqzonj5dlwjfshutellxqn
```
Passaria a ser vulnerável à injeção "***; FORMAT C:/***":
```
MKDIR rrvqzonj5dlwjfshutellxqn; FORMAT C:/
```
 
# Conclusão
É importante que fiquemos atentos ao uso das propriedades dos cokies que temos à disposição, fazendo o gerenciamento corretamente. Às vezes podemos cometer o erro de subestimar a importância ou confiar demais no que achamos que não seja possível, caindo na armadilha do "***não sabemos o que não sabemos***".

Minha sugestão é não apostar na nossa falta de criatividade em imaginar como as explorações podem ser realizadas.
 
Também neste contexto apresentado, sempre ter em mente que é a informação que identifica o usuário, portanto necessária de ser protegida.
 
Minha pequenas recomendações ainda são:
- Não armazene o código da sessão, não pelo menos de forma desprotegida.
- Não trafegue por URLs - Logs de servidor, menor proteção. Cuidado com métodos GET, considere POST.
- Não faça log do conteúdo no servidor, faça um *hash* se necessário para comparação e rastreio.