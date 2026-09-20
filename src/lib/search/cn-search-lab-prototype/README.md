# CN section-search prototype

> PROTOTYPE — throw this terminal shell away after it answers the question.

## Question

Does changing the CN documentation corpus from one Orama record per page to
one record per heading section make exact API/property queries return the
correct `#anchor` near the top? If it does, the main defect is data granularity
and ranking rather than Orama itself. Only queries that still fail after this
change should be used to justify a Meilisearch or semantic-search experiment.

The prototype reads a deterministic sample of real `content/docs/zh-CN`
documents. It builds three in-memory Orama indexes from the same files:

1. page records, approximating the current CN search;
2. one record for every heading section;
3. compact section records that preserve API-like headings while merging short
   and generic subsections such as “参数” and “返回值” into their parent.

The interactive comparison also searches the compact records with narrowly
enabled typo tolerance.

The built-in 15-query set covers exact API names, product/document terms,
misspellings, and Chinese descriptions intentionally mapped to English API
identifiers.

The prototype also includes a deliberately small curated alias experiment.
For example, it adds `移除事件处理器` as an alias for the `removeHandler`
section. The alias field is tested with Orama and Meilisearch separately; it is
not connected to the website search.

It does not change the site search UI, production payload, or dependencies.

## Run

```bash
npm run prototype:cn-search
```

Inside the terminal:

- type any query and press Enter;
- type `/golden` to evaluate the built-in query set;
- type `/next` to load the next golden query;
- type `/q` to quit.

Use the full CN corpus only when the sampled result needs confirmation:

```bash
npm run prototype:cn-search -- --full
```

Run the full payload, section-quality, indexing-time, memory, and latency
benchmark with:

```bash
npm run prototype:cn-search:benchmark
```

To compare the compact corpus with a local Meilisearch instance, start
Meilisearch separately and then run:

```bash
npm run prototype:cn-search:meili
```

The command uploads the same compact section records used by Orama. It does
not change the website or add a Meilisearch dependency. The full-corpus version
is:

```bash
npm run prototype:cn-search:meili:full
```

The Meilisearch binary used for this experiment is the official local
Apple-Silicon build. It is expected to be running at `http://127.0.0.1:7700`.
The adapter gives Meilisearch safe `doc-*` primary keys while preserving the
real public URL, including its `#anchor`, in the searchable document.

The Meilisearch command also reports local index creation and document upload
time. These numbers describe the prototype's local server only and are not a
production deployment benchmark.

To measure the current CN client payload through the local server, first start
the CN development server and then run:

```bash
VITE_DOCS_REGION=cn npm run dev -- --host 127.0.0.1 --port 3010
npm run prototype:cn-search:client
```

This measures the real search-index response, JSON parsing, Orama index build,
one query, and Node heap usage. It is a client-shaped baseline, not a browser
memory measurement.

On the local CN server during the experiment, the current page-level index was
2,090 records and about 35.8 MiB as JSON (about 5.7 MiB gzip estimated). The
cold start took about 168 ms to parse JSON and 16.2 seconds to build Orama; a
single query took about 1 ms. Node heap after indexing was about 492 MiB. These
figures are machine- and development-server-dependent, but they are strong
enough to make server-side search a scalability option even though it is not a
relevance fix.

The full Meilisearch page-vs-compact comparison measured 6,701 page records
against 47,710 compact section records. In the latest rerun, page index setup
took about 21.4 s and compact section setup took about 23.9 s; document upload
was 9.7 s versus 13.5 s. Five warmed query passes produced p50/p95 values of
12.39/200.37 ms for the page index and 3.89/6.77 ms for the compact index.
These are local observations, not production guarantees. The comparison
command reports the indexed document counts as well.

For a single-index resource test, use a fresh Meilisearch data directory and
select one shape:

```bash
CN_MEILI_SHAPE=page npm run prototype:cn-search:meili:full
CN_MEILI_SHAPE=compact npm run prototype:cn-search:meili:full
```

The command also simulates changing one source page and reports how many page
or section records are updated and how long that update takes.

In the full-corpus local run, one changed page produced one page-level update
in about 423 ms and seven compact-section updates in about 335 ms. This is a
single local observation, not a production SLA; it shows why the number of
records updated matters, but not that section updates are necessarily slower.
