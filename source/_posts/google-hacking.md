---
title: 'Google Hacking: O que os olhos não vêem, o Google indexa'
date: 2020-07-26 15:33:55
cover: /imgs/google_hacking/banner.jpg
tags: ["hacking", "security"]
---
# Google Hacking: O que os olhos não vêem, o Google indexa

Por muitos anos o queridinho dos buscadores é utilizado para consultas banais, inocentes ou de legítimo interesse pela maioria de seus usuários. Mas ele é mais que isso, ele está indexando informações e arquivos que nem imaginamos, as vezes informações indesejadas. Tudo isso está no alcance da ponta dos dedos de pessoas mal-intencionadas.

O **Google Hacking**, ou também chamado **Google Dorking**, é o termo utilizado para consultas direcionadas a encontrar informações sigilosas expostas, falhas de configuração e informações vazadas. É necessário apenas conhecer alguns operadores simples e como sempre, um pouco de criatividade.

A intenção é mais uma vez, demonstrar que sem a necessidade de conhecimento técnico apurado ou de ferramentas restritas e complexas, é possível acessar facilmente informações sigilosas que potencialmente podem causar dores cabeça a muita gente ou empresas. É possível nos proteger e cuidar melhor das nossas informações se soubermos como elas são atacadas ou obtidas.

