---
title: "AI everywhere: Theories, lessons and vibe coding"
date: 2026-04-05 14:37:14
tags: ["ia"]
translation_key: IA-everywhere-Teorias-aprendizados-e-vibe-coding
translated_by: ai-reviewed
---

## Introduction

Information security and secure development have always gone hand in hand (or at least they should). As AI tools become part of the daily routine of the people who build and operate software, that relationship has become even more critical. It has also exposed real problems that were already there, now amplified by the productivity boost this new landscape delivers.

Over the past few weeks I went down a hyperfocus rabbit hole trying to understand how tools like Claude and Claude Code fit into this picture: not just as code accelerators, but as pieces of an ecosystem that also has to be understood through a security lens. I gathered references, watched videos, read technical write-ups, tested things hands-on, and I'm now trying to connect the dots between productivity, best practices and real risks.

This post is my kickoff: a collection of ideas, lessons and practices I've picked up along the way, leaning heavily on the work of [Fabio Akita](https://akitaonrails.com/), who has publicly documented his own *vibe coding* journey in an extremely honest and technical way. It's not a definitive guide or the last word on the subject. Everything around this topic moves fast, and there is a lot more to explore. Think of it as a first step.

---

## 1. The principle behind it all: Garbage In, Garbage Out

Before any tool, any model or any workflow, there's one fundamental rule you can't get around: **the output is only as good as what you put in**.

Vague prompt → generic result. Well-built prompt, with context, constraints and a clear goal → genuinely useful result.

A structure that has worked well for me:

> Adopt a persona → Define the task → List the steps → Context and constraints → Final goal → Output format

It sounds bureaucratic, but in practice it saves a lot of back and forth.

---

## 2. Seniority still matters (a lot)

