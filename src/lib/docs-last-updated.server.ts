import path from 'node:path';
import { DOCS_LAST_UPDATED_BY_PATH } from '@/generated/docs-last-updated-manifest';
import {
  createDocsLastUpdatedMetadata,
  type DocsLastUpdatedMetadata,
} from './docs-last-updated';

export async function resolveDocsLastUpdatedMetadata(
  pathCandidates: string[],
): Promise<DocsLastUpdatedMetadata> {
  const candidates = normalizePathCandidates(pathCandidates);
  const manifestIso = candidates
    .map((candidate) => DOCS_LAST_UPDATED_BY_PATH[candidate])
    .find((value): value is string => Boolean(value));

  if (manifestIso) {
    return createDocsLastUpdatedMetadata(manifestIso, 'git');
  }

  return createDocsLastUpdatedMetadata();
}

function normalizePathCandidates(pathCandidates: string[]) {
  return Array.from(
    new Set(
      pathCandidates
        .map(normalizeMetadataPath)
        .filter((candidate) => candidate.length > 0),
    ),
  );
}

function normalizeMetadataPath(metadataPath: string) {
  const normalized = metadataPath
    .replaceAll(path.sep, '/')
    .replace(/^\.\//, '');
  const cwd = process.cwd().replaceAll(path.sep, '/');

  return normalized.startsWith(`${cwd}/`)
    ? normalized.slice(cwd.length + 1)
    : normalized;
}
