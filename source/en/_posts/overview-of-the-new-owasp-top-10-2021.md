---
title: An overview of the new OWASP Top 10 2021
date: 2021-12-12 16:02:14
tags: ["security","owasp"]
translation_key: owasp-top10-2021
translated_by: ai-reviewed
---

# An overview of the new OWASP Top 10 2021

OWASP's references and guidelines have helped professionals, students and companies find direction and a baseline for best practices in information security, especially in software development.

The 2017 edition of the [OWASP Top 10](https://wiki.owasp.org/images/0/06/OWASP_Top_10-2017-pt_pt.pdf) (PDF in Portuguese) has been used worldwide for years. It's an exceptionally polished, direct and clear guide to attack vectors, attack scenarios and mitigation.

After 4 years, an update to the list was announced: the [OWASP Top 10 2021](https://owasp.org/Top10/). There were a few changes, which you can see mapped in the image below:
![Mapping](/imgs/owasp_top10_2021/mapping.png)

Here are a few observations I consider relevant:

# 1. Cross-Site Scripting (XSS)

This item no longer exists on its own in the 2021 edition. It now falls under the "Injection" category (now in third place).

In my view, this was the **least** successful change. There's no longer detailed documentation on script and DOM injection, which are still very common in web applications.

XSS is still an extremely popular and heavily exploited vulnerability, and in many cases it has a high impact on systems. With this merge, the focus on XSS is lost, since the category's description and examples only address SQL injection.

For these cases, we'll still need to rely on the 2017 reference.

# 2. XML External Entities (XXE)

I think it's fair to merge this item into "A5: Security Misconfiguration", since the last few years have seen an accelerating shift from XML to JSON, which has mitigated and reduced the chances of exploiting this kind of vulnerability.

The problem is that the new "A5: Security Misconfiguration" hasn't had its references updated to include a description of XXE, now absorbed into its category. I fear that XXE will lose its weight and visibility this way. There's a risk that new developers who only use the 2021 edition will never learn what XXE is or how to mitigate it.

# 3. Server-Side Request Forgery (SSRF)

Here I think creating this new category was the right call. We needed a reference for SSRF. That said, I believe the category could have been used to cover other kinds of redirection as well, such as [Reverse Tabnabbing](/en/2020/10/02/have-you-heard-of-reverse-tabnabbing/).

# Conclusion

I think it's extremely important that OWASP keeps publishing updates and that we follow their evolution. If you aren't familiar with them, I recommend reading the new edition (https://owasp.org/Top10/) and the previous one (https://wiki.owasp.org/images/0/06/OWASP_Top_10-2017-pt_pt.pdf, in Portuguese) carefully.

Unfortunately, in my view, we lost some important references that are still relevant today.

Another big drawback of this update is the format it's presented in. In the 2017 edition, each item fit on a single A4 page, laid out visually in a direct, clear way that was easy to understand and absorb.

I hope the 2021 edition gets better formatting and documentation, so these improvements can be incorporated.

My suggestion is that we do pay attention to the 2021 edition, but I'll keep the 2017 edition close at hand.
