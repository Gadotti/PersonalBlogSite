---
title: "A $10 knowledge base: How I used AI to study, decide and measure - Part 1"
date: 2026-10-26 10:00:00
tags: ["ia","security"]
translation_key: base-de-conhecimento-com-10-dolares
translated_by: ai-reviewed
---

*How did I build the foundation of a RAG system to power customer support, structuring a knowledge base and a retrieval layer on top of a legacy ticketing system, with hybrid semantic search over nearly 90,000 tickets and more than 2,000,000 messages, for just over $10.00?*

---

## Contents

- [Introduction](#Introduction)
- [Study first, code later](#Study-first-code-later)
- [The method: decisions in writing](#The-method-decisions-in-writing)
- [The architecture](#The-architecture)
  - [The layers and the flow](#The-layers-and-the-flow)
  - [The stack](#The-stack)
  - [Full load, incremental runs and deployment](#Full-load-incremental-runs-and-deployment)
- [Key decisions](#Key-decisions)
  - [1. The AI never reads the source system](#1-The-AI-never-reads-the-source-system)
  - [2. Apply the rules first. The LLM comes later](#2-Apply-the-rules-first-The-LLM-comes-later)
  - [3. How to find and remove personal data](#3-How-to-find-and-remove-personal-data)
  - [4. Nobody is going to review the past](#4-Nobody-is-going-to-review-the-past)
  - [5. Defining the answer key](#5-Defining-the-answer-key)
  - [6. Choosing the database](#6-Choosing-the-database)
- [Inside PostgreSQL](#Inside-PostgreSQL)
  - [Keyword search](#Keyword-search)
  - [pgvector and the HNSW index](#pgvector-and-the-HNSW-index)
  - [The production search](#The-production-search)
- [The AI as auditor](#The-AI-as-auditor)
- [A critical detail for effectiveness](#A-critical-detail-for-effectiveness)
  - [Across the full history](#Across-the-full-history)
- [I forgot something important and had to redo everything](#I-forgot-something-important-and-had-to-redo-everything)
- [The proof of concept](#The-proof-of-concept)
- [The $10 bill](#The-10-bill)
- [Coming up next](#Coming-up-next)
- [Conclusion](#Conclusion)
- [A note about this post](#A-note-about-this-post)
- [References](#References)

---

## Introduction

The starting point is something valuable that almost every company has: years and years of accumulated message history in tickets. Those messages often already document how known, similar problems were solved when a customer reported something. The hard part is finding that solution in the middle of so much information.

In its first stage, the project's idea is a support AI that, given a new ticket, suggests possible problems and solutions to the support agent, based on knowledge extracted from similar tickets that were already resolved, with the source cited. The big challenge, before any AI, is a far less glamorous problem: **the history isn't ready to be read by an AI**. This is a case study of a large, old transactional database, with customer names, email addresses, phone numbers, CPFs (Brazilian individual taxpayer IDs), passwords and connection details pasted in the middle of the text, plus plenty of automated messages, signatures and "good morning"s that help no one.

This post covers the first part, the knowledge base (cleaning, de-identification and search), and above all **how I used AI to study the subject, make the decisions and measure the results**, in about three weeks and for roughly $10.

> **About the details:** the project is a real *case study*. That's why system names, the source database structure, exact volumes and any text samples are left out or appear only in generic form. The structure of the knowledge base, which is what matters here, is described in full. The examples below are made up.

---

## Study first, code later

Given the goal and the constraints, namely LGPD (Brazil's General Data Protection Law), ISO 27001 and isolation between customers, I set out to learn how people who had done something similar solved comparable problems. The strategy was to use AI as a **study partner**, and the first step was asking it for a survey of public sources on preparing a ticket database for AI. I didn't read every piece of material it gathered, but I attached it to the project as a foundation and a guide, so the AI would anchor itself on the right premises for this context. The references that ended up shaping the project were:

- LinkedIn's paper on RAG with a knowledge graph built from customer service tickets, published at SIGIR 2024.
- The Consortium for Service Innovation's material on KCS (Knowledge-Centered Service), which treats knowledge as a byproduct of support work.
- Anthropic's *Contextual Retrieval* and Uber's agentic RAG, on why a retrieved chunk of text needs to carry its context.
- RAGAS and the studies on LLM-as-a-judge, to think about evaluation from the start.
- MTEB-BR, a benchmark of embedding models in Portuguese.
- The guides from the ANPD (Brazil's National Data Protection Authority) on anonymization and pseudonymization.

To me, security is and always has been non-negotiable, so from day zero I made the security of the data being processed a premise, not only because of the risk of leaks but also because of compliance and the terms of use governing the collected data. This isn't a whim: it's about complying with the **LGPD**, so personal data such as "Jane Doe" would need to be replaced with `[CUSTOMER]`, for example, to reduce the risk.

So the project's first decision came out of this study: **the data had to be cleaned**. No AI capability would be specified until the database was defined, cleaned and measured, because its quality decides everything that comes after.

---

## The method: decisions in writing

The idea was to work from specifications, with no magic solution or method from this month's hype: the specifications were simply laid out before anything was executed, with a review at every step. I kept everything in one plain file, `decisoes.md` ("decisions").

Each decision gets an ID, a date, what was decided, **why**, and the consequence. After three weeks I had a log of 46 decisions that serve as memory for the AI working on the project. Questions I couldn't answer yet go in a separate file.

Two rules in the file are worth highlighting:

- A closed decision isn't reopened without a new decision stating why.
- A reverted decision isn't deleted. It gets a "reverted on" mark and points to the one that replaced it.

A real example: one day I decided that the layer holding the original text would be emptied at the end of each run, so no sensitive text would sit idle in the database. That same day I realized I needed it to recompute corpus statistics without rereading the source system every time a rule changed. I reverted the decision and addressed the original concern another way: **secrets come out before anything is written**. Both decisions are still in the file, and anyone reading it can follow the path.

When working with AI, this makes a big difference: in every session the agent rereads the decisions and doesn't reopen what's already settled, so the context gets smaller and the conversation more focused. It also puts on record that **I'm the one who decides**: the AI recommends and compares alternatives, and each decision in the file says who made it.

The project's `AGENTS.md` rounds this out with a section of hard rules that apply to everything:

1. No real data in the repository. Tests use **made-up** text.
2. No credentials in the repository.
3. Logs never record ticket text, only IDs, counts, timings and reason codes.
4. The encrypted portion of the source system is never decrypted.
5. Security findings don't go into the code or the docs; they go to the InfoSec team.

---

## The architecture

[![Architecture: the ticketing system is only read, the text flows through the bruto, limpo and pronto layers in PostgreSQL, and only text from pronto goes to the embedding API](/imgs/base-de-conhecimento/arquitetura-en.svg)](/imgs/base-de-conhecimento/arquitetura-en.svg)

*The path the text takes, from the source to the AI. Highlighted: the layer the AI reads and the only point where anything leaves the company.*

There are three elements:
* the source ticketing system, which the program only reads;
* a PostgreSQL database with four schemas; 
* the embedding API, which sits outside the company and only receives text that's already clean.

### The layers and the flow

- **`bruto`** (raw) is a copy of the in-scope slice: customer tickets that are closed and not confidential, from a cutoff date onward. The date came from the citations between tickets themselves, which showed that nearly all real reuse points to tickets up to five years old. The text already arrives free of secrets, because normalization (R2) and secret removal (R5) run during extraction. Personal data stays, so de-identification can be redone when the rules change, and that's why only the job and the DBA can access this layer.
- **`limpo`** (clean) is the output of the routines. Each message has its action (kept or discarded), the reasons and the author's role; each ticket has metadata, links and its confidence tier. This is the layer that gets audited to evaluate how effective the cleaning is.
- **`pronto`** (ready) is what the AI reads: the search text with its keyword index and the chunk vectors. It's built only from `limpo`, never from `bruto`.
- **`controle`** (control) stores the high-water mark, the runs, the state of each ticket (when it was extracted, cleaned and indexed, and with which version of the rules) and the history of every cleaning **without text**: only the action, the reasons and a 64-bit hash of the cleaned text. You can tell what changed from one run to the next without keeping yet another copy of the data.

### The stack

| Component | What I used | Why |
|---|---|---|
| Program | Python 3.12, command line with `argparse` | Standard library first; new dependencies only with a clear gain, with version and license checked |
| Reading the source | `pyodbc`, with a read-only login | The program never changes the source system |
| Knowledge base database | PostgreSQL 18 with `pgvector` 0.8.7 and `unaccent` | Keywords, vectors, links and JSON in a single database |
| Database access | `psycopg` 3 | `COPY` for bulk loading |
| Personal data | In-house rules, `pyahocorasick` and spaCy `pt_core_news_md` | Detailed in decision 3, below |
| Vectors | OpenAI embedding API, called with `urllib` | A single endpoint doesn't justify an SDK |
| Tests | `unittest`, with made-up text | No real data in the repository |

### Full load, incremental runs and deployment

The initial load reads the in-scope slice in batches by ID range, and day-to-day operation was designed to be incremental. Extraction reads only the tickets that changed since the last checkpoint. A ticket that falls out of scope, because it was reopened or marked confidential, is removed from the layers too. And when the rules version changes, cleaning is redone from `bruto`, without going back to the source and therefore without reprocessing everything from scratch.

Security comes into play again here: the structure lets the daily job use a different, read-only login, so it can never change anything in the source database, even if that access is compromised.

On the server, the process is started by a single command that:

1. checks the configuration, looking only at whether the variables exist and never at their values;
2. restricts the permissions on `.env` to the account running it;
3. tests the connections, including the API one, so a wrong key shows up before the hours of loading rather than at the end;
4. runs the load checkpointing each step, so running it again resumes from the step that failed.

---

## Key decisions

### 1. The AI never reads the source system

The support AI will query a separate, clean, de-identified database that is fed asynchronously, and never the production database at runtime. This is the decision behind the architecture layers above, where each one has its own access level and can be rebuilt from the previous one.

### 2. Apply the rules first. The LLM comes later

This decision explains a good part of the $10: everything that can be done with rules is done with rules, **deterministically**, because it's cheap, fast and auditable, and the result is repeatable. The whole process has between 10 and 20 routines, and only one of them actually uses an LLM, which is what generates cost.

Each routine is a pure function with no database access, which makes it possible to test everything with made-up text. This matters a lot, because it gives the project its own automated unit test coverage, keeping things consistent across changes and improving maintainability.

The order of the routines was also deliberate, and it matters:

- **Secrets come out right after text normalization**, before any other step, log or debugging session can see them.
- **Personal data comes out before template message detection.** Once the name is replaced with a placeholder, the same automated reminder sent to different customers becomes the same text, and the template catalog recognizes it.
- Greetings, sign-offs, signatures and footers come out afterward, only from what's left.

[![Order of the cleaning routines: per message R2, R5, R6a, R6b, R3, R6c, R4 and R7; per ticket R8, R9, R10, R11 and the R13 index](/imgs/base-de-conhecimento/limpeza-en.svg)](/imgs/base-de-conhecimento/limpeza-en.svg)

*The order of the routines. The first two already run during extraction, and the bottom row works on the whole ticket. R8 (attachments) is still pending, for an upcoming stage that's being planned.*

### 3. How to find and remove personal data

De-identification ended up in three layers:

- **Rules with check digits** for CPF, CNPJ (Brazilian company tax ID) and court case numbers, plus email, phone, IP and login.
- **The system's own people registry** as a name dictionary, all searched in a single pass with the Aho-Corasick algorithm (`pyahocorasick`). The placeholder states the person's role, `[CUSTOMER]` or `[AGENT]`, so the text still makes sense.
- **Named entity recognition with spaCy** for names that aren't in the registry.

Amid the back-and-forth of the evaluation prompts, the agent itself recognized there was a shortcut. To recognize people's names in Portuguese, the tool I was planning to use (Microsoft's Presidio, which I documented in the [playbook](/en/2026/10/05/ai-security-playbook/)) simply handed the work off to another one, **spaCy**. Using *Presidio* in this context would have meant installing 31 more packages just to have a middleman for finding CPFs, emails and phone numbers, when the project's scripts already did that on their own. So the decision was to use **spaCy** directly.

**spaCy** offers models in different sizes, so the agent compared the medium one, at 42 MB, with the large one, at 568 MB. On a 0-to-1 score that measures detection quality, the large model scored *0.903* and the medium *0.896*. The difference is far too small to justify a file 13 times larger, so I went with the medium model, which delivers enough.

### 4. Nobody is going to review the past

In the real world, it isn't feasible or practical to have humans review the entire history that will serve as the learning base, and the solution still had to work with the past as it is.

The way out was to use **signals the system already records** to split tickets into three confidence tiers:

| Tier | Rule | Use |
|---|---|---|
| **A** | Solution marked and written down, not reopened, customer replied | Can appear as a suggested solution, with the source |
| **B** | Solution marked, but reopened, no reply from the customer, or "see attached" / "by phone" | Appears as a similar case, to be verified |
| **C** | No solution marked | Only indicates the problem has happened before |

Human review now happens during use, with a "helped / didn't help" rating. And the more the support agents improve their records from now on, noting in the history whether and how the problem was solved, the better the quality this solution will deliver as time goes by.

### 5. Defining the answer key

To measure whether search works, we needed a calibration answer key that says, for each question, what the right answer is. Building it by hand would take someone labeling pair after pair, and once again, doing that for the entire history of the database isn't feasible.

The idea was to rely on behaviors that point to a solution relationship. For example, when someone writes "see ticket 123456" in a message, they're potentially saying that the old ticket is the answer to the current one. Each citation between tickets became a pair in the answer key. It cost nothing, required no labeling, and reflects reuse that actually happened.

### 6. Choosing the database

The database I chose was PostgreSQL with the **pgvector** extension, and the main reason is keeping everything in one place. The same database handles search by meaning (vectors) and Portuguese keyword search, stores the links between tickets and also offers a flexible JSON field for data with no fixed format. That way there was no need to maintain a separate vector database, with its own server, backups, monitoring and security. Fewer parts means fewer things to operate and fewer points of failure.

The "annoying" part is that **pgvector** only publishes source code and has no prebuilt binary for Windows, which was the server available. The fix was to compile the extension locally, against *PostgreSQL 18*, with the Visual Studio compiler. It was extra work, but done only once. In exchange, we got the extension running on the database that already existed, without standing up a second infrastructure just for this.

---

## Inside PostgreSQL

[![The pronto schema: pronto.fio with tsvector and a GIN index, pronto.vetor with a partial expression HNSW index, pronto.radical and the search functions](/imgs/base-de-conhecimento/esquema-pronto-en.svg)](/imgs/base-de-conhecimento/esquema-pronto-en.svg)

*The layer the AI reads: a table with one row per ticket for keyword search, one with a row per chunk for vectors, the stem counts and the search functions.*

### Keyword search

`pronto.fio` (*fio* means thread) has one row per ticket, with the title, the search text and the filter columns (customer, date, tier, category, subject, module and version). The search text is the description plus the kept, **non-internal** messages: internal messages can't be the basis for an answer to the customer, and discarded messages only get in the way of search. The cleaning placeholders (`[CUSTOMER]`, `[EMAIL]`) are also stripped from this text because, repeated in every ticket, they would only pull together cases that have nothing in common.

The `tsv` column is generated by the database itself (`GENERATED ALWAYS AS ... STORED`), with weight "A" for the title and "B" for the rest, and has a GIN index. It goes through the `pronto.lexemas` function, which holds a tweak for unaccented Portuguese. PostgreSQL's Portuguese stemmer only recognizes the accented suffix and doesn't merge "-ão" with "-ões", and support tickets are full of "solucao" and "configuracao" (*solution* and *configuration* typed without accents). Before stemming, the function puts the accent back on the ending and turns the "-ões" plural into "-ão"; then the `unaccent` extension strips the accent from the stem. That way "solução", "soluções", "solucao" and "solucoes" all end up as `soluca`.

The query (`pronto.consulta`) turns the question into an OR across all of its stems, and the ranking comes from `ts_rank`, normalized by document length.

### pgvector and the HNSW index

`pronto.vetor` has one row per chunk, keyed by (ticket, model, dimensions, representation, order). The column is of type `vector` with no fixed dimension, which let me keep models, dimensions and representations side by side during the evaluation. Cascading deletes remove the vectors when a ticket leaves `pronto.fio`.

And here, the detail that saved API calls was the `text-embedding-3-large` model, which concentrates the most important information at the start of the vector. With made-up text, the 3,072-dimension vector truncated to 1,024 had a cosine of 1.0 against the vector requested from the API directly at 1,024. So a single vectorization run was enough to measure 3,072, 1,024 and 256 dimensions, truncating the vector with `subvector` right in SQL.

The `resumo` (digest) column stores the md5 of the text that was sent. During vectorization, a chunk with the same digest in the same position isn't sent to the API again: if a ticket gets a new message, only the last chunk changes.

The index:

```sql
CREATE INDEX vetor_hnsw_large_1024_trecho1000 ON pronto.vetor
  USING hnsw ((vetor::vector(1024)) vector_cosine_ops)
  WHERE modelo = 'text-embedding-3-large'
    AND dimensoes = 1024
    AND forma = 'trecho1000';
```

- **It's an expression index** because the column doesn't fix the dimension, and the index needs one. On top of that, pgvector's `vector` type only indexes up to 2,000 dimensions, so 3,072 wouldn't even fit.
- **It's partial** because only the production configuration needs an index. The query filter has to be a literal, identical to the index's. With a parameter, the planner can't prove the row is in the partial index and won't use it.
- **The graph parameters are the defaults** (`m` 16, `ef_construction` 64). At search time, `hnsw.ef_search` goes up from 40 to 100. With a filter (by date, for example), pgvector 0.8's iterative scan (`hnsw.iterative_scan`) keeps walking the graph until it finds the requested chunks.
- **The index should be built in one go**, after the load, with `maintenance_work_mem` at 1 GB for that transaction only, because when the graph doesn't fit in memory the build gets many times slower. During the full load, the index from the sample measurement was still in the database and received the vectors one by one, which probably explains part of the 11 hours of vectorization.

### The production search

[![Production search: the question is cleaned and goes by keyword (GIN index) and by meaning (HNSW index); the two lists of 50 are merged with RRF and the top 5 go to the support agent](/imgs/base-de-conhecimento/busca-hibrida-en.svg)](/imgs/base-de-conhecimento/busca-hibrida-en.svg)

*The path from a new ticket to the five suggestions. Highlighted: the point where data leaves the company and the merging of the two lists.*

The question goes through the same cleaning as the knowledge base, up to the links (R9), before any search. If the new ticket didn't go through the same rules, it and the index would be in different formats, and search would get worse. After that, it follows two paths, and each one returns 50 tickets:

- **By keyword**, the `pronto.buscar_palavra` function picks candidates by the rarest stems in the question (the `pronto.radical` table says how many tickets each stem appears in) and ranks them by the `ts_rank` of the whole question. The reason for using the rare stems comes further down, in [Across the full history](#Across-the-full-history).
- **By meaning**, the cleaned question goes to the embedding API, and the HNSW index brings back the 500 nearest chunks, 10 per requested ticket. Each ticket counts by its nearest chunk.

The two lists are merged with RRF (*Reciprocal Rank Fusion*): each ticket adds up 1/(60 + rank) for every list it appears in. Whatever does well on both rises, and there's no need to compare the `ts_rank` score with the cosine distance, which are on different scales.

---

## The AI as auditor

Regular expressions don't show you false positives or names missing from the registry. To know whether the cleaning works, **someone has to read the text** and validate it. Once again, we ran into the fact that doing this manually isn't feasible.

To help with the audit, a dedicated AI agent with a cleaning-auditor profile was set up to run in parallel. It reads the already-cleaned text of a sample, always through a command of the program itself (never the layer with the original text), and flags, routine by routine, four kinds of error: leakage (data that should have been removed and wasn't), false positive (a placeholder where there was no data), loss (useful technical content that disappeared) and wrong role (a support agent tagged as a customer, for example).

To keep the premise of preventing leaks of information and personal data, **the agent's report can't become yet another copy of real data**. It never reproduces what it found, only its shape: `FirstName(5) LastName(7)`, `a***@d***.com.br`, `999.999.999-99`. And it suggests the fix with a made-up example that reproduces the pattern, ready to become a test.

The cycle was: run the sample, audit it, I decide what to fix, fix it with a test, and run it again. There were dozens of runs. 

Two numbers give you an idea:
- The first version of name recognition was right on less than 2% of what it flagged, because it mistook stack trace identifiers, XML tags and payroll item names for people. After three rounds of filters, it was above 40%.
- In the validation with 50 tickets no rule had seen, wrongful discards stood at 0.67%, within the target of under 2%. But 2.5% of the texts still had some leak, almost all in formats no rule anticipated. Each one became a new rule plus a test, steadily maturing the coverage.

It's *important* to point out that auditing with AI means sending the text, already cleaned, to the model provider, and *acknowledging* that the cleaning isn't perfect and never will be. That's why the layer access controls and sample-based auditing stay in place even with good numbers.

---

## A critical detail for effectiveness

With the citation answer key in place, every change to search started being measured. The metrics are hits among the top results and MRR (*Mean Reciprocal Rank*), which awards more points the closer to the top the right answer appears.

The first vector measurement was a cold shower: **vector search alone lost to keyword search with every model tested**. Analyzing the misses, the AI found that the vector failed when the cited ticket had a long history, tens of thousands of characters. A single vector for the whole ticket blends all of its subjects, while the question is short.

So **the bottleneck was how the ticket was represented, not the model**. The strategy was to cut the history into chunks of up to a thousand characters, each with the title in front, and the ticket started counting by the chunk closest to the question. Then the keyword search list was combined with the vector list through RRF, as in the production search described above.

[![On the left, a single vector for a long ticket lands on the average of its subjects, far from the question; on the right, the ticket is cut into chunks and counts by its nearest chunk](/imgs/base-de-conhecimento/vetor-por-trecho-en.svg)](/imgs/base-de-conhecimento/vetor-por-trecho-en.svg)

*The change that made vectors work: with one vector per chunk, the short question finds the chunk that deals with the same subject.*

| Search | Hits at #1 | Hits in top 5 | MRR |
|---|---|---|---|
| Keyword | 15 | 24 | 0.550 |
| Vector, one per ticket | 11 | 18 | 0.410 |
| Vector, per 1,000-character chunk | 15 | 25 | 0.559 |
| **Hybrid, per 1,000-character chunk** | **19** | **27** | **0.644** |

*35 answer-key pairs, `text-embedding-3-large` model with 1,024 dimensions.*

With 35 pairs, each pair is worth almost 3 percentage points. The differences between models (`small` or `large`), dimensions (512, 1,024 or 3,072) and chunk sizes were within the noise. Switching from a single vector to chunks with hybrid search was a big enough jump for me to trust it; the rest was left for the measurement on the full history, further down.

As for the *embedding* model, the research showed an open model tied with the best commercial one for Portuguese, which would have allowed vectorizing in-house, but internal policy ruled it out. The alternative was **OpenAI**'s *embedding* API, which doesn't require a GPU server. Only text from the `pronto` layer, already cleaned, goes to the API, and the terms of use (data sent isn't used to train models, there's retention for abuse monitoring, and there's a zero-retention option) were checked and validated before the full load.

I also measured *pgvector*'s HNSW index, which is approximate. Instead of comparing the question with every chunk, it walks a graph of neighbors. On the sample, it returned 100% of the exact search results, but with just over a thousand chunks that didn't say much.

---

### Across the full history

As for the timing of the first runs, the initial load took about 45 hours, and the cleaning alone took almost 27 of them.

With the database fully loaded, I redid the measurement with 100 questions randomly drawn from the answer key. The numbers dropped quite a bit:

| Search | Hit at #1 | Hit in top 5 | Hit in top 10 | MRR |
|---|---|---|---|---|
| Keyword | 18% | 26% | 34% | 0.222 |
| Chunk vectors, via the HNSW index | 19% | 28% | 35% | 0.229 |
| **Hybrid via the HNSW index (the production one)** | **14%** | **32%** | **41%** | **0.213** |

*100 questions and 130 answer-key pairs, against the full history.*

The score dropped on the full history for two reasons:

1. The competition got much tougher. In the test sample, each question competed with only 233 tickets to be found; across the full history, there are hundreds of times more. It's like finding one person in a room of 233 people and then in a packed stadium: the same search method misses more, because there are many more similar candidates.
2. The answer key accepts a single ticket as correct, the one actually cited in the reply. If search returns another, very similar ticket that would also help the support agent, it counts as a miss. The score penalizes results that would be useful in practice.

*So I started using this score only to compare one search against another (which one finds things better, under the same conditions); it doesn't measure how good the solution is for the support agent.*

The hybrid wins in the top 5 and top 10 and loses at #1. Since the idea is to show the support agent a list of suggestions, the top 5 matter more. The HNSW index returned 98.2% of the exact search's top 10 and was validated.

The nasty surprise was time: keyword search (instant on the sample) took 16 to 98 seconds per question on the full history. The main cause was a driver detail: *psycopg* prepares queries that repeat, and past a certain point *PostgreSQL* switches to a generic plan, which recomputes the question's query against every single ticket. The same question took **2.7s with the custom plan** and **32s with the generic one**. The fix was to turn off preparation in the driver (`prepare=False`) and build the query inside `pronto.buscar_palavra` with `EXECUTE`, which in PL/pgSQL plans on every call, with the actual values. That solved a good part of the problem, with identical results, ticket by ticket.

To get below the ~3 s that remained, search started picking candidates by the rarest stems in the question, until they added up to 2,000 tickets, and only then ranking them by the whole question. In the first random draw, besides dropping to **0.43s**, accuracy even went up. But I repeated it with another draw and the improvement didn't hold up; adding both rounds together, it was a tie. So the change was adopted for the speed, from about 3 seconds to about 0.4 with the same quality, and not for the gain it seemed to show in the first draw.

Finally, memory. PostgreSQL was running with the installation's default `shared_buffers` (128 MB), and the vector index is 2.8 GB. A script raised `shared_buffers` to 1/4 of the memory and `effective_cache_size` to half, saved the previous configuration, restarted the service and measured before and after: one of the index searches went from **25s** to **0.14s**. One slow case remains, a search with a filter that discards almost everything, which today only shows up in measurements but will surface once search starts filtering by customer.

---

## I forgot something important and had to redo everything

During validation, another detail came up that changed how the numbers should be read: support agents often rewrite the problem description in more detail, and that version becomes the official one. The complaint from whoever opened the ticket remains only in the change history, and I hadn't taken that into account at first.

Counting in the history (counts and sizes only, without reading any text), about 1 in 5 tickets has a rewritten description, and the official version is on average three times as long as the original, from about 500 to about 1,500 characters. So the answer key was asking with a richer description than a new ticket would have, since a new ticket arrives as the raw complaint. In one out of five cases, the measurement could have been optimistic.

So I started storing both versions and measured again, asking with the original, and the suspicion didn't hold up. The short complaint hit a bit more often at the top (26 vs. 20 at #1, out of 160 pairs), because the long description spreads the search across generic words. With each pair worth 0.6 points, it's a hint, not proof, but it showed that the yardstick itself needs measuring too.

Customer complaints tend to contain more personal data than agent text, so the original only goes to the API after being audited. The auditor read 50 randomly drawn originals and found one with personal data: a cell phone number written with only spaces, in a format no rule covered. It became a rule, and the decision was to clean the whole database again. Since each chunk stores the hash of its text, vectorization only resends what changed.

---

## The proof of concept

With the database loaded and measured, the decision was to see the system working before turning on daily processing. The proof of concept takes tickets that are still open, which are new problems for the knowledge base (it only has closed ones), cleans each question with the same rules and returns the five most similar cases, with the recorded solution and the chunk closest to the question.

For a first pass over the 100 suggestions, I created one more subagent, `avaliador-suporte` ("support evaluator"). It plays the role of a support specialist who reads only the report and marks each suggestion as Y (would solve it), P (would partly help) or N (wouldn't help), with a short justification. With 20 open tickets and 5 suggestions each:

- 13 Y suggestions, 23 P and 64 N;
- 15 of the 20 tickets had at least one Y or P suggestion.

The agent's criterion is strict ("would it solve it?" and, when in doubt, N), and the result counts as a preliminary assessment. The LLM-as-a-judge studies I read at the start recommend calibrating the judge against a human expert's labels before trusting it at scale, and that's the next step.

Where the tool still falls short:

1. New problems, since the tool learns from old tickets. When the cause is new and has never appeared in the history, there's nothing similar for it to look up, and the suggestion tends to be wrong.

2. Along with each suggestion, the tool reports how confident it is (low, medium, high). The idea is for the support agent to know when to trust it and when to be skeptical. But that signal doesn't always match the result. In one case, it reported "medium to high" confidence and got it wrong. In another, it reported "low" confidence and got it right. For now, support agents shouldn't use this indicator as their only criterion.

3. The sample is small, since these conclusions come from only 9 tickets. That's too little to draw a definitive rule; the results point in a direction but don't settle the matter. To improve accuracy, all it takes is continuing the test with more cases.

---

## The $10 bill

| Item | Cost |
|---|---|
| Study, specification and coding with AI | The subscription I already use day to day |
| PostgreSQL | Equivalent open source license |
| pgvector, spaCy, pyahocorasick, psycopg | Open source |
| Vectors via the OpenAI API | **About $10** |

The initial estimate, based on the sample, was about 100 million tokens, up to $15 at the `text-embedding-3-large` list price. The full load used 79.2 million tokens, about $10 at the same price, with no text truncated by the API.

The low cost comes from a handful of decisions adding up:

- Rules instead of an LLM in 12 of the 13 routines, and the whole cleaning runs in-house, with no paid calls.
- Only embeddings go to the API, which is by far the cheapest kind of call.
- The text sent is already lean, with no automated messages, repeated templates, greetings or signatures.
- Text that hasn't changed isn't sent again. Each vector stores the hash of the text sent, and daily processing only sends what's new or changed.
- The API client uses Python's standard library, no SDK, with retries on transient errors. That's one less dependency to audit.

---

## Coming up next

- Daily processing. The database stays as the full load left it until the proof of concept wraps up.
- Drafting the suggestion with an LLM inside the system depends on decisions that are still open.
- The case card and OCR reading of attachments haven't been implemented yet.
- The LLM judge still needs to be calibrated against human labels, and the comparison has only 9 tickets.
- Search with a very selective filter is still slow on the current disk.

---

## Conclusion

AI helped a lot with the research, comparing alternatives, checking problems and execution. But the decisions that made the project work came from questions I had to know how to ask. What does the LGPD say about pseudonymized data? Who's going to review the past? How do I know search works? Why is the vector losing to keywords? Is performance good enough?

AI amplifies what each of us knows; it didn't know the constraints of my context until I wrote them down. Once I knew what I wanted, it implemented, tested and audited at a speed I couldn't have managed on my own.

Measuring also served to correct my own readings: the time estimate came in about three times lower than reality, the gain from the first draw vanished in the second, and the suspicion that the answer key was optimistic needed a measurement of its own to be ruled out.

As for cost, I'd venture that a good chunk of the AI spending out there comes from using an LLM where a regular expression would do. Here it was rules first, models only where rules can't reach, and measurement at every change, and so not only did the bill come to $10, but the solution as a whole ended up optimized.

It's about understanding and separating what is deterministic processing from what isn't.

---

## A note about this post

I didn't write this post to sound like an expert on the subject, and I'm not one. My goal was to describe the path I took: with the help of AI and an understanding of a few basic premises, I was able to find my way to building this. The project structure and the more technical explanations here are part of that path and were built with that support. The groundwork for this post was also written with the help of AI, based on the project itself (recorded decisions, code, measurements and reports), and then reviewed and adjusted by me. There may be debatable choices, simplifications and better approaches I'm not aware of.

---

## References

### Related posts
- [AI everywhere: Theories, lessons and vibe coding](/en/2026/04/05/ai-everywhere-theories-lessons-and-vibe-coding/)
- [AI everywhere: Theories, lessons and vibe coding - Pt. 2](/en/2026/04/25/ai-everywhere-theories-lessons-and-vibe-coding-pt-2/)
- [AI Security Playbook](/en/2026/10/05/ai-security-playbook/)

### Studies and articles
- [Xu et al. (LinkedIn), Retrieval-Augmented Generation with Knowledge Graphs for Customer Service Question Answering](https://arxiv.org/abs/2404.17723)
- [Knowledge-Centered Success Practices Guide](https://library.serviceinnovation.org/KCS/Knowledge-Centered_Success_Practices_Guide)
- [Anthropic, Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [Uber, Enhanced Agentic RAG](https://www.uber.com/us/en/blog/enhanced-agentic-rag/)
- [RAGAS, arXiv 2309.15217](https://arxiv.org/abs/2309.15217)
- [Zheng et al., Judging LLM-as-a-judge](https://arxiv.org/abs/2306.05685)
- [MTEB-BR, arXiv 2607.04581](https://arxiv.org/html/2607.04581v2)

### LGPD
- [Law No. 13,709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ANPD, technical guidance documents](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos)

### Tools
- [pgvector](https://github.com/pgvector/pgvector)
- [spaCy, Portuguese models](https://spacy.io/models/pt)
- [pyahocorasick](https://github.com/WojciechMula/pyahocorasick)
- [Microsoft Presidio](https://github.com/microsoft/presidio)
- [OpenAI, embeddings guide](https://platform.openai.com/docs/guides/embeddings)
