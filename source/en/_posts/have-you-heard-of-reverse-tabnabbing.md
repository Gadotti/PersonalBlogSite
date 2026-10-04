---
title: "Have you heard of reverse tabnabbing?"
date: 2020-10-02 18:08:53
cover: /imgs/reverse_tabnabbing/cover.jpg
tags: ["hacking", "security"]
translation_key: reverse-tabnabbing
translated_by: ai-reviewed
---

## Have you heard of reverse tabnabbing?

It may not be a very common vulnerability, since it isn't listed in the [OWASP Top 10](https://owasp.org/www-project-top-ten/OWASP_Top_Ten_2017/Top_10-2017_Top_10), but that doesn't mean it doesn't deserve our attention.

It's a vulnerability in which a page opened from another page can send that first page somewhere else, effectively rewriting the address of the tab that opened it. Since the user is busy with the newly opened page, they probably won't notice that something changed in the original tab, especially if it now shows a *fake* clone that looks just like the real thing. Once they use that malicious *phishing* page, their sensitive data can be captured.

## How it works
If that sounds confusing, take a look at the flowchart below, which illustrates the sequence.

![Flowchart of an exploit](/imgs/reverse_tabnabbing/reverso_tabnabbing_diagram.png)

This is possible when the originating site opens links, whether through *HTML* tags or *JavaScript*, without setting the properties that mitigate this behavior.

Here's an example of an exploit in which the malicious site redirects the user to a *fake* Gmail login page.

![Demonstration of an exploit](/imgs/reverse_tabnabbing/reverse_tabnabbing_demo.gif)

You can imagine all the phishing variations that could be built on top of this. Even the most attentive users can be fooled by this kind of redirect, which can easily go unnoticed.

## Vulnerable code

These are the main ways this behavior can be exploited:

HTML:

```html
<a href="site-a-ser-aberto.com" target="_blank">Link to the malicious site</a>
```

JS:

```js
window.open('https://site-a-ser-aberto.com');
```

What the malicious destination will do:

```js
if (window.opener) {    
  //Here it redirects the originating tab to any site it chooses
  window.opener.location = "https://fake-gmail.com"; 
}
```

## Mitigation

To mitigate both kinds of calls, just add the two properties **'noopener,noreferrer'**, which stop the destination from taking control of the opener's location.

Examples:
HTML:
```html
<a href="site_malicioso.com" target="_blank" rel="noopener noreferrer">Link to the malicious site</a>
```

JS
```js
//Note that this is the third parameter
window.open('https://site_malicioso.com', '', 'noopener,noreferrer');
```
## That's not my problem!

Are you sure? You might be thinking:
> "My application doesn't let users enter URLs anywhere"

Fine, but what if your application has an XSS vulnerability that lets someone tamper with that data? Or a SQL injection vulnerability that lets someone tamper with a URL loaded from a database?

And you might still think:
> "I guarantee my system won't have any of those vulnerabilities, whether XSS or SQL injection"

OK, but what if the page your application opens has an XSS vulnerability that allows arbitrary JS to run? Can you vouch for the security of a third party's application too?

## Conclusion

The thing to keep in mind is that the focus should always be on reducing the attack surface. A single vulnerability may not cause much trouble on its own, but it's usually the combination of several that causes the biggest headaches.

Details like this make your application much more secure and give it a competitive edge in the market.


## References

- <https://owasp.org/www-community/attacks/Reverse_Tabnabbing>
- <https://security.christmas/2019/12>
