import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';

const API_CENTER_ORIGIN = 'https://doc.shengwang.cn';

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function apiGroupFromLabel(label) {
  if (label.includes('客户端')) return 'client';
  if (label.includes('服务端')) return 'server';
  return 'unknown';
}

function urlFamily(link) {
  if (link.startsWith('/api-ref/')) return 'api-ref';
  if (link.startsWith('/doc/')) return 'doc';
  return 'external';
}

function absoluteLegacyUrl(link) {
  return new URL(link, API_CENTER_ORIGIN).href;
}

function stableEntryId(entry) {
  return `api-${sha256(
    [
      entry.category,
      ...entry.subcategories,
      entry.product,
      entry.useCase ?? '',
      entry.apiGroup,
      entry.platform,
      entry.label,
      entry.legacyPath,
    ].join('\u001f'),
  ).slice(0, 12)}`;
}

function normalizeApiGroup(apis, context, apiGroup, entries) {
  for (const [entryOrder, api] of (apis ?? []).entries()) {
    const legacyPath = normalizeText(api.link);
    const family = urlFamily(legacyPath);
    const entry = {
      ...context,
      apiGroup,
      entryOrder,
      platform: normalizeText(api.platform),
      label: normalizeText(api.text),
      legacyPath,
      legacyUrl: absoluteLegacyUrl(legacyPath),
      urlFamily: family,
      scope: family === 'external' ? 'external-entry' : 'current',
      sourceType: family === 'external' ? 'external' : 'unresolved',
      sourceResolution: null,
      targetPath: null,
      targetRoute: null,
      pageGraph: {
        status: family === 'external' ? 'not-applicable' : 'pending',
        pages: [],
        warnings: [],
      },
      migration: {
        status: family === 'external' ? 'out-of-scope' : 'pending',
        warnings: [],
      },
    };
    entry.id = stableEntryId(entry);
    entries.push(entry);
  }
}

function normalizeProduct(product, context, products, entries) {
  const productRecord = {
    ...context,
    product: normalizeText(product.title),
    description: normalizeText(product.desc),
    useCases: [],
  };

  if (Array.isArray(product.useCases)) {
    for (const [useCaseOrder, useCase] of product.useCases.entries()) {
      const useCaseRecord = {
        order: useCaseOrder,
        title: normalizeText(useCase.title),
        description: normalizeText(useCase.desc),
      };
      productRecord.useCases.push(useCaseRecord);
      const apiContext = {
        ...context,
        product: productRecord.product,
        productDescription: productRecord.description,
        useCase: useCaseRecord.title,
        useCaseDescription: useCaseRecord.description,
        useCaseOrder,
      };
      normalizeApiGroup(useCase.clientApis, apiContext, 'client', entries);
      normalizeApiGroup(useCase.serverApis, apiContext, 'server', entries);
    }
  } else {
    const apiContext = {
      ...context,
      product: productRecord.product,
      productDescription: productRecord.description,
      useCase: null,
      useCaseDescription: null,
      useCaseOrder: null,
    };
    normalizeApiGroup(product.clientApis, apiContext, 'client', entries);
    normalizeApiGroup(product.serverApis, apiContext, 'server', entries);
  }

  products.push(productRecord);
}

function walkCategoryChildren(
  children,
  category,
  subcategories,
  categoryOrder,
  state,
) {
  for (const child of children ?? []) {
    if (child.title) {
      normalizeProduct(
        child,
        {
          category,
          categoryOrder,
          subcategories,
          productOrder: state.productOrder++,
        },
        state.products,
        state.entries,
      );
      continue;
    }

    if (child.category && Array.isArray(child.children)) {
      walkCategoryChildren(
        child.children,
        category,
        [...subcategories, normalizeText(child.category)],
        categoryOrder,
        state,
      );
    }
  }
}

/** @returns {any} */
export function normalizeSourceApiCenter(apiData, platforms = []) {
  const state = { entries: [], productOrder: 0, products: [] };
  const categories = [];

  for (const [categoryOrder, category] of apiData.entries()) {
    const title = normalizeText(category.category);
    categories.push({ order: categoryOrder, title });
    walkCategoryChildren(category.children, title, [], categoryOrder, state);
  }

  return {
    categories,
    platforms: platforms.map((platform, order) => ({
      order,
      label: normalizeText(platform.label),
      value: normalizeText(platform.value),
      icon: normalizeText(platform.icon),
    })),
    products: state.products,
    entries: state.entries,
  };
}

