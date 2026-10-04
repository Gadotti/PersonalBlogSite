---
title: SQL injection with SQL Server Unicode smuggling
date: 2022-11-03 20:22:43
tags: ["hacking", "SQLi"]
translation_key: sqlserver-smuggling
translated_by: ai-reviewed
---

## Introduction

In some cases, *SQL injection* is still possible even when the application uses mitigations and escaping that are considered safe. The trick is to force implicit character conversions in the DBMS, depending on how it's configured.

The attack works by inducing the conversion of *Unicode homoglyphs* when Unicode string types are converted to non-Unicode ones (NCHAR, NVARCHAR => CHAR, VARCHAR). For example, the character ```ʼ``` (U+02BC) in NVARCHAR can be interpreted as ```'``` (U+0027) in VARCHAR, bypassing *escaping* routines **and even parameterized statements**.

So even if the application never concatenates SQL parameters directly into the *string* and passes every parameter using the recommended techniques, it's worth checking whether your DBMS has the conditions that make this kind of attack possible.

Examples of conversions this technique can take advantage of:
```
=> Ā can be translated to A.
=> ʼ can be translated to '
```

## What this means in practice

Starting from basic *SQL injection* techniques, consider a scenario where the following query is executed:
```sql
SELECT USER FROM USERTABLE WHERE USERNAME = '%PARAMETER%'
```

Take the classic attempt of injecting ```' OR 1=1 --```. If the application doubles the ```'``` character as its sanitization, the attempt fails:
```sql
SELECT USER FROM USERTABLE WHERE USERNAME = ''' OR 1=1 --'
```

But if the DBMS is subject to implicit character conversion, we can try the same injection with ```ʼ``` in place of ```'```. The application layer doesn't treat that character the way the DBMS does, so the injection can succeed:
```sql
SELECT USER FROM USERTABLE WHERE USERNAME = '' OR 1=1 --'
```

## How to check your DBMS

To check these conditions in your database, here is the sequence of scripts for SQL Server. They create the database, a mapping table, and a table of Unicode characters to compare against. Once that's done, you can run a few simple queries to see whether any conversions diverge from the mappings.

1. SETUP 1 (of 3): CREATE DATABASE
* https://github.com/Gadotti/MappingSQLServerSmuggling/blob/main/%231%20CREATE%20DATABASE.sql


2. SETUP 2 (of 3): CREATE Mappings TABLE
* https://github.com/Gadotti/MappingSQLServerSmuggling/blob/main/%232%20CREATE%20Mappings%20TABLE.sql

3. SETUP 3 (of 3): CREATE UnicodeCharacters TABLE
* https://github.com/Gadotti/MappingSQLServerSmuggling/blob/main/%233%20CREATE%20UnicodeCharacters%20TABLE.sql

With the tables populated, you can run the queries below to find any unmapped conversions.

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

## Conclusion

*Injection* flaws are still at the top of the list of vulnerabilities found in applications, so we need to be ready for every way they can be exploited, especially where *parameterized statements* aren't used.

Many applications try to block SQL injection manually, and the best-known technique is doubling the ```'``` character in the input *strings*. This is one of the techniques that can be used to get around that kind of handling.

Given how much damage *SQL injection* can do, it pays to watch for conditions like these, especially as application developers or DBAs, even where *parameterized statements* are used.

## Sources:
* https://owasp.org/www-pdf-archive/OWASP_IL_2007_SQL_Smuggling.pdf
* https://security.stackexchange.com/questions/108472/how-to-defeat-doubling-up-apostrophes-to-create-sqli-attack
* http://dba.stackexchange.com/questions/76781/converting-a-unicode-value-to-a-non-unicode-value-sql-server/122375#122375