As possibilidades de combinações são praticamente infinitas, ainda mais considerando que os operadores podem ser combinados entre si. Me concentrei em alguns poucos exemplos para demonstrar formas de buscas e uso dos operadores, sendo alguns deles:
- [intitle](#Operador-‘intitle’)
- [inurl](#Operador-‘inurl’)
- [intext](#Operador-‘intext’)
- [filetype](#Operador-‘filetype’)

## Operador 'intitle'

O operador '***intitle:***' permite buscar especificamente termos que estão no título da página, por exemplo *inurl:login*, que listará neste caso todas as páginas que possuam o termo '*login*' no título. Isto significa que é possível obter rapidamente uma vasta lista de sistemas diretamente em sua página de autenticação para realização de testes de penetração em massa.

![In Title](/imgs/google_hacking/login_intitle.PNG)

Outro exemplo é buscar por páginas com problemas de configuração, onde a listagem do diretório está habilitado, expondo os arquivos do sistema. Esta falha é categorizada como "*Server Security Misconfiguration > Directory Listing Enabled*" e as listagens normalmente possuem o título iniciando com o termo *index of*. Portanto é possível efetuar a busca *inurl:index of*, como no exemplo abaixo.

![Index Of](/imgs/google_hacking/index_of_intitle.png)

Outros exemplos de uso:
- intitle:"< Fazer login"
- intitle:"index of (nome do dominíno do site).com.br ou .br mysql"

## Operador 'inurl'

O operador '***inurl:***' permite buscar páginas onde a respectiva url contenham as partes pesquisadas, possibilitando um afunilamento e direcionando melhor o foco da busca que está sendo realizada. Por exemplo, buscar associações da palavra '*password*' e '*gmail*' que estejam somente no site <https://trello.com>, basta efetuar a busca *inurl:trello.com password gmail*.

![Trello](/imgs/google_hacking/trello.png)

Um site muito conhecido por ser repositório de informações vazadas é o <https://pastebin.com/>. Existia um sistema de busca no próprio site que facilitava encontrar informações postadas em seu sistema, mas foi retirado por justamente facilitar a busca por dados sensíveis expostos. Isso não impediu o *Google* de indexar e possibilitar a busca através dele. Supostamente, podemos usar esse operador para procurar senhas expostas, por exemplo *inurl:pastebin.com password*.

![Pastebin](/imgs/google_hacking/pastebin.png)

Outra possibildade de utilizar o operador, é procurar por sistemas para testar vulnerabilidades de *SQL Injection*, por exemplo usando a pesquisa *produtos.php?id=*, resultará em páginas que utilizam a estrutura de obter o *id* como parâmetro e utilizá-lo em um comando *SQL*.

Outros exemplos de buscas:
- inurl:gov.br
- inurl:github
- inurl:/admin
- inurl:/wp-admin

## Operador 'intext'

O operador '***intext:***' busca informações no corpo das páginas ou do conteúdo indexado. Pode ser usado isoladamente, mas agrega muito se combinado com os outros operadores, por exemplo buscar pelo termo '*digispark*' no site <https://eduardogadotti.com> fica assim: *inurl:eduardogadotti.com intext:digispark*.

![Gadotti Digispark](/imgs/google_hacking/intext_digispark.PNG)

Pode ser usado para refinar os exemplos já demonstrados acima, pesquisando conteúdos em sites como **github**, **trello** ou **pastebin**. Porém pode ser muito poderoso se combinando com o operador apresentado a seguir.

## Operador 'filetype'

E a cereja do bolo, o operador '***filetype:***' que permite buscar por arquivos e seus conteúdos disponíveis em servidores. Isto quer dizer que é possível fazer pesquisas em arquivos do tipo **txt**, **log** ou **config**, informações que normalmente não estão disponíveis através da navegação normal em uma página. Ou outras vezes, por falhas de configuração do servidor, arquivos expostos de forma não proposital.

Normalmente arquivos de *log* ou *txt* contém informações internas, utilizados por desenvolvedores da aplicação ou *log* gerados por *hackers* que invadiram o sistema e estão *logando* informações sensíveis. Não são todos os arquivos encontrados por uma pesquisa desse tipo que irá conter informações que comprometem algum acesso, mas muitos deles sim.

Alguns exemplos, procurando por senhas em arquivos do tipo *log* com a busca *filetype:log password*.

![Log Password](/imgs/google_hacking/log_passwords.png)

Ou senhas em arquivos do tipo *txt* com a busca *filetype:txt password*.

![Txt Password](/imgs/google_hacking/txt_type.png)

Atenção para **strings de conexão de banco de dados**, elas também não escapam combinando operadores *filetype* e *intext* com a busca *filetype:txt intext:"Password="+"Data Source="*, por exemplo.

![Connection Strings](/imgs/google_hacking/intext_connection_strings.png)

Alguns exemplos de tipos de arquivos:
- filetype:log
- filetype:txt
- filetype:config
- filetype:csv
- filetype:xls

## Refinamentos e agregadores

Ainda é possível combinar todos os operadores apresentados em uma única busca. Também existem alguns refinamentos que podem auxiliar na busca, assim como demonstrado na busca por *strings* de conexão, é possível indicar a busca por termos exatos deixando-o entre aspas ("*Password=*") e agregar mais termos com o operador de soma ("*Password="+"Data Source=*").

## Conclusão

Apresentei somente alguns operadores, que isolados já são muito úteis, mas são apenas uma parte de outros diversos que existem para utilizar e combinar, como: *cache:*, *define:*, *related:*, *allintitle*, entre outros.

Propositalmente não adicionei mais exemplos e outros termos de buscas que resultam em ainda mais informações potencialmente sigilosas, visto que o objetivo não é esse. Como diria o mestre Yoda "***Choose wisely, you must, young padawan***", ou seja, utilize para procurar e monitorar informações relacionadas a você ou a sua empresa. Não almejo estimular o comprometimento de credenciais e o roubo de informações, mas sim demonstrar como ocorrem algumas das exposições para estarmos preparados e saber como nos proteger.

Alinhando estas informações com as apresentadas no meu post anteiror ([Como facilitar a vida de um hacker mal-intencionado](https://eduardogadotti.com/2020/07/18/como-facilitar-a-vida-de-um-hacker-mal-intencionado/)), são ótimos indicadores de como monitorar e buscar informações de seu interesse.

## Referências

- <https://www.exploit-db.com/google-hacking-database>
- <https://www.sans.org/security-resources/GoogleCheatSheet.pdf>
- <https://hackersec.com/usando-google-hacking-para-testes-de-invasao/>