function readApiGroups($, container) {
  const groups = [];
  $(container)
    .find('.custom-api-card')
    .each((_, card) => {
      const cardContainer = $(card).parent();
      const heading = normalizeText(cardContainer.prev().text());
      let group = groups.at(-1);
      const apiGroup = apiGroupFromLabel(heading);
      if (
        !group ||
        group.heading !== heading ||
        group.containerIndex !== cardContainer.index()
      ) {
        group = {
          apiGroup,
          heading,
          labels: [],
          containerIndex: cardContainer.index(),
        };
        groups.push(group);
      }
      group.labels.push(normalizeText($(card).text()));
    });

  return groups.map(({ containerIndex: _containerIndex, ...group }) => group);
}

export function parseLiveApiCenterHtml(html, finalUrl) {
  const $ = cheerio.load(html);
  const products = [];

  $('.custom-category-title').each((productOrder, titleNode) => {
    const container = $(titleNode).parent();
    const useCaseContainers = container
      .children()
      .filter((_, child) => $(child).children().first().hasClass('w-text-lg'))
      .toArray();

    const product = {
      productOrder,
      title: normalizeText($(titleNode).text()),
      description: normalizeText($(titleNode).next().text()),
      useCases: [],
      apiGroups: [],
    };

    if (useCaseContainers.length > 0) {
      product.useCases = useCaseContainers.map((useCaseContainer, order) => {
        const children = $(useCaseContainer).children();
        return {
          order,
          title: normalizeText(children.first().text()),
          description: normalizeText(children.eq(1).text()),
          apiGroups: readApiGroups($, useCaseContainer),
        };
      });
    } else {
      product.apiGroups = readApiGroups($, container);
    }

    products.push(product);
  });

  const title = normalizeText($('title').first().text());
  const hero = $('.custom-banner-title').first();
  const heroTitle = normalizeText(hero.text());
  const heroDescription = normalizeText(hero.next().text());
  const model = {
    title,
    heroTitle,
    heroDescription,
    url: finalUrl,
    products,
  };
  return {
    ...model,
    productCount: products.length,
    apiEntryCount: products.reduce(
      (total, product) =>
        total +
        (product.useCases.length > 0
          ? product.useCases.reduce(
              (useCaseTotal, useCase) =>
                useCaseTotal +
                useCase.apiGroups.reduce(
                  (groupTotal, group) => groupTotal + group.labels.length,
                  0,
                ),
              0,
            )
          : product.apiGroups.reduce(
              (groupTotal, group) => groupTotal + group.labels.length,
              0,
            )),
      0,
    ),
    structureHash: sha256(JSON.stringify(products)),
    parityBasis: 'rendered-dom-structure',
  };
}

export function parseLiveApiCenterBaseline(baseline) {
  if (!Array.isArray(baseline.products)) {
    throw new Error('Live baseline must contain a products array.');
  }

  const products = baseline.products.map((product, productOrder) => ({
    productOrder,
    title: normalizeText(product.title),
    apiLabels: (product.apiLabels ?? []).map(normalizeText),
  }));
  return {
    title: normalizeText(baseline.title),
    heroTitle: normalizeText(baseline.heroTitle),
    heroDescription: normalizeText(baseline.heroDescription),
    url: baseline.url,
    products,
    productCount: baseline.productCount,
    apiEntryCount: baseline.apiEntryCount,
    structureHash: baseline.hash ?? sha256(JSON.stringify(products)),
    parityBasis: 'visible-product-and-entry-labels',
    capturedAt: baseline.capturedAt ?? null,
  };
}

function sourceProductProjection(source) {
  return source.products.map((product) => {
    const entries = source.entries.filter(
      (entry) => entry.productOrder === product.productOrder,
    );
    const projectGroups = (useCase) => {
      const matching = entries.filter((entry) => entry.useCase === useCase);
      return ['client', 'server']
        .map((apiGroup) => ({
          apiGroup,
          heading: apiGroup === 'client' ? '客户端 API' : '服务端 API',
          labels: matching
            .filter((entry) => entry.apiGroup === apiGroup)
            .map((entry) => entry.label),
        }))
        .filter((group) => group.labels.length > 0);
    };

    return {
      productOrder: product.productOrder,
      title: product.product,
      description: product.description,
      useCases: product.useCases.map((useCase) => ({
        order: useCase.order,
        title: useCase.title,
        description: useCase.description,
        apiGroups: projectGroups(useCase.title),
      })),
      apiGroups: product.useCases.length === 0 ? projectGroups(null) : [],
    };
  });
}

export function compareLiveAndSource(live, source) {
  const warnings = [];
  const sourceProjection = sourceProductProjection(source);
  const simpleSourceProjection = sourceProjection.map((product) => ({
    productOrder: product.productOrder,
    title: product.title,
    apiLabels:
      product.useCases.length > 0
        ? product.useCases.flatMap((useCase) =>
            useCase.apiGroups.flatMap((group) => group.labels),
          )
        : product.apiGroups.flatMap((group) => group.labels),
  }));

  if (live.productCount !== sourceProjection.length) {
    warnings.push({
      code: 'live-source-product-count-drift',
      severity: 'error',
      message: `Live has ${live.productCount} products; source has ${sourceProjection.length}.`,
    });
  }

  if (live.apiEntryCount !== source.entries.length) {
    warnings.push({
      code: 'live-source-entry-count-drift',
      severity: 'error',
      message: `Live has ${live.apiEntryCount} API entries; source has ${source.entries.length}.`,
    });
  }

  const comparableSource =
    live.parityBasis === 'visible-product-and-entry-labels'
      ? simpleSourceProjection
      : sourceProjection;
  const length = Math.max(live.products.length, comparableSource.length);
  for (let index = 0; index < length; index++) {
    const liveProduct = live.products[index];
    const sourceProduct = comparableSource[index];
    if (!liveProduct || !sourceProduct) continue;
    if (JSON.stringify(liveProduct) !== JSON.stringify(sourceProduct)) {
      warnings.push({
        code: 'live-source-product-structure-drift',
        severity: 'error',
        productOrder: index,
        liveProduct: liveProduct.title,
        sourceProduct: sourceProduct.title,
        message: `Live/source structure differs at product ${index + 1}.`,
      });
    }
  }

  return {
    status: warnings.length === 0 ? 'matched' : 'drift',
    basis: live.parityBasis,
    warnings,
    sourceStructureHash: sha256(JSON.stringify(comparableSource)),
    liveStructureHash: live.structureHash,
  };
}

/** @returns {any} */
export function buildManifest({ live, source, sourceCommit, sourcePath }) {
  const parity = compareLiveAndSource(live, source);
  const counts = source.entries.reduce(
    (result, entry) => {
      result[entry.urlFamily] += 1;
      return result;
    },
    { 'api-ref': 0, doc: 0, external: 0 },
  );

  return {
    schemaVersion: 1,
    scope: {
      liveApiCenterUrl: live.url,
      locale: 'zh-CN',
      currentOnly: true,
      archiveIncluded: false,
    },
    source: {
      repository: 'AgoraIO/shengwang-doc-source',
      commit: sourceCommit,
      apiCenterDataPath: sourcePath,
    },
    live: {
      title: live.title,
      heroTitle: live.heroTitle,
      heroDescription: live.heroDescription,
      finalUrl: live.url,
      productCount: live.productCount,
      apiEntryCount: live.apiEntryCount,
      structureHash: live.structureHash,
      parityBasis: live.parityBasis,
      capturedAt: live.capturedAt ?? null,
    },
    parity,
    counts: {
      categories: source.categories.length,
      products: source.products.length,
      entries: source.entries.length,
      urlFamilies: counts,
      resolvedPageGraphs: 0,
      pendingPageGraphs: source.entries.filter(
        (entry) => entry.pageGraph.status === 'pending',
      ).length,
    },
    categories: source.categories,
    platforms: source.platforms,
    products: source.products,
    entries: source.entries,
  };
}

export function refreshManifestCounts(manifest) {
  manifest.counts.resolvedPageGraphs = manifest.entries.filter(
    (entry) => entry.pageGraph.status === 'resolved',
  ).length;
  manifest.counts.pendingPageGraphs = manifest.entries.filter(
    (entry) => entry.pageGraph.status === 'pending',
  ).length;
  manifest.counts.warningPageGraphs = manifest.entries.filter(
    (entry) => entry.pageGraph.status === 'warning',
  ).length;
  manifest.counts.failedPageGraphs = manifest.entries.filter(
    (entry) => entry.pageGraph.status === 'failed',
  ).length;
  return manifest;
}

/** @returns {any} */
export function mergeManifestProgress(manifest, previousManifest) {
  if (!previousManifest?.entries) return refreshManifestCounts(manifest);
  const previousEntries = new Map(
    previousManifest.entries.map((entry) => [entry.id, entry]),
  );
  manifest.entries = manifest.entries.map((entry) => {
    const previous = previousEntries.get(entry.id);
    if (!previous) return entry;
    return {
      ...entry,
      sourceType: previous.sourceType ?? entry.sourceType,
      sourceResolution: previous.sourceResolution ?? entry.sourceResolution,
      targetPath: previous.targetPath ?? entry.targetPath,
      targetRoute: previous.targetRoute ?? entry.targetRoute,
      pageGraph: previous.pageGraph ?? entry.pageGraph,
      migration: previous.migration ?? entry.migration,
    };
  });
  if (previousManifest.pageGraphSummary) {
    manifest.pageGraphSummary = previousManifest.pageGraphSummary;
  }
  if (previousManifest.pageEvidence) {
    manifest.pageEvidence = previousManifest.pageEvidence;
  }
  if (previousManifest.sourceResolutionSummary) {
    manifest.sourceResolutionSummary = previousManifest.sourceResolutionSummary;
  }
  return refreshManifestCounts(manifest);
}

function markdownEscape(value) {
  return String(value).replaceAll('|', '\\|');
}

export function renderManifestMarkdown(manifest) {
  const lines = [
    '# API Center HTML Migration Manifest',
    '',
    '> Generated by `scripts/api-center-inventory.mjs`. Do not edit by hand.',
    '',
    `- Source commit: \`${manifest.source.commit}\``,
    `- Live URL: ${manifest.live.finalUrl}`,
    `- Live/source parity: **${manifest.parity.status}**`,
    `- Products: ${manifest.counts.products}`,
    `- API entries: ${manifest.counts.entries}`,
    `- URL families: api-ref ${manifest.counts.urlFamilies['api-ref']}, doc ${manifest.counts.urlFamilies.doc}, external ${manifest.counts.urlFamilies.external}`,
    `- Live structure hash: \`${manifest.live.structureHash}\``,
  ];

  if (manifest.pageGraphSummary) {
    lines.push(
      `- Navigation pages: ${manifest.pageGraphSummary.uniquePageCount}`,
      `- Reachable logical pages: ${manifest.pageGraphSummary.closureLogicalPageCount ?? 'pending'}`,
      `- Broken live body links: ${manifest.pageGraphSummary.closureWarningCount ?? 0}`,
      `- Missing live fragments: ${manifest.pageGraphSummary.fragmentWarningCount ?? 0}`,
    );
  }

  if (manifest.sourceResolutionSummary) {
    const summary = manifest.sourceResolutionSummary;
    lines.push(
      `- Source-classified pages: ${summary.classifiedPageCount}/${summary.logicalPageCount}`,
      `- Excluded broken live links: ${summary.excludedPageCount}`,
      `- Unresolved / ambiguous sources: ${summary.unresolvedPageCount} / ${summary.ambiguousPageCount}`,
      `- Existing target pages: ${summary.existingTargetCount}`,
      `- Source types: ${Object.entries(summary.byType)
        .map(([type, count]) => `${type} ${count}`)
        .join(', ')}`,
      `- Generators: ${Object.entries(summary.byGenerator)
        .map(([type, count]) => `${type} ${count}`)
        .join(', ')}`,
    );
  }

  lines.push(
    '',
    '## Entry inventory',
    '',
    '| # | Category path | Product / use case | API group | Platform | Legacy entry | Initial type | Page graph |',
    '| ---: | --- | --- | --- | --- | --- | --- | --- |',
  );

  for (const [index, entry] of manifest.entries.entries()) {
    const categoryPath = [entry.category, ...entry.subcategories].join(' / ');
    const productPath = [entry.product, entry.useCase]
      .filter(Boolean)
      .join(' / ');
    lines.push(
      `| ${index + 1} | ${markdownEscape(categoryPath)} | ${markdownEscape(productPath)} | ${entry.apiGroup} | ${markdownEscape(entry.label)} | [${markdownEscape(entry.legacyPath)}](${entry.legacyUrl}) | ${entry.sourceType} | ${entry.pageGraph.status} |`,
    );
  }

  lines.push('', '## Live/source warnings', '');
  if (manifest.parity.warnings.length === 0) {
    lines.push('- None. The visible structure matches the frozen source data.');
  } else {
    for (const warning of manifest.parity.warnings) {
      lines.push(`- \`${warning.code}\`: ${warning.message}`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}
