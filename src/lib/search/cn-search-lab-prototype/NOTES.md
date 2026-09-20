# Prototype verdict

Question: does section-level data fix the observed CN API/property ranking
problem before changing engines, and can the resulting corpus remain small
enough for client-side Orama?

Status: Orama granularity, compaction, typo tolerance, and Node-scale benchmark
complete.

## Corpus

The deterministic sample contained 342 real CN pages. The complete CN content
tree contained 6,702 source files, which became 6,701 canonical public pages
after duplicate URL removal.

| Shape | Records | JSON | gzip |
| --- | ---: | ---: | ---: |
| Page | 6,701 | 28.2 MiB | 5.4 MiB |
| Every heading | 81,549 | 67.2 MiB | 8.0 MiB |
| Compact sections | 47,710 | 50.3 MiB | 7.2 MiB |

The compacting rule keeps H1/H2 and API-like identifiers as records. Short or
generic deeper headings such as “参数” and “返回值” are merged into their
nearest retained parent.

## Search quality

Full-corpus Golden Query results:

| Query group | Page | Every heading | Compact | Compact + typo fallback |
| --- | ---: | ---: | ---: | ---: |
| Exact API/property, target Top 1 | not measurable by anchor | 5/5 | 5/5 | not applied |
| Product/document term, target Top 1 | 2/3 | 2/3 | 2/3 | not applied |
| Misspelled API, target Top 1 | 0/2 | 1/2 | 1/2 | 2/2 |
| Chinese description mapped to an English API, target Top 1 | 0/5 | 0/5 | 0/5 | not applied |

Examples:

- `manualSOS`: page search did not put the target API page in Top 3; both
  section shapes put a valid `#manualsos` API section at Top 1.
- `removeHandler`: page search ranked other pages above the API definition;
  both section shapes ranked a valid `#removehandler` section at Top 1.
- `removeHandlr`: normal section search missed; compact Orama with
  `tolerance: 1` put the target at Top 1. Typo tolerance should be a fallback,
  not a global setting.
- `移除事件处理器`: none of the keyword variants understood that the Chinese
  phrase refers to `removeHandler`.

## Compaction result

Compaction reduced records by about 41% while preserving all Golden Query
results. It also:

- reduced sections with at most 120 content characters from 51,350 to 17,940;
- reduced generic-title records from 31,367 to 3,766;
- reduced measured Node search p95 from about 637 ms to 339 ms.

The all-heading payload was 8.0 MiB gzip and the compact payload was still 7.2
MiB gzip. The relatively small compressed-size improvement means document body
text, not only duplicated metadata, dominates transfer size.

## Verdict

For exact API/property ranking, replacing Orama is not justified. The effective
changes are section boundaries, section-title weighting, and targeted typo
tolerance.

Mechanically indexing every heading is also not justified. The compact shape
is the better candidate because it removes most low-value fragments without
reducing measured relevance.

Neither section shape solves semantic intent. Switching keyword engines alone
is not expected to map Chinese descriptions to English API identifiers. That
requires curated aliases/synonyms or a later lexical + vector experiment.

The full prototype run that built page, all-heading, and compact indexes took
about 200 seconds. It intentionally parsed the same MDX three times and held
all indexes simultaneously, so cumulative heap and total setup time are not
production browser measurements. A real browser payload/startup/memory test is
still required. The 47,710-record, 7.2-MiB gzip payload is enough to justify a
controlled server-side Meilisearch comparison for scalability—not as an
assumed relevance replacement.

## Data-contract learning

Every record needs a stable unique ID and canonical URL. `.md` and `.mdx` files
can resolve to the same route, so canonicalization must happen before keyword
indexing or RAG chunking.

Heading hierarchy is preserved as `headingLevel` and `headingPath`, allowing
context such as `ConversationalAIAPI > manualSOS > 参数`. This is useful both
for search display and future RAG provenance.

The prototype's metadata extraction is deliberately minimal. It is not yet the
production source of truth for navigation-hidden state, product, platform, or
version metadata.

## Meilisearch comparison

The same compact section records were uploaded to a local Meilisearch 1.53.2
server. The search fields, URLs, titles, content, and Golden Queries were kept
as comparable as possible. Meilisearch needed a separate safe primary key such
as `doc-123`; the public URL remained a normal field because URLs contain `/`
and `#`, which are not valid Meilisearch document identifiers.

Full-corpus results with 47,710 compact records:

| Query group | Compact Orama Top 1 | Meilisearch Top 1 |
| --- | ---: | ---: |
| Exact API/property | 5/5 | 5/5 |
| Product/document term | 2/3 | 3/3 |
| Misspelled API | 1/2 normally; 2/2 with Orama `tolerance: 1` | 2/2 |
| Chinese description mapped to English API | 0/5 | 2/5 |

Observed local HTTP search latency for the 15 Golden Queries was about p50 4
ms / p95 6 ms in Meilisearch. This is not an apples-to-apples browser latency
comparison: Orama runs in-process while Meilisearch includes a local HTTP hop.
It does show that Meilisearch can handle this corpus as a server-side index.

