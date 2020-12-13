---
title: Links Úteis
date: 2020-12-13 15:51:07
---

**Blogs**
https://thehackernews.com/
https://www.elemarjr.com/pt/blog/
https://cgreinhold.dev/

**Scanners**
https://www.ssllabs.com/ssltest/
https://hstspreload.org
https://caniuse.com/
https://www.securityscore.com.br/
https://www.shhgit.com/ (Monitoramento em tempo real de possíveis informações sensíveis sendo commitadas no GitHub, GitLab e BitBucket)

**Verificação de DNS**
https://toolbox.googleapps.com/apps/dig/
https://dnslytics.com/

**Tools**
http://sqlmap.org/
https://docs.microsoft.com/en-us/sysinternals/
https://www.openwall.com/john/ (John the Ripper password cracker)
https://pentestbox.org/pt/ (Várias ferramentas em sandobox sem necessidade de subir uma VM)
https://github.com/globocom/huskyCI (Ferramenta feito pela Globo. Orquestrador de análise de código de repositório para rodar junto com um CI. Verifica qual é linguagem do push e roda o analisador de código de segurança configurado. Por exemplo, se for GO, roda GoSec... se for python, roda Bandit.. assim por diante...)
https://github.com/Genymobile/scrcpy (Solução para transmitir a tela do celular para o computador)
https://portswigger.net/burp/
https://www.zaproxy.org/
https://www.charlesproxy.com/
https://www.telerik.com/fiddler
https://www.wireshark.org/
https://www.postman.com/
https://dbeaver.io/

**Mapas mentais, diagramas e prototipação**
https://www.mindmeister.com/
https://miro.com/app

**Emissão de certificado Https baixo ou nenhum custo**
https://letsencrypt.org/

**CORS ByPass**
https://cors-anywhere.herokuapp.com/

**Lax vs Strict**
https://blog.benpri.me/blog/2019/05/13/samesite-cookies-in-practice/

**XSS Game**
https://xss-game.appspot.com

**Busca de dlls e processos**
https://www.processlibrary.com/en/

**I Know What You Download**
https://iknowwhatyoudownload.com/en/peer/

**Comparador de hashs**
https://hashdecryption.com/
https://emn178.github.io/online-tools/

**Regras de boas práticas do Sonar**
https://rules.sonarsource.com/csharp

**CheatSheets e prevenções**
Geral: https://cheatsheetseries.owasp.org/index.html
XSS: https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
DOM XSS: https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.md
SQLi: https://www.netsparker.com/blog/web-security/sql-injection-cheat-sheet/

**Calcular nível de vulnerabilidades**
https://www.first.org/cvss/calculator/3.0
https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator

**Coleção de relatórios de pentes de todos os lugares do mundo**
https://github.com/juliocesarfort/public-pentesting-reports

## Guias

**Guia - Critérios de segurança no código**
https://security-code-scan.github.io/

**Guia - 4 coisas que todo relatório deve ter**
https://rhinosecuritylabs.com/penetration-testing/four-things-every-penetration-test-report/

**Guia - Focar nos itens importantes do guide, como e o que utilizar**
https://www.apriorit.com/dev-blog/622-qa-web-application-pen-testing-owasp-checklist

**Security Design Guidelines for Web Services**
https://msdn.microsoft.com/en-us/library/ff649737.aspx

## Tricks
jQuery Version:
```javascript
alert(jQuery.fn.jquery);
```

[XSS poliglota](https://github.com/0xsobky/HackVault/wiki/Unleashing-an-Ultimate-XSS-Polyglot)

```javascript
jaVasCript:/*-/*`/*\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert()//>\x3e
```