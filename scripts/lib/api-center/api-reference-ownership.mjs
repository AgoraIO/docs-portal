import fs from 'node:fs/promises';
import path from 'node:path';

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeLegacyUrl(value) {
  const url = new URL(value, 'https://doc.shengwang.cn');
  url.hash = '';
  url.pathname = url.pathname.replace(/\.html$/i, '');
  return url.href;
}

function referenceProductRoute(targetRoute) {
  const match = targetRoute?.match(/^(\/zh-CN\/api-reference\/[^/]+)(?:\/|$)/);
  return match?.[1] ?? null;
}

function sourcePageDetails(manifest) {
  const details = new Map();
  for (const entry of manifest.entries ?? []) {
    for (const page of entry.pageGraph?.pages ?? []) {
      const key = normalizeLegacyUrl(page.url);
      const current = details.get(key);
      const value = {
        description: entry.productDescription ?? '',
        label: page.label,
        platform: entry.label,
        product: entry.product,
      };
      if (!current) {
        details.set(key, value);
        continue;
      }
      details.set(key, {
        description: current.description || value.description,
        label: current.label === value.label ? current.label : value.label,
        platform: current.platform === value.platform ? current.platform : null,
        product: current.product === value.product ? current.product : null,
      });
    }
  }
  return details;
}

function parseMetaLink(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^\[((?:\\.|[^\]])+)]\(([^)]+)\)$/);
  return match ? { label: match[1], route: match[2] } : null;
}

function metaLink(label, route) {
  return `[${String(label).replace(/([\\\]])/g, '\\$1')}](${route})`;
}

function landingLinksInSourceOrder(manifest, route) {
  const evidenceByUrl = new Map(
    (manifest.pageEvidence ?? []).map((page) => [
      normalizeLegacyUrl(page.requestedUrl),
      page,
    ]),
  );
  const entries = (manifest.entries ?? []).filter((entry) =>
    (entry.pageGraph?.pages ?? []).some((page) =>
      evidenceByUrl
        .get(normalizeLegacyUrl(page.url))
        ?.sourceResolution?.targetRoute?.startsWith(`${route}/`),
    ),
  );
  const useCases = unique(entries.map((entry) => entry.useCase));
  const includeUseCase = useCases.length > 1;
  const links = new Map();

  for (const entry of entries) {
    for (const page of entry.pageGraph?.pages ?? []) {
      const resolution = evidenceByUrl.get(
        normalizeLegacyUrl(page.url),
      )?.sourceResolution;
      if (
        !resolution?.targetRoute?.startsWith(`${route}/`) ||
        !resolution.sourcePath
          ?.split('/')
          .some((segment) => segment.toLowerCase() === 'api')
      ) {
        continue;
      }
      if (links.has(resolution.targetRoute)) continue;
      links.set(resolution.targetRoute, {
        label: [includeUseCase ? entry.useCase : null, entry.label, page.label]
          .filter(Boolean)
          .join(' · '),
        route: resolution.targetRoute,
      });
    }
  }

  return [...links.values()];
}

function replaceMetaPages(pages, replacements) {
  const output = [];
  for (const page of pages ?? []) {
    if (page && typeof page === 'object') {
      if (!Array.isArray(page.pages)) {
        output.push(page);
        continue;
      }
      output.push({
        ...page,
        pages: replaceMetaPages(page.pages, replacements),
      });
      continue;
    }
    const parsed = parseMetaLink(page);
    const replacement = replacements.find(
      (candidate) =>
        candidate.leaf === page || candidate.oldTargetRoute === parsed?.route,
    );
    const next = replacement
      ? metaLink(replacement.label, replacement.replacementRoute)
      : page;
    if (!output.includes(next)) output.push(next);
  }
  return output;
}

async function walkMetaFiles(root, prefix = '') {
  const files = [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(root, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await walkMetaFiles(absolute, relative)));
    } else if (entry.isFile() && entry.name === 'meta.json') {
      files.push(relative);
    }
  }
  return files;
}

