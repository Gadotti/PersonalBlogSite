---
title: XXE Attack. Nem todo XML é inocente!
date: 2020-11-23 16:17:08
tags: ["security", "hacking", "dev"]
---

## Sumário
- [XXE Attack. Nem todo XML é inocente!](#XXE-Attack-Nem-todo-XML-e-inocente)
- [Ah não! Mais uma forma de injection?!](#Ah-nao-Mais-uma-forma-de-injection)
- [Demonstração](#Demonstracao)
- [Tipos de XXE](#Tipos-de-XXE)
- [Mitigação](#Mitigacao)
- [Conclusão](#Conclusao)
- [Referências](#Referencias)

## XXE Attack. Nem todo XML é inocente!

O termo **XXE** significa **"External Entity Processing"**, e virou sinônimo de vulnerabilidade a ser explorada em sistemas que ainda utilizam estruturas de mensagens em XML.

Talvez você nunca tenha usado, mas o XML possui um recurso muito interessante, onde é possível processar entidades externas, com conteúdos variáveis, no momento de carregamento no programa.

O problema começa quando o recurso pode ser utilizado para obter informações do servidor da aplicação, ou para realizar injeção de informações maliciosas, principalmente quando é possível a manipulação do XML que será enviado à aplicação.


## Ah não! Mais uma forma de injection?!

Sim, mas este tipo de exploração não é novidade. É listada como item 4 do [OWASP Top 10](https://owasp.org/www-project-top-ten/) e já está aí a um bom tempo.

Dependendo da linguagem de programação adotada, ou a versão do *framework* em uso, este não será um problema a se preocupar, mas ainda assim é importante o conhecimento e aplicação de código preventivo, independente do ambiente, sempre visando a *redução da superfície de ataque*.

## Demonstração

Veja o simples XML  como exemplo abaixo:
```xml
<?xml  version="1.0" encoding="ISO-8859-1"?>
<usuario>Eduardo Gadotti</usuario>
```

A tag possui um valor fixo com o conteúdo "*Eduardo Gadotti*", e ao carregar este arquivo, o programa irá obter esta informação sem problemas através do *InnerText* da tag.

É possível tornar o conteúdo "*Eduardo Gadotti*" variável, indicando que este conteúdo deve ser substituído por outra informação, de alguma entidade externa, alterando o XML como no exemplo abaixo:
```xml
<?xml  version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE usuario [
   <!ELEMENT usuario ANY >
   <!ENTITY xxe SYSTEM  "file:///C:/Users/gadot/Desktop/XXE/my_webserver_config.txt" >]>
<usuario>&xxe;</usuario>
```

O que estou fazendo agora é indicar que a variável "**&xxe;**" deve ser substituída pelo conteúdo do arquivo "**my_webserver_config.txt**". Perceba aqui como o código de um sistema web estará rodando em seu servidor, este arquivo será obtido do servidor onde a aplicação está sendo executada, e não no cliente em utilização, o tornando ainda mais vunerável as possibilidades de ataques.

Supondo que este arquivo exista, o programa irá processar a tag "**usuario**" com conteúdo do arquivo indicado. Se esta é uma informação que será apresentada ao usuário posteriormente, pode ser uma forma de coletar informações do servidor da aplicação.

Exemplo do processamento:
![Execução do programa](/imgs/xxe_attack/xxe_attack_1.gif)

## Tipos de XXE

No exemplo foi demonstrado o **XXE** do tipo **File Disclosure**, porém existem vários tipos alterando a configuração das origens e como a entendida é processada. Alguns deles:
- Entity
- Denial-of-Service
- Local File Inclusion
- Access Control Bypass
- SSRF
- Remote Attack
- UTF-7
- Base64 Encoded
- XXE inside SVG

## Mitigação

Para quem está programando utilizando o **.Net framework**, e carregando o XML com a classe **System.Xml.XmlDocument**, a mitigação é muito simples, basta atribuir ***null*** para a propriedade **XmlResolver** após a criação do objeto e antes do carregamento do XML. 

Ficará assim:
```csharp
var myXml = new XmlDocument();
myXml.XmlResolver = null;
myXml.Load(@"C:\Users\gadot\Desktop\XXE\xxe_attack_file_system.xml");
```

**Importante**: Por padrão, as versões inferiores ao framework **4.5.2** são consideradas inseguras, sendo obrigatório atribuir ***null*** à propriedade **XmlResolver** para que entidades externas não sejam processadas. A partir desta versão, as entidades externas já não são mais processadas, exceto quando explicitamente definidas em um objeto do tipo **resolver** para tal.

Caso não esteja utilizando a classe **XmlDocument**, ou esteja utilizando outra linguagem, recomendo a verificação da prevenção através do [XXE Cheat Sheet do OWASP](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html)

Mesmo que seu XML não seja carregado externamente, programe e previna seu código com as boas práticas. *Você não pode garantir 100% que a origem do arquivo será sempre confiável agora e no futuro*.

Outra dica, é que se for possível migrar a estrutura de mensagens para **JSON**, por exemplo, migre.

## Conclusão
O foco do artigo não é listar e detalhar cada tipo de **XXE**, mas sim alertar a existência deste tipo de vulnerabilidade, explicando e fornecendo uma introdução sobre o assunto e como aplicar as mitigações necessárias.

Assim como injeções via *SQL, DOM e javascripts*, também existem outros tipos que não estão no radar dos desenvolvedores. O **XXE** é um deles, que possibilita diversos tipos de ataques, como coleta de informações sensíveis ou de injeção de código nos sistemas de forma arbitrária, levando a consequências piores.

A forma de mitigação apresentada é simples e eficaz, porém é necessário disseminar a cultura do desenvolvimento seguro, para que ações deste tipo se tornem triviais.

# Referências

- https://medium.com/@ismailtasdelen/xml-external-entity-xxe-injection-payload-list-937d33e5e116
- https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing
- https://docs.microsoft.com/pt-br/dotnet/api/system.xml.xmldocument.xmlresolver?view=net-5.0
- https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html