The two Chinese-intent wins were `移除事件处理器` and `订阅消息`; the other
three still failed. Therefore Meilisearch improves some Chinese lexical
matching, but it does not provide semantic understanding by itself. Do not
claim this experiment proves RAG is needed; it only leaves semantic intent as a
separate problem.

## Alias experiment

The prototype adds five curated Chinese-to-API aliases to the compact section
records:

| Chinese query | API target |
| --- | --- |
| 手动开始说话 | `manualSOS` |
| 手动结束说话 | `manualEOS` |
| 移除事件处理器 | `removeHandler` |
| 订阅消息 | `subscribeMessage` |
| 加载音频设置 | `loadAudioSettings` |

On the focused sample, Orama with the alias field returned the correct target
in 5/5 Chinese-intent cases, versus 0/5 without aliases. Meilisearch returned
5/5 with the same aliases, versus 2/5 without them. This means the improvement
comes from the curated mapping and field weighting, not from changing search
engines. A real alias layer should be maintained as structured data and
reviewed like documentation content; it should not be hidden inside an
engine-specific configuration.

The sample Meilisearch run uploaded 4,847 records in about 1.0 seconds and
completed index creation, upload, and settings in about 2.2 seconds. The
second alias index took about 2.1 seconds. These are local development numbers
and are useful only for comparing this prototype's workflow.

## Real CN client baseline

After allowing Vite to read the worktree's symlinked dependency directory and
starting the server with `VITE_DOCS_REGION=cn`, the real endpoint
`/__static/docs-search/zh-CN.json` returned 2,090 current page-level records.
The client-shaped benchmark measured:

| Metric | Local result |
| --- | ---: |
| JSON response | 35.8 MiB |
| Gzip estimate | 5.7 MiB |
| JSON parse | 168 ms |
| Orama index build | 16.2 s |
| One query | 1 ms |
| Node heap after index | 492 MiB |

This is not a browser benchmark: it runs Node with the same Orama data shape.
The HTTP response and parsing numbers are representative of the local endpoint,
while memory and startup time will differ by browser and machine. Still, the
16-second index build and roughly 492 MiB heap make server-side search a
credible scalability option if browser measurements are similar. This changes
the engine decision slightly: Meilisearch is not justified as a relevance fix,
but may be justified to remove client startup and memory costs.

## Meilisearch page-vs-section comparison

The full local comparison used the same Meilisearch settings for both shapes:

| Metric | Page records | Compact section records |
| --- | ---: | ---: |
| Records | 6,701 | 47,710 |
| Total index setup | 21.4 s | 23.9 s |
| Document upload task | 9.7 s | 13.5 s |
| One-pass HTTP search p50 | 10 ms | 4 ms |
| One-pass HTTP search p95 | 53 ms | 6 ms |
| Warm search p50 (5x) | 12.39 ms | 3.89 ms |
| Warm search p95 (5x) | 200.37 ms | 6.77 ms |

The upload phase is the clearest cost increase: about 1.4x for 7.1x as many
records in this rerun. Total setup increased about 12% in this run. The compact
index also had a much smaller observed warm-query tail, while page search had a
200 ms p95 and a 4.15 s maximum outlier. This is an observation from one local
run, not proof that compact indexes are always faster; repeat runs on an
isolated server are needed for a production decision.

This comparison does not show a query-performance penalty from compact sections.
It does show higher ingestion/update cost and a much larger index. Meilisearch
remains plausible for server-side scalability, but the section data should stay
compact rather than indexing every heading.

## Incremental update comparison

The single-index experiment also simulated changing one source page:

| Metric | Page records | Compact section records |
| --- | ---: | ---: |
| Records for the changed page | 1 | 7 |
| Update time | 423 ms | 335 ms |

The compact index required updating seven records for this page, while the page
index required one. The measured update was not slower for compact sections in
this run, so record count alone does not establish a user-visible publishing
delay. It does establish more update payload and more indexing work for the
server. This was one page and one update on a local machine; batch updates and
concurrent production traffic still need separate testing.

## Resource sampling caveat

One full run used a fresh Meilisearch data directory and sampled about 547 MiB
peak RSS and 627 MiB final disk usage. That process held page, compact, and
alias indexes together, so these are combined upper-bound observations, not
per-index measurements. The same run also showed an anomalous 13-minute compact
setup time while the document upload task itself was about 12 seconds. This
indicates local disk contention or process scheduling noise; it should not be
used as a production estimate. A follow-up resource test must run page and
compact indexes in separate fresh Meilisearch processes and data directories.

## Current decision

Keep the experiment conclusion split into two decisions:

1. Data model: use compact section records as the candidate shape. This fixes
   exact API-to-`#anchor` ranking while avoiding most generic short fragments.
2. Engine: do not replace Orama solely for relevance. Test Meilisearch further
   only if client payload/startup/memory measurements make browser Orama too
   expensive, or if server-side filtering and operational requirements matter.

The next semantic experiment should expand the alias layer with reviewed
queries from real search logs before introducing vectors or RAG. That keeps the
comparison interpretable and is likely enough for exact API intent queries.