export function buildApiReferenceRehomePlan(manifest) {
  const details = sourcePageDetails(manifest);
  const byOldTarget = new Map();
  const sourcePages = [];
  for (const page of manifest.pageEvidence ?? []) {
    const resolution = page.sourceResolution;
    if (
      !resolution?.supersededTargetPath ||
      !resolution.supersededTargetRoute ||
      !resolution.targetPath?.startsWith('content/docs/zh-CN/api-reference/') ||
      !resolution.targetRoute?.startsWith('/zh-CN/api-reference/')
    ) {
      continue;
    }
    sourcePages.push({
      sourcePath: resolution.sourcePath,
      sourceUrl: page.requestedUrl,
      targetPath: resolution.targetPath,
      targetRoute: resolution.targetRoute,
    });
    const values = byOldTarget.get(resolution.supersededTargetPath) ?? [];
    values.push({
      details: details.get(normalizeLegacyUrl(page.requestedUrl)) ?? {},
      oldTargetRoute: resolution.supersededTargetRoute,
      sourcePath: resolution.sourcePath,
      sourceUrl: page.requestedUrl,
      targetPath: resolution.targetPath,
      targetRoute: resolution.targetRoute,
    });
    byOldTarget.set(resolution.supersededTargetPath, values);
  }

  const records = [];
  for (const [oldTargetPath, pages] of byOldTarget) {
    const targetPaths = unique(pages.map((page) => page.targetPath));
    const targetRoutes = unique(pages.map((page) => page.targetRoute));
    const roots = unique(targetRoutes.map(referenceProductRoute));
    if (targetRoutes.length > 1 && roots.length !== 1) {
      throw new Error(
        `Rehomed API target ${oldTargetPath} spans multiple reference products.`,
      );
    }
    const product = unique(pages.map((page) => page.details.product))[0];
    const oldTargetRoutes = unique(pages.map((page) => page.oldTargetRoute));
    if (oldTargetRoutes.length !== 1) {
      throw new Error(
        `Rehomed API target ${oldTargetPath} has conflicting superseded routes.`,
      );
    }
    const oldTargetRoute = oldTargetRoutes[0];
    const replacementRoute =
      targetRoutes.length === 1 ? targetRoutes[0] : roots[0];
    const labels = unique(pages.map((page) => page.details.label));
    records.push({
      label:
        targetRoutes.length > 1
          ? `${product ?? '产品'} API 参考`
          : (labels[0] ?? path.posix.basename(oldTargetPath, '.mdx')),
      leaf: path.posix.basename(
        oldTargetPath,
        path.posix.extname(oldTargetPath),
      ),
      metaPath: `${path.posix.dirname(oldTargetPath)}/meta.json`,
      oldTargetPath,
      oldTargetRoute,
      replacementRoute,
      sourcePaths: unique(pages.map((page) => page.sourcePath)),
      sourceUrls: unique(pages.map((page) => page.sourceUrl)),
      targetPaths,
      targetRoutes,
    });
  }

  const landingByRoute = new Map();
  for (const record of records.filter(
    (candidate) => candidate.targetRoutes.length > 1,
  )) {
    const route = record.replacementRoute;
    const pages = (manifest.pageEvidence ?? []).filter((page) =>
      page.sourceResolution?.targetRoute?.startsWith(`${route}/`),
    );
    const productDetails = pages
      .map((page) => details.get(normalizeLegacyUrl(page.requestedUrl)))
      .find((value) => value?.product);
    const orderedLinks = landingLinksInSourceOrder(manifest, route);
    const links =
      orderedLinks.length > 0
        ? orderedLinks
        : unique(
            pages
              .filter((page) =>
                page.sourceResolution?.sourcePath
                  ?.split('/')
                  .some((segment) => segment.toLowerCase() === 'api'),
              )
              .map((page) => {
                const pageDetails =
                  details.get(normalizeLegacyUrl(page.requestedUrl)) ?? {};
                return JSON.stringify({
                  label: [pageDetails.platform, pageDetails.label]
                    .filter(Boolean)
                    .join(' · '),
                  route: page.sourceResolution.targetRoute,
                });
              }),
          ).map((value) => JSON.parse(value));
    landingByRoute.set(route, {
      description: productDetails?.description ?? '',
      links,
      route,
      targetPath: `content/docs${route}/index.mdx`,
      title: productDetails?.product ?? record.label.replace(/ API 参考$/, ''),
    });
  }

  const metaPlans = new Map();
  for (const record of records) {
    const replacements = metaPlans.get(record.metaPath) ?? [];
    replacements.push(record);
    metaPlans.set(record.metaPath, replacements);
  }

  return {
    landingPages: [...landingByRoute.values()].sort((left, right) =>
      left.route.localeCompare(right.route),
    ),
    metaPlans: [...metaPlans.entries()]
      .map(([metaPath, replacements]) => ({ metaPath, replacements }))
      .sort((left, right) => left.metaPath.localeCompare(right.metaPath)),
    records: records.sort((left, right) =>
      left.oldTargetPath.localeCompare(right.oldTargetPath),
    ),
    sourcePages,
  };
}

