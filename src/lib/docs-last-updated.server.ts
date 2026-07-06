import { stat } from 'node:fs/promises';
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

  const fileMtimeIso = await resolveMostRecentFileMtimeIso(candidates);

  if (fileMtimeIso) {
    return createDocsLastUpdatedMetadata(fileMtimeIso, 'file-mtime');
  }

  return createDocsLastUpdatedMetadata();
}

async function resolveMostRecentFileMtimeIso(candidates: string[]) {
  const mtimes = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        return (await stat(path.resolve(process.cwd(), candidate))).mtime;
      } catch {
        return null;
      }
    }),
  );
  const newest = mtimes
    .filter((mtime): mtime is Date => mtime instanceof Date)
    .sort((left, right) => right.valueOf() - left.valueOf())[0];

  return newest?.toISOString();
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
