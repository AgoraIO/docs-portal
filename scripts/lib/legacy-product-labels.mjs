import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Offline source: AgoraIO/shengwang-doc-source, docs/_products_.meta.js,
// commit 08f70ebd14f548e3b1cb74d1534ca7b579e54f1e (2026-10-21).
const snapshotPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures/legacy-products.meta.js.txt',
);

/**
 * Resolve display text, never an internal product identifier. This is a local
 * migration/audit helper, not a website runtime dependency.
 * @param {string} product
 * @param {{ sourceLabel?: string | null; sourceRoot?: string | null }} [options]
 */
export function resolveLegacyProductLabel(
  product,
  { sourceLabel, sourceRoot } = {},
) {
  if (sourceLabel != null) {
    if (!sourceLabel.trim() || sourceLabel === product) {
      throw new Error(`Invalid legacy product display name for "${product}".`);
    }
    return sourceLabel;
  }

  let metadataPath = snapshotPath;
  let metadata;
  if (sourceRoot) {
    metadataPath = path.join(sourceRoot, 'docs/_products_.meta.js');
    try {
      metadata = readFileSync(metadataPath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      metadataPath = snapshotPath;
    }
  }
  metadata ??= readFileSync(metadataPath, 'utf8');

  // Legacy metadata is a flat array of object literals. Read literal fields
  // without evaluating JavaScript. Commented historical products are retained:
  // their already-migrated pages still need correct display names.
  for (const entry of metadata.matchAll(/\{([^{}]*)\}/g)) {
    if (readLiteralField(entry[1], 'value') !== product) continue;
    const label = readLiteralField(entry[1], 'label');
    if (label?.trim() && label !== product) return label;
    break;
  }

  throw new Error(
    `Unresolved legacy product display name for "${product}" in ${metadataPath}. Supply sourceLabel or update the source metadata.`,
  );
}

function readLiteralField(entry, field) {
  const match = entry.match(
    new RegExp(
      `\\b${field}\\s*:\\s*(?:"((?:\\\\.|[^"\\\\])*)"|'((?:\\\\.|[^'\\\\])*)')`,
    ),
  );
  if (match?.[1] != null) return JSON.parse(`"${match[1]}"`);
  return match?.[2]?.replace(/\\(['\\])/g, '$1');
}