export function rehomeRouteAliases(plan) {
  return plan.records.map((record) => ({
    from: record.oldTargetRoute,
    to: record.replacementRoute,
  }));
}

export async function reconcileApiReferenceRehome({ repoRoot, mode, plan }) {
  if (plan.records.length === 0) {
    return {
      changedMetaPaths: [],
      removedPaths: [],
      sectionMetaFiles: 0,
      sectionMetaPaths: [],
      supersededApiPages: 0,
    };
  }
  const root = path.resolve(repoRoot);
  for (const record of plan.records) {
    for (const targetPath of record.targetPaths) {
      try {
        await fs.access(path.resolve(root, targetPath));
      } catch {
        throw new Error(
          `Rehomed API target is missing before navigation reconcile: ${targetPath}`,
        );
      }
    }
  }

  const changedMetaPaths = [];
  const sectionMetaPaths = [];
  const docsRoot = path.resolve(root, 'content/docs/zh-CN');
  const metaPaths = (await walkMetaFiles(docsRoot)).map(
    (relative) => `content/docs/zh-CN/${relative}`,
  );
  for (const metaPath of metaPaths) {
    const absolute = path.resolve(root, metaPath);
    const source = await fs.readFile(absolute, 'utf8');
    const replacements = plan.records.filter(
      (record) =>
        record.metaPath === metaPath || source.includes(record.oldTargetRoute),
    );
    if (replacements.length === 0) continue;
    sectionMetaPaths.push(metaPath);
    const meta = JSON.parse(source);
    const next = `${JSON.stringify(
      {
        ...meta,
        pages: replaceMetaPages(meta.pages, replacements),
      },
      null,
      2,
    )}\n`;
    if (source === next) continue;
    changedMetaPaths.push(metaPath);
    if (mode === 'check') {
      throw new Error(
        `Section navigation still exposes a local API page: ${metaPath}`,
      );
    }
    if (mode === 'write') await fs.writeFile(absolute, next);
  }

  const removedPaths = [];
  for (const record of plan.records) {
    const absolute = path.resolve(root, record.oldTargetPath);
    try {
      await fs.access(absolute);
    } catch {
      continue;
    }
    removedPaths.push(record.oldTargetPath);
    if (mode === 'check') {
      throw new Error(
        `API page still exists outside the reference center: ${record.oldTargetPath}`,
      );
    }
    if (mode === 'write') await fs.rm(absolute);
  }

  return {
    changedMetaPaths,
    removedPaths,
    sectionMetaFiles: sectionMetaPaths.length,
    sectionMetaPaths,
    supersededApiPages: plan.records.length,
  };
}
