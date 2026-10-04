---
title: "Efficient security: Investing smartly, spending less"
date: 2026-09-05 11:49:29
tags: ["TechLeadership", "DevSecOps"]
translation_key: investindo-certo-gastando-menos
translated_by: ai-reviewed
---

![Banner](/imgs/investindo-certo/banner.png)

*A case study from my own experience on processes, maturity and deliberate choices*

A common belief in the information security industry is that a company's security maturity comes down to budget first and everything else second: the more top-tier tools you buy, the safer you are. In this write-up I share a real case study from my own experience: building a mature, effective security program without the most expensive "super tools" on the market, as long as the internal processes are well structured.

Before you buy any tools, you need to get your house in order. That means documenting processes, defining policies, setting clear objectives, building a dedicated team and formalizing procedures. Doing security on a smaller budget doesn't mean cutting investment at any cost, and a tight budget is never an excuse for inaction.

## Contents
- [The scenario: real-world complexity](#The-scenario-real-world-complexity)
- [1. Prevention: stopping the problem before it exists](#1-Prevention-stopping-the-problem-before-it-exists)
- [2. Monitoring: continuous visibility](#2-Monitoring-continuous-visibility)
- [3. Automation: consistency and scale](#3-Automation-consistency-and-scale)
- [4. Investigation: the critical human eye](#4-Investigation-the-critical-human-eye)
- [5. Critical analysis: data-driven risk management](#5-Critical-analysis-data-driven-risk-management)
- [The cost comparison: the core of the case study](#The-cost-comparison-the-core-of-the-case-study)
- [Conclusions](#Conclusions)

## The scenario: real-world complexity

The environment where this security program was implemented is far from simple. The assets are heterogeneous, spread across cloud, on-premises, desktops and mobile phones, with constant external integrations. The team supports hundreds of internal and third-party systems in a remote work model, with decentralized access for 100 to 200 employees.

With an attack surface this wide, "protect everything with the same intensity" can't be the answer. You have to prioritize. For this case study, I chose to focus on the **development lifecycle and the applications we maintain**, and organized the strategy into five complementary fronts: Prevention, Monitoring, Automation, Investigation and Critical Analysis.

## 1. Prevention: stopping the problem before it exists

The first line of defense is cultural and educational: onboarding training, internal materials and business-aligned documentation, all available through internal platforms and a knowledge base. On the technical side, the SonarQube extension in the development environment runs mandatory checks from the very start of every new project. All of this work rests on recognized frameworks such as OWASP and ISO 27001, which give the process consistency and credibility.

## 2. Monitoring: continuous visibility

This is the front that weighs most on the budget, and it combines several tools, many of them open source, for broad coverage:

- **Continuous SAST + SCA**: SonarQube Community handles static code analysis, code quality and security hotspots, while Dependency-Track analyzes the libraries in use (the supply chain).
- **Web configuration analysis**: automated scans with Qualys' SSL Labs for an in-depth review of exposed web configurations.
- **OCS Inventory + CVE Reporting**: OCS Inventory maps the software installed on the company's machines and network, while a custom API that queries NIST covers the blind spots: components, web systems and assets the automatic inventory can't reach.
- **Central event dashboard**: a homegrown dashboard pulls together the key signals from all these sources.
- **In-house development with AI**: analysis of Shadow IT applications to complement coverage of published CVEs.

## 3. Automation: consistency and scale

Automation is what lets the process scale without the team having to grow at the same rate. Jenkins acted as the "conductor" of the operation, triggering scripts (mostly in Python) that plug into the development pipelines for continuous checks and integrations. The rule is simple: any task you do more than once is a candidate for automation.

On the communication side, a homegrown notification hub centralizes alerts and sends them out via Telegram, Discord, webhooks and email, so the right information reaches the right person at the right time.

## 4. Investigation: the critical human eye

No tool replaces skilled human analysis. This front sets aside dedicated time for people to research and analyze things manually, looking at external scenarios beyond the company's immediate reality. The goal is to be proactive: anticipate threats instead of just reacting to them.

I strongly believe in this line: *"Tools are a means. Results come from skilled people."* People are the ones who can question, monitor and evaluate the process:
- What is a false positive?
- What is actually a real risk?
- Does the tool's automatic classification make sense in this specific context?
- Are there blind spots?

## 5. Critical analysis: data-driven risk management

To paraphrase Peter Drucker, *"without metrics, security is just a guess"*. That's why indicators and alerts have to say something meaningful: point out gaps in training, documentation or process, prioritize what to treat first and flag recurring issues. Alerts complement the indicators but follow a strict rule: show only what really matters.

The whole process is managed with in-house metrics and tools, including an internal ticketing system that is crucial for tracking activities and assigning owners.

Here, ISO 27001 isn't red tape. It's a structured methodology that helps define clear roles and responsibilities, prioritize the risks that matter and make security part of the business as something that adds value rather than an obstacle. As a reference framework, it strengthens processes, makes audits easier and boosts the credibility of the whole operation. **You don't need to pay for an official certification to follow a framework's best practices.**

## The cost comparison: the core of the case study

This is where the proposal gets concrete numbers. The table compares the in-house and open-source solutions we use with their commercial equivalents on the market, assuming roughly 60 developers. All values are in Brazilian reais (BRL):

| Tool used | Market equivalent | Price/year (market) |
|---|---|---|
| Jenkins (CI/CD) | GitHub Enterprise | R$ 80,000 |
| SonarQube (SAST) | GitHub Advanced Security | R$ 115,500 |
| Dependency-Track (SCA) | Snyk | R$ 77,000 |
| System for recording incidents/risks | PagerDuty Business | R$ 13,000 |
| Notification hub | Moogsoft | R$ 53,500 |
| ZAP/OWASP (DAST) | Acunetix (Invicti) | R$ 107,000 |
| OCS Inventory + CVE Reporting | Tenable.io / Tenable SC | R$ 192,000 |
| Ransomware leak-site monitoring | Darkfeed | R$ 50,700 |
| Elastic + Kibana | Datadog Enterprise and IBM Security QRadar SIEM | R$ 1,000,000 |

Added up, the market would charge about **R$ 1,700,000 per year** for the equivalents of what we built in-house. That setup handles hundreds of information security events a year, run by a small dedicated team with more than 15 custom solutions.

## Conclusions

This case study makes it clear that the solutions presented aren't necessarily better than the ones on the market, but that doesn't mean you can't build a mature process without the market's tools. Tools matter, but processes and people are essential. If I had to sum up the lesson in one line, it would be: *something beats nothing*.

A few closing takeaways guide the work from here:

- Automate and monitor continuously.
- Don't reinvent the wheel, but don't depend blindly on the market either.
- Keep the inventory continuously up to date.
- Take control of the process, instead of being controlled by it.

Still, there are areas where cutting costs isn't worth it: training, skilled people, and regular pentests and audits remain non-negotiable investments, no matter how much budget is available for tools.

In the end, this case study shows that information security maturity isn't about spending a lot. It's about a well-designed process, smart prioritization and people trained to interpret the tools and get the most out of them.
