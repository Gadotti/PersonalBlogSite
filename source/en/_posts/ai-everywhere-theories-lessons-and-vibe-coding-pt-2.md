---
title: "AI everywhere: Theories, lessons and vibe coding - Pt. 2"
date: 2026-04-25 18:04:11
tags: ["ia"]
translation_key: IA-everywhere-Teorias-aprendizados-e-vibe-coding-pt2
translated_by: ai-reviewed
---

## Introduction

The [first part of this post](/en/2026/04/05/ai-everywhere-theories-lessons-and-vibe-coding/) took a few weeks to gather enough material to write. This second part took only twenty days.

That says a lot on its own. Concepts, tools and practices are evolving so fast that any analysis has to be treated as provisional. What was new last week may be obsolete today.

Over these three weeks, I dug deeper into how AI works in a coding context and kept testing it in practice: token consumption, what goes into the context, where models fail silently, and the security concerns that come with all of it.

---

## 1. What changed in twenty days

In the twenty days since the previous post, a few things happened:

- **Claude Opus 4.7 was released**, with stronger reasoning (and higher token consumption per run).
- **[Claude Design](https://claude.ai/design) was released**, a new Anthropic product focused on creating interfaces.
- **The practical realization that the Pro plan isn't enough for heavy daily development.** Anyone who uses Claude Code intensively starts hitting the usage limits regularly. The Max plan becomes a real necessity.

That third point directly affects whether this workflow is economically viable. To understand why those limits get hit so quickly, you need to understand how **token consumption really works**.

---

## 2. Understanding the stack: the layers of AI

Something I found interesting and valuable was building a clearer picture of the layers that make a tool like Claude Code work. With a map I can actually visualize, I started to understand why certain practices work, why costs climb and why answer quality degrades in long contexts.

These are the layers I identified:

| Layer | What it is |
|---|---|
| **LLM** | The language model itself (e.g., Claude Sonnet, Opus) |
| **Harness** | The layer that orchestrates the interaction with the model: prompts, tools, agents. Claude Code, for example |
| **Deep Thinking** | A mode in which the model reasons through multiple internal cycles before answering |
| **KV Cache** | A cache of intermediate weights that speeds up repeated runs. KV Cache = Key-Value Cache |
| **Prompt Cache** | Persistence of the KV Cache across requests, which saves tokens effectively |
| **Tool Calling** | The model's ability to invoke external tools (file reading, shell, search) |
| **Skills and Agents** | Specialized contexts and sub-agents with their own scopes |
| **Context Window** | The total token limit the model can process in a single interaction |
| **Context Rot** | Degradation of answer quality as the context grows |

Understanding this stack has made me question, and change, how I use the tool depending on the situation. Which model, how many agents, how big the CLAUDE.md is, how often I restart the conversation: all of it directly affects cost and quality.

---

## 3. Context Window, tokens and the Context Rot problem

The context of a conversation with an AI isn't just what you type. Here is what makes up the **Context Window** in a session:

- The current prompt
- The full conversation history
- Attached documents and files
- Project instructions (instruction files, configuration files, guardrails)
- Tool output (file reads, command execution, search results)
- Error logs and test output
- The response being generated

All of it counts toward the token limit. As of April 2026, the limit is around **1 million tokens** on paid plans. The rough math: 1 token ≈ 0.75 words in English, a bit fewer in Portuguese. To give you a sense of scale, here is an illustrative table of a few scenarios:

| Tokens | Roughly equivalent to |
|---|---|
| 1k | ~750 words |
| 10k | A lengthy short story |
| 100k | An entire novel |
| 200k | ~150k words / several books |
| 1M | Entire code repositories |

The subtler problem isn't hitting the limit. It's what happens before you get there: **Context Rot**.

As the token volume grows, accuracy and the ability to retrieve information degrade. The model starts to "forget" details from earlier in the conversation, follows instructions less faithfully and produces lower-quality answers. Worse, it does all of this **silently**, without warning you.

Akita put it bluntly in his post *[Clean Code for AI Agents](https://akitaonrails.com/2026/04/20/clean-code-para-agentes-de-ia/)* (in Portuguese; the quote below is my translation):

> "The more you cram into the window, the worse the accuracy on detail. And the agent's context isn't just your code: it has CLAUDE.md, the system prompt, conversation history, tool output, error logs, test output. Everything competing for the same window."

One strategy I have yet to put to the test is restarting the conversation earlier than seems necessary. Once the context gets long, the cost of keeping it starts to outweigh the benefit of continuity.

---

## 4. Extended Thinking (Deep Thinking)

One feature worth understanding is **Extended Thinking**, also called *Deep Thinking*.

In this mode, the model feeds its own prompt back to itself, adding layers of verification and internal re-prompts before it generates the final answer. The flow works like this:

1. The model generates questions for itself about the problem
2. It answers those questions internally
3. It reviews its own results over multiple cycles
4. Each cycle is a "layer" of reasoning
5. More layers mean deeper analysis before the final answer

The result tends to be more accurate on complex problems: logical reasoning, analysis of multiple factors, decisions with non-obvious trade-offs. The cost: each layer burns additional tokens, so extended thinking uses significantly more than a direct answer.

On days when hitting the limit isn't a looming threat to my work, I've kept it on, since it improves results **significantly**. But it may be a setting to dial back later for less complex tasks if I need to.

---

## 5. KV Cache and Prompt Cache: what they are and why they matter

Two optimizations separate a well-built tool from one that merely calls the model's API:

**KV Cache** (Key-Value Cache) stores the intermediate weights computed while processing the prompt. Parts of the context that haven't changed don't have to be reprocessed from scratch for every response. The practical effect is faster execution.

**Prompt Cache** goes one step further: it persists the KV Cache across separate requests. When you restart a conversation but keep the same system context (CLAUDE.md, project instructions, settings), the Prompt Cache avoids reprocessing everything again. The result is token savings and lower latency.

A good AI tool offers both. When evaluating alternatives to Claude Code, or integrating the API directly into internal pipelines, I've started treating the availability of these features as a quality criterion.

---

## 6. The problem with large repositories

Claude Code doesn't load the entire repository into context. It uses **tool calling** to read files dynamically, and the model decides which files to look at as the problem demands. That's far more efficient than trying to "memorize" all the code up front.

But that doesn't eliminate the problem; it just moves it elsewhere.

Claude Code currently reads **2,000 lines at a time** by default. Larger files are truncated. In repositories with long files, entire sections can be skipped without the model flagging it. Results can vary from run to run on the same problem, not because the model is random, but because of differences in what was actually read. I picked this up, again, from Akita's post *[Clean Code for AI Agents](https://akitaonrails.com/2026/04/20/clean-code-para-agentes-de-ia/)* (in Portuguese).

The situation gets worse with Context Rot: the more files you read over a session, the bigger the context grows, and the more the quality of the analysis degrades.

When a repository is genuinely too large, one alternative is to index it in a vector database and retrieve only the relevant chunks before sending them to the model. There are tools that can do this natively.

A related and subtler question: when should you use RAG, and when shouldn't you? The answer isn't trivial, since the evolution of long contexts has changed part of the calculation. Akita has a post on exactly this that's worth reading: *[Is RAG dead? Long context](https://akitaonrails.com/2026/04/06/rag-esta-morto-contexto-longo)* (in Portuguese).

---

## 7. Security: new vectors, old problems

The first part of this post already mentioned that AI rarely suggests security protections you didn't explicitly ask for. During this period, the topic took on new dimensions.

### A controlled execution environment

The first practical point: **the agent needs a controlled environment to operate in**. Claude Code runs shell commands, reads and writes files, installs packages. Without restrictions, it has the same power as a careless developer with admin access.

Here are some practices I've started to consider and am studying as a *framework* that still needs validation:

- **AI Jail with a wrapper**: run Claude Code inside an isolated container with explicitly limited permissions. The [ai-jail](https://github.com/akitaonrails/ai-jail) repository documents a practical approach to this.
- **Bootstrapping settings with defined defaults**: explicitly configure which commands can run automatically, which need human approval and which are blocked. Claude Code supports this through `settings.json`.
- **Removing administrative privileges** from individual user accounts on development machines, which makes a centralized endpoint management setup feasible. It sounds obvious, but it's routinely ignored in day-to-day work.

One concrete case that came up in practice: **Claude Code started firing off encoded PowerShell commands that the EDR flagged as malicious**. It wasn't an attack. The model was trying to run legitimate operations in a way that the antivirus heuristics classified as suspicious behavior. The point is that without a controlled environment and visibility into what's being executed, you can't tell a false positive from a real problem.

### Context Poisoning: a new attack vector

One vector that's still rarely discussed, but has serious implications, is **context poisoning**.

The mechanism works like this: content that looks like an instruction, sitting in a file the model reads (such as the `CLAUDE.md` of a cloned repository), can be preserved by the context compaction mechanism as if it were "user feedback." The next model in the session then follows that instruction as if it were genuine, without questioning where it came from.

This isn't a simple **Prompt Injection**.

In practice, that means **cloning a compromised repository and running Claude Code inside it may be enough to inject malicious instructions** into the agent's session. The attack surface extends to the supply chain: a compromised dependency in `package.json`, for example, could carry instructions the model would follow while analyzing the project, such as exfiltrating data, changing configurations or executing arbitrary code.

The community is still mapping this vector, but that's already enough to justify a simple rule: **don't run Claude Code in third-party repositories without first reviewing the instruction files**, especially when the agent has broad permissions.

---

## 8. Costs, temperature and the effort parameter

Almost everything affects token consumption: the size of the prompt and the history, the number of files read through tool calling, the use of Extended Thinking, the size of the instruction documents, the model you choose and the session's configuration parameters. Understanding what each of these factors represents is what lets you manage consumption deliberately.

Two parameters deserve special attention:

**Temperature** controls the randomness of responses in API integrations and is also known as the *creativity parameter*. The scale runs from 0.0 to 1.0:
- **0.0 to 0.4**: deterministic, analytical, consistent responses. Ideal for technical analysis, code generation and tasks with a well-defined correct answer.
- **0.7 to 1.0**: more varied and creative responses. Useful for text generation, brainstorming and open-ended tasks.
- The **API default is 1.0**, which is high for most technical use cases.

In practice, I had consistency problems in technical analyses before I adjusted this parameter. For repeatable tasks where you expect consistent results, lowering temperature to the 0.2 to 0.3 range makes a real difference. In my case, while developing the project https://github.com/Gadotti/check-cve-assets, I ended up lowering it to 0.

**Effort** is a Claude Code parameter that controls how much the model invests in each task. The default is high, meaning the model uses the maximum resources available. For simple tasks or quick iterations where speed is the goal, lowering effort reduces token consumption without a significant impact on quality.

Worth mentioning, too: **the Spec Driven Development strategy documented in part 1 was validated in practice during this period**, on a larger feature: implementing authentication control in the https://github.com/Gadotti/MonitoringPanel project. Writing the spec first, before any line of code, meant less rework, less context rot from unnecessary iterations and better use of the tokens I spent. The cost is the time spent thinking before acting, which ends up being smaller than the cost of fixing things afterward.

---

## 9. Watch out for tool lock-in

One point worth raising before I wrap up: **the risk of lock-in**. With all the configuration that piles up, whether it's CLAUDE.md, skills, agents, commands or workflows tuned specifically for Claude Code, the barrier to switching tools grows over time.

That isn't necessarily a problem, but it's something to manage consciously. A few practices that help:

- Keep project specifications (specs, architecture, business rules) in tool-agnostic formats: plain Markdown instead of proprietary formats.
- Periodically evaluate whether your current tool is still the best option, given how fast the market changes.
- Build pipelines that are easy to redirect to another model or provider, especially in API integrations.

The speed at which new models and tools appear makes lock-in a more tangible risk than it seems at the start of a project.

---

## 10. The paradigm shift

Two fundamental changes I'm seeing in AI-assisted programming, both still unfolding:

**The agent as pilot, the human as co-pilot.** The initial narrative was that AI would be an assistant, the co-pilot helping the developer. What I see in practice is the opposite movement: the agent is the one driving the project. It executes, iterates, runs the tests and does the build. The human reviews, corrects course and defines the criteria and requirements. The trajectory points in that direction, and it's how I'm building my personal projects. The question this raises, *[Is VS Code the new punch card?](https://akitaonrails.com/2026/04/11/vs-code-e-o-novo-cartao-perfurado/)* (in Portuguese), is no longer merely provocative.

**Writing code for agents to read, not just humans.** The principles of Clean Code, TDD and SOLID have always existed to make code more readable and maintainable for people. Now they have a new dimension: poorly structured code, with huge files and badly defined responsibilities, **costs more tokens** for the agent to process, and may be processed incorrectly because of truncation. A 5,000-line file isn't just hard on the next developer; it's also hard on the agent that has to analyze and modify that code.

That's not a reason to abandon these principles. It's a reason to take them even more seriously. Small functions, cohesive files, well-defined responsibilities and, above all, **unit tests**. What has always been good practice now also has a direct financial impact, and one you notice sooner.

---

## Conclusion

Everything is happening very fast, and it's all exciting, uncomfortable, frightening, overwhelming and fascinating at the same time.

Not everyone needs to understand how the tool works under the hood, and I believe only a small share of people will even try. But knowing what goes into the context, how the model degrades in long sessions, where the reading limits are and what the emerging attack vectors look like is important knowledge for anyone who wants to create value, support and guide the effective use of this new stack.

There's a lot of noise around this topic, and there will be no shortage of click chasers and course peddlers. That's why building a solid foundation of understanding, and learning to separate what really matters from the rest, is so important, especially since our time is limited.

---

## References

### Videos
- [FABIO AKITA - Flow 588](https://www.youtube.com/live/4c7pbOxYn_A?si=MzSymFdQh9ajk8sT)
- [mano deyvin - O VSCode morreu](https://youtu.be/J82ceZ0IUiQ?si=OfQfVVFAyiZ1kir2)

### Fabio Akita
- [Clean Code for AI Agents](https://akitaonrails.com/2026/04/20/clean-code-para-agentes-de-ia/) (in Portuguese)
- [Is VS Code the new punch card?](https://akitaonrails.com/2026/04/11/vs-code-e-o-novo-cartao-perfurado/) (in Portuguese)
- [Is RAG dead? Long context](https://akitaonrails.com/2026/04/06/rag-esta-morto-contexto-longo) (in Portuguese)

### Repositories
- [AI-Jail: running Claude Code securely in a container](https://github.com/akitaonrails/ai-jail)
- [Painel42 - Security event monitoring solution](https://github.com/Gadotti/MonitoringPanel)
- [Check CVE Assets - Python script for AI-integrated CVE checking](https://github.com/Gadotti/check-cve-assets)

### Tools
- [Claude Design](https://claude.ai/design)
- [Cursor](https://cursor.so/)
- [Windsurf](https://codeium.com/windsurf)