One of the most candid takes I found while studying came from Akita, in his post *["Vibe Code: which LLM is the best? Let's get real"](https://akitaonrails.com/2026/01/29/vibe-code-qual-llm-é-a-melhor-vamos-falar-a-real/)* (in Portuguese; the quote below is my translation):

> *"The quality of your app is directly proportional to your seniority. The more junior you are, the worse your app will be, with or without AI. AIs aren't geniuses with a will of their own. They won't guess what you WANT or what you ACTUALLY NEED."*

AI amplifies what you already know. It doesn't replace technical judgment; it speeds up people who already have it. This point will carry even more weight when we get to the security section.

---

## 3. What AI does well (and what it does poorly)

The experience Akita documented in the [FrankSherlock](https://github.com/akitaonrails/FrankSherlock) project, an AI-built image organizer, also raises some interesting issues worth keeping an eye on. I noticed a lot of overlap between these points and what other content creators have reported, and I've run into some of them myself:

**Strengths:**
- Boilerplate, scaffolding, unit tests: fast and consistent delivery
- Mechanical refactoring (renaming, moving code, extracting methods)
- Following patterns already established in the project
- Quick contextual research

**Watch-outs:**
- Tends to over-engineer architecture decisions, so a human has to rein it in constantly
- Has no domain knowledge specific to *your* business
- **Rarely suggests security protections you didn't explicitly ask for.** This one deserves special attention, and we'll come back to it
- Does whatever you ask with the same enthusiasm; it won't prioritize for you

---

## 4. Context has limits, and that changes your strategy

Something I learned firsthand: **an entire project doesn't fit in the context window.** It's better to work in focused pieces. Akita documents this in his write-up *["37 days of immersion in vibe coding"](https://akitaonrails.com/2026/03/05/37-dias-de-imersão-em-vibe-coding-conclusão-quanto-a-modelos-de-negócio/)* (in Portuguese).

On top of that, everything in the conversation (history, project configuration, files) is sent back as input with every prompt. Long conversations consume more tokens and can degrade the quality of the responses. Best practices I've adopted:

- Restart the chat when it gets too long
- Use `CLAUDE.md` as a living project document, but keep it lean (the FrankSherlock one is 702 lines covering architecture, stack, environment variables, design patterns and a post-implementation checklist, so it's worth studying as a reference)
- Be clear about **what not to do** as much as what to do. The tool is very "proactive," and that can blow through your token budget

---

## 5. Skills, Agents and Commands

Three Claude Code features that make a real difference in larger projects:

**Skills** are specialized instructions that you create and install into your account's capabilities. Think of them as "operating manuals" for specific contexts: compliance analysis, security review, your project's coding standards. The advantage is taking that knowledge out of the conversation context and keeping it available on demand. They're worth learning to build: [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills).

**Commands** are custom shortcuts created inside your project's `.claude/commands` folder. They aren't built in; you build them. A practical example of a well-structured workflow: `/spec` to write a specification, `/break` to split it into smaller issues, `/plan` to research and plan before implementing. The [HumanLayer](https://github.com/humanlayer/humanlayer) repository has concrete examples.

**Agents** are specialized sub-agents that can run in parallel and in the background. You can set up one agent per application layer (frontend, backend or security), each with its own context. A real, well-documented example is the [Security Engineer Agent](https://github.com/edmund-io/edmunds-claude-code/blob/main/.claude/agents/security-engineer.md) in the edmunds-claude-code repository.

The best practice here is **progressive disclosure**: split your Skills by context and call them explicitly when needed, instead of dumping everything into the context at once.

---

## 6. SDD and the workflow for complex projects

One of the biggest problems for people just starting to code with AI is the feeling that it "doesn't listen," makes a mess of the code, or fixes one thing and breaks another. There's a reason for that: missing specifications.

This is where **Spec Driven Development (SDD)** comes in: developing from clear specifications before writing a single line of code. With AI, this becomes even more critical than in traditional development.

One workflow that solves a good share of these problems in practice comes from the video [Vibe Coding doesn't work (New Workflow in Claude Code)](https://www.youtube.com/watch?v=Ea5yaWGqoHQ) (in Portuguese) by *Deborah Folloni*:

1. Write a clear spec for the feature or behavior
2. Break the spec into smaller, well-defined issues
3. Plan and research before implementing each issue
4. Use specialized agents per layer
5. Keep living documentation with clear architecture and design rules

The [Get Shit Done](https://github.com/gsd-build/get-shit-done) repository documents this framework in a very practical way.

---

## 7. The critical point: Security

As I mentioned, AI rarely suggests security protections you didn't ask for, and that is a real risk. *Vibe coding* produces working code, but it churns out vulnerabilities that slip by unnoticed just as quickly.

The video **[1 Hacker vs 4 Vibe Coders](https://www.youtube.com/watch?v=4DzMbBYXa7M)** illustrates this quite directly: four teams build applications with AI assistance while a hacker tries to break into them. The result is very interesting. Most of the projects had exploitable vulnerabilities. But here's the part that matters most: **one of the projects was built with zero vulnerabilities**. The difference? Seniority and good judgment in how the tool was used. Once again, AI amplifies people who already know what they're doing, including when it comes to security.

This reinforces a few practical points:

- Use security-focused agents in your workflow (like the edmunds-claude-code example mentioned above)
- Automate security reviews, such as CVE analysis and PR reviews focused on vulnerabilities
- Look into **Claude's Code Review for PRs** (https://claude.com/blog/code-review) as an additional layer before merging

The bottom line: the speed AI delivers has to come with a more mature security culture, not a weaker one. If you use AI to code fast and skip the security review, you're building up dangerous technical debt.

---

## Conclusion

The question I keep asking myself is: *which tasks in my day eat up time, follow a repetitive pattern and can be safely delegated?* That's where using AI stops being an experiment and becomes a strategy.

But the caveat still stands: go in with clarity, seniority and a watchful eye on security. AI won't solve a problem you can't describe, won't prioritize what you haven't defined, and won't protect what you didn't ask it to protect.

The way forward is to learn to work *with* it, not to hope it works *for* you.

---
 
## References

### My own vibe-coding project
- [GitHub MonitoringPanel](https://github.com/Gadotti/MonitoringPanel)
 
### Fabio Akita
- [Akita's blog](https://akitaonrails.com/) (in Portuguese)
- [Akita Gave In to AI](https://akitaonrails.com/2026/02/24/rant-o-akita-abriu-as-pernas-pra-ia/) (in Portuguese)
- [From zero to post-production in 1 week: behind the scenes of The M.Akita Chronicles](https://akitaonrails.com/2026/02/20/do-zero-a-pos-producao-em-1-semana-como-usar-ia-em-projetos-de-verdade-bastidores-do-the-m-akita-chronicles/) (in Portuguese)
- [37 days of immersion in vibe coding: conclusions on business models](https://akitaonrails.com/2026/03/05/37-dias-de-imersão-em-vibe-coding-conclusão-quanto-a-modelos-de-negócio/) (in Portuguese)
- [Vibe Code: which LLM is the best? Let's get real](https://akitaonrails.com/2026/01/29/vibe-code-qual-llm-é-a-melhor-vamos-falar-a-real/) (in Portuguese)
- [Web scraping in 2026: behind the scenes of The M.Akita Chronicles](https://akitaonrails.com/2026/02/18/web-scrapping-em-2026-bastidores-do-the-m-akita-chronicles/) (in Portuguese)
- [I rewrote OpenClaw in Rust: did it work? FrankClaw](https://akitaonrails.com/2026/03/16/reescrevi-o-openclaw-em-rust-funcionou-frankclaw/) (in Portuguese)
- [The Makita Chronicles: the complete series](https://akitaonrails.com/tags/themakitachronicles/) (in Portuguese)
 
### Repositories
- [FrankSherlock: AI-powered image organizer](https://github.com/akitaonrails/FrankSherlock)
- [FrankSherlock's CLAUDE.md](https://github.com/akitaonrails/FrankSherlock/blob/master/CLAUDE.md)
- [AI-Jail: running Claude Code securely in a container](https://github.com/akitaonrails/ai-jail)
- [edmunds-claude-code: example setup with agents and skills](https://github.com/edmund-io/edmunds-claude-code)
- [Security Engineer Agent](https://github.com/edmund-io/edmunds-claude-code/blob/main/.claude/agents/security-engineer.md)
- [everything-claude-code: complete reference](https://github.com/affaan-m/everything-claude-code)
- [HumanLayer: examples of custom commands](https://github.com/humanlayer/humanlayer)
- [Get Shit Done: SDD framework](https://github.com/gsd-build/get-shit-done)
 
### Videos
- [1 Hacker vs 4 Vibe Coders](https://www.youtube.com/watch?v=4DzMbBYXa7M)
- [Claude Code Workflow](https://www.youtube.com/watch?v=Ea5yaWGqoHQ) (in Portuguese)
- [Learning Claude Code: the complete series](https://www.youtube.com/watch?v=Ffh9OeJ7yxw&list=PLXicWNJqtzwxzS-qotj5JNcMysp9AtI5J&index=2)
- [How to use Skills in Claude](https://youtu.be/h_l8wCr7M2Q?si=Q9jITnJZYDhYwhfA) (in Portuguese)
 
### Documentation and articles
- [How to create custom Skills in Claude](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [RAG for projects in Claude](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)
- [Usage limit best practices](https://support.claude.com/en/articles/9797557-usage-limit-best-practices)
- [Claude for Work: examples by department](https://www.anthropic.com/learn/claude-for-work)
- [Anthropic Learn](https://www.anthropic.com/learn)
- [Claude's Code Review for PRs](https://claude.com/blog/code-review)
- [How to do code review with Claude: a practical guide](https://hamy.xyz/blog/2025-12_claude-code-review)
- [Spec Driven Development (SDD)](https://www.dio.me/articles/spec-driven-development-sdd-desenvolvendo-software-a-partir-de-especificacoes-claras-a92697e969ba) (in Portuguese)
