---
title: SQL Injection com SQL Server Smuggling Unicode
date: 2022-11-03 20:22:43
tags: ["hacking", "SQLi"]
---

## Introdução

Existem casos em que é possível realizar explorações do tipo *SQL Injection*, burlando mitigações e escapes considerados seguros, forçando condições de conversões implícitas de caracteres pelo SGDB, dependendo das condições de parametrização deste.

A exploração consiste em induzir a conversão de *Unicode homoglyphs*, considerando a condição de caracteres *strings* unicode (NCHAR, NVARCHAR => CHAR, VARCHAR), como por exemplo o caracter ```ʼ``` (U+02BC) em NVARCHAR pode ser interpretado para ```'``` (U+0027) em VARCHAR, evadindo tratamentos de *escaping* **ou até mesmo em parameters statement**

Ou seja, mesmo que a aplicação não realize a concatenação de parâmetros de SQL diretamente na *string*, passando todos os parâmetros conforme técnicas recomendadas, vale a pena conferir se o SGBD em utilização não possui as condições favoráveis para este tipo de exploração.

Exemplo de conversões que podem ser utilizadas através desta técnica:
```
=> Ā ode ser traduzido para A.
=> ʼ pode ser traduzido para '
```

## O que isso quer dizer na prática

Partindo do princípio de técnicas de *SQL Injection* básicas, podemos considerar o cenário onde é executado o seguinte comando:
```sql
SELECT USER FROM USERTABLE WHERE USERNAME = '%PARAMETER%'
```

Imaginando a condição básica, onde uma possível tentativa de exploração seria a injeção de ```' OR 1=1 --```, onde a aplicação dobra o caractere ```'``` para tratamento, teríamos o resultado sem sucesso:
```sql
SELECT USER FROM USERTABLE WHERE USERNAME = ''' OR 1=1 --'
```

Porém, caso o SGBD esteja sujeito à exploração de conversões implícitas de caracteres, poderíamos tentar utilizar a mesma injeção substituíndo o caracter ```'``` por ```ʼ```, já  que a camada da aplicação não interpretará o mesmo caractere que o SGDB, possibiltando a injeção com sucesso:
```sql
SELECT USER FROM USERTABLE WHERE USERNAME = '' OR 1=1 --'
```

## Como validar seu SGBD

Para validar as condições no banco de dados, deixo aqui a sequência de comandos válidos para SQL Server, onde serão criados o banco de dados utilizados, tabela de mapeamento e de caracteres unicode para comparação. Ao final, simplesmente podemos executar simples consultas para validar se há alguma divergência nas conversões realizadas.

1. SETUP 1 (of 3): CREATE DATABASE
* https://github.com/Gadotti/MappingSQLServerSmuggling/blob/main/%231%20CREATE%20DATABASE.sql


2. SETUP 2 (of 3): CREATE Mappings TABLE
* https://github.com/Gadotti/MappingSQLServerSmuggling/blob/main/%232%20CREATE%20Mappings%20TABLE.sql

3. SETUP 3 (of 3): CREATE UnicodeCharacters TABLE
* https://github.com/Gadotti/MappingSQLServerSmuggling/blob/main/%233%20CREATE%20UnicodeCharacters%20TABLE.sql

Com as tabelas preenchidas, agora é possível executar as consultas abaixo para validar onde possam existir conversões não mapeadas.

```sql
# https://github.com/Gadotti/MappingSQLServerSmuggling/blob/main/%233%20CREATE%20UnicodeCharacters%20TABLE.sql

-----------------------------------------------------------------------------
--  TEST QUERIES
-----------------------------------------------------------------------------
 
-- Do any mappings not match conversion?
SELECT * FROM dbo.UnicodeCharacters WHERE DoesConvertedCharacterMatchMapping = 'No';
 
-- Do any unmapped Code Points have a conversion?
SELECT * FROM dbo.UnicodeCharacters WHERE DoesUnmappedCodePointConvertToSomething = 'Yes'; 
 
-- See all Code Points:
SELECT * FROM dbo.UnicodeCharacters;
 
-- See all conversions:
SELECT * FROM dbo.UnicodeCharacters WHERE CodePage1252CodeBIN IS NOT NULL;
```

## Conclusão

Os problemas de *Injection* ainda estão no topo da lista quando falamos de vulnerabilidades encontradas em aplicações, portanto precisamos estar preparados para as possíveis formas de exploração, principalmente em locais onde *parameters statement* não são utilizados. 

Muitas aplicações tentam evadir injeções de SQL manualmente e a técnica mais conhecida nestes casos é dobrar o caracter ```'``` nas *strings* inserida, sendo esta uma das técnicas possíveis de serem utilizadas para burlar este tipo de tratamento.

Considerando o alto impacto que as explorações de *SQL Injection* causam é sábio estarmos atentos, principalmente como desenvolvedores da aplicação ou como DBA's, em condições para explorações como essa, mesmo onde são utilizados *parameters statement*

## Fontes:
* https://owasp.org/www-pdf-archive/OWASP_IL_2007_SQL_Smuggling.pdf
* https://security.stackexchange.com/questions/108472/how-to-defeat-doubling-up-apostrophes-to-create-sqli-attack
* http://dba.stackexchange.com/questions/76781/converting-a-unicode-value-to-a-non-unicode-value-sql-server/122375#122375


