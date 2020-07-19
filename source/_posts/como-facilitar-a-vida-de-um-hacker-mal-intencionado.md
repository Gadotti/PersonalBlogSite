---
title: Como facilitar a vida de um hacker mal-intencionado
date: 2020-07-18 14:27:32
tags: ["security", "hacking", "tools"]
cover: /imgs/exposed_data/banner.jpg
---
# Como facilitar a vida de um hacker mal-intencionado

Já pensou em comprometer a empresa ou dados da empresa em que trabalha, sem querer? Já pensou em ser o vetor no vazamento de toda uma base de dados de seu cliente?

As perguntas são para assustar e provocar empatia mesmo. Estamos em uma era de euforia do compartilhamento de dados, informações e status. Tudo isso tem um preço.
 
Não estou falando dos nossos dados pessoais, o que renderia outro longo artigo, mas sim dos dados e informações sigilosas das empresas em que trabalhamos. Quando estudamos sobre engenharia social e cultura da segurança, sempre são observados casos distantes da nossa realidade, mas gostaria de dizer que isso está mais próximo do que gostaríamos.
 
Vou compartilhar um pouco da minha experiência do que já observei em sistemas e redes de empresas com sede baseada em minha cidade (Blumenau / SC), como provocação que situações como estas não estão muito distantes da nossa realidade.

# O que já vi por aqui?

Para proteger as instituições, não citarei nomes ou darei muitos detalhes sobre as vulnerabilidades encontradas. Apenas citarei algumas situações já encontradas em empresas próximas:
- Banco de dados com usuários e senhas administradores expostos e com acesso remoto.
- Tokens de APIs de serviços.
- Ambientes virtuais remotos acessíveis.
- Conferências e reuniões de vídeo conferências expostas.
- Escalação de privilégios em sistemas internos.
- Acessos não autorizados.
- E-mail de pessoas corporativas vinculadas a senhas expostas.

Todos os itens foram observados sem a necessidade de engenharia social, apenas coletando dados públicos e expostos na internet e redes sociais.

# Como eu consegui essas informações?

Trago três exemplos de locais absolutamente comuns e conhecidos por todos nós do meio da tecnologia.

## [Github](https://github.com/)
Existem várias fontes, mas a melhor delas é o [Github](https://github.com/) (ou outro repositório de fontes) que estão públicos. Existem muitos repositórios corporativos que estão abertos, que são mantidos por colaboradores que não possuem uma preocupação primordial com segurança ou que não que possuem uma política de avaliação de *commits*.

Isto facilita muito a busca, que pode ser associada ao [Google](https://www.google.com/) por exemplo, para encontrar em arquivos de configuração informações de acesso a sistemas, como usuários, senhas, tokens de acesso ou outros dados importantes.
![Trello](/imgs/exposed_data/github.jpg)

## [LinkedIn](https://www.linkedin.com/)
Outra fonte bastante útil nesse sentido é o [LinkedIn](https://www.linkedin.com/). É muito fácil identificar os colaboradores de uma determinada empresa e vasculhar seus perfis, normalmente muitos deles postam fotos do seu ambiente ou prints de algo relacionado ao trabalho. Ocasionalmente acabam expondo alguma informação que não deveriam.

Normalmente os colaboradores também possuem seu próprio Github particular, que por sua vez também possuem projetos voltados para empresas privadas, normalmente de onde trabalham ou trabalharam, que pode conter novamente informações sigilosas.

![Trello](/imgs/exposed_data/social-media.jpg)

## [Trello](https://trello.com)
Você sabia que os *boards* públicos são indexados pelo Google? Ou que seu *board* que achava que estava privado, na verdade pode estar público?

É possível através de ferramentas de busca, utilizando palavras chaves (experimente buscar pelo termo "[*inurl:https://trello.com/ password*](https://www.google.com/search?source=hp&ei=UcwQX-rCCeXG5OUP2O2o-Aw&q=inurl%3Ahttps%3A%2F%2Ftrello.com%2F+password&oq=inurl%3Ahttps%3A%2F%2Ftrello.com%2F+password&gs_lcp=CgZwc3ktYWIQAzoICAAQsQMQgwE6BQgAELEDOgIIAFC8CViNMWCnMmgDcAB4AIABnQGIAfEQkgEEMS4xOJgBAKABAaABAqoBB2d3cy13aXo&sclient=psy-ab&ved=0ahUKEwiqr4WN4dLqAhVlI7kGHdg2Cs8Q4dUDCAY&uact=5)" no Google), encontrar informações sensíveis indexadas. Ou buscar pelo nome da empresa, onde também é possível encontrar *boards* mantido por parceiros da empresa que se relacionam.

É impressionante a quantidade de informações sensíveis que as pessoas inserem em quadros de controle deste tipo.

![Trello](/imgs/exposed_data/trello.PNG)

# O que fazer?

Primeiramente e mais importante, criar uma cultura interna para disseminação de boas práticas de segurança e treinamentos. Muitos comportamentos não técnicos podem levar ao vazamento de informações também.

Estar alinhado com treinamentos internos, que contemplem absolutamente todos os colabores envolvidos, criação de rotinas automáticas de verificação e testes é a melhor forma de iniciar a mitigação de vazamentos e comprometimentos das informações.

O Github não é seu inimigo, não é necessário sair alterando todos os repositórios para privados. Abrir o código fonte é uma ótima estratégia muitas vezes, mas alguns cuidados devem ser tomados:
- Atenção com os arquivos de configuração do projeto.
- Se não tiver utilidade pública, mantenha privado.
- Cuidado com o histórico de *commits* em repositórios, uma vez que enviado um arquivo com dado sensível, ele fica mantido no histórico, mesmo após exclusão.
- Tenha consciência onde estão as chaves privadas ou tokens da aplicação, para que não cheguem no repositório.
- Se você possui fontes e projetos relacionados a uma empresa privada em seu repositório particular, migre para o oficial da empresa ou deixe-o privado.

Os cuidados necessários com as redes sociais são inúmeros, mas vale a pena relembrar dois itens importantes:
- Não poste fotos em ambientes de trabalho.
- Cuidado com o que há nos *prints* de telas realizados (urls, ícones, dados)

Em uma época em que todos querem ser "ágeis", explodiram ferramentas como o **Trello** para podermos gerenciar *boards* de forma compartilhada. Isso é ótimo, mas é necessário ter em mente quem pode acessar as informações ali inseridas:
- Certifique-se de não escrever informações sensíveis ou senhas nos *cards*.
- Trabalhe com Boards privados, restritos às equipes.

![Trello](/imgs/exposed_data/postit.jpg)
    

# Conclusão

É importante salientar que não existem apenas Github, LinkedIn ou Trello para obter informações destes tipo. Trouxe apenas três exemplos e existem diversas outras maneiras, caminhos e ferramentas para vasculhar dados. A intenção foi só provocar algumas da opções utilizadas mais comuns e com fácil acesso.
 
Simples não? Não foi necessário nenhuma super ferramenta "hacker" para coletar informações sensíveis de empresas e ocasionar uma possível invasão com consequências devastadoras. Tudo o que é necessário é um pouco de criatividade e saber onde olhar.


#### Nota:
1. Todos as os problemas observados e relatados aqui foram devidamente reportados, de forma privada e particular aos responsáveis.
2. Obrigado ao [Matheus Hoeltgebaum](https://www.linkedin.com/in/matheus-hoeltgebaum-17570318b/) pela revisão do texto.