import { createHash } from 'node:crypto';
import { assertKbPath, requireText } from './corpus';

export type KbTarget = {
  schema: 1;
  environment: 'local-demo';
  region: 'cn-beijing';
  workspaceId: string;
  categoryId: string;
  indexId?: string;
  name: string;
  origin: string;
  scope: string;
  selection?: string[];
};
export function workspaceHost(workspaceId: string) {
  if (!/^llm-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workspaceId))
    throw new Error('Invalid workspace ID');
  return `https://${workspaceId}.cn-beijing.maas.aliyuncs.com`;
}
export function parseKbTarget(value: unknown): KbTarget {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid target');
  const v = value as Record<string, unknown>;
  if (
    v.schema !== 1 ||
    v.environment !== 'local-demo' ||
    v.region !== 'cn-beijing'
  )
    throw new Error('Unsupported target environment');
  const workspaceId = requireText(v.workspaceId, 'workspace ID');
  workspaceHost(workspaceId);
  const origin = requireText(v.origin, 'citation origin');
  const url = new URL(origin);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/' ||
    origin.replace(/\/$/, '') !== url.origin
  )
    throw new Error('Invalid citation origin');
  const name = requireText(v.name, 'KB name');
  if (name.length > 20) throw new Error('KB name exceeds 20 characters');
  let selection: string[] | undefined;
  if (v.selection !== undefined) {
    if (!Array.isArray(v.selection) || !v.selection.length)
      throw new Error('Empty selection');
    for (const id of v.selection) assertKbPath(id);
    if (new Set(v.selection).size !== v.selection.length)
      throw new Error('Duplicate selection');
    selection = [...v.selection].sort();
  }
  return {
    schema: 1,
    environment: 'local-demo',
    region: 'cn-beijing',
    workspaceId,
    categoryId: requireText(v.categoryId, 'category ID'),
    ...(v.indexId !== undefined
      ? { indexId: requireText(v.indexId, 'index ID') }
      : {}),
    name,
    origin: url.origin,
    scope: requireText(v.scope, 'scope'),
    ...(selection ? { selection } : {}),
  };
}
export function targetIdentity(value: KbTarget): string {
  return createHash('sha256')
    .update(JSON.stringify(parseKbTarget(value)))
    .digest('hex');
}
