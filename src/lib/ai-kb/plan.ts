import {
  assertKbPath,
  createKbDocument,
  type KbCorpus,
  type KbDocument,
  requireText,
} from './corpus';

export type KbSuccessfulState = {
  schema: 1;
  scope: string;
  generation: number;
  selection?: string[];
  entries: { sourceId: string; hash: string; remoteIds: string[] }[];
};
export type KbPlan = {
  schema: 1;
  scope: string;
  revision: string;
  stateGeneration: number;
  selection?: string[];
  create: KbDocument[];
  update: KbDocument[];
  delete: KbSuccessfulState['entries'];
  skip: string[];
  deletionBlocked: boolean;
};

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Expected object');
  return value as Record<string, unknown>;
}
function selection(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.length)
    throw new Error('Invalid selection');
  for (const id of value) assertKbPath(id);
  if (new Set(value).size !== value.length)
    throw new Error('Duplicate selection identity');
  return [...value].sort();
}
function hash(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))
    throw new Error('Invalid hash');
  return value;
}
function uniqueIds(entries: { sourceId: string }[]) {
  if (new Set(entries.map((e) => e.sourceId)).size !== entries.length)
    throw new Error('Duplicate source identity');
}
export function parseKbCorpus(value: unknown): KbCorpus {
  const input = object(value);
  if (input.schema !== 1) throw new Error('Unsupported corpus schema');
  const scope = requireText(input.scope, 'scope');
  const revision = requireText(input.revision, 'revision');
  if (input.complete !== true) throw new Error('Corpus must be complete');
  if (!Array.isArray(input.documents) || !input.documents.length)
    throw new Error('Empty corpus');
  const documents = input.documents.map((raw) => {
    const entry = object(raw);
    // createKbDocument performs runtime validation and drops unknown metadata keys.
    const document = createKbDocument(
      entry as unknown as Parameters<typeof createKbDocument>[0],
    );
    if (
      entry.sourceId !== document.sourceId ||
      hash(entry.hash) !== document.hash
    )
      throw new Error('Document identity/hash mismatch');
    return document;
  });
  uniqueIds(documents);
  const selected = selection(input.selection);
  if (
    selected &&
    JSON.stringify(selected) !==
      JSON.stringify(documents.map((d) => d.sourceId).sort())
  )
    throw new Error('Corpus selection mismatch');
  return {
    schema: 1,
    scope,
    revision,
    complete: true,
    ...(selected ? { selection: selected } : {}),
    documents,
  };
}
export function parseKbSuccessfulState(value: unknown): KbSuccessfulState {
  const input = object(value);
  if (input.schema !== 1) throw new Error('Unsupported state schema');
  const scope = requireText(input.scope, 'scope');
  if (
    !Number.isSafeInteger(input.generation) ||
    (input.generation as number) < 0
  )
    throw new Error('Invalid generation');
  if (!Array.isArray(input.entries)) throw new Error('Invalid state entries');
  const entries = input.entries.map((raw) => {
    const e = object(raw);
    assertKbPath(e.sourceId);
    if (!Array.isArray(e.remoteIds) || !e.remoteIds.length)
      throw new Error('Invalid remote IDs');
    const remoteIds = e.remoteIds.map((id) => requireText(id, 'remote ID'));
    if (new Set(remoteIds).size !== remoteIds.length)
      throw new Error('Duplicate remote ID');
    return { sourceId: e.sourceId, hash: hash(e.hash), remoteIds };
  });
  uniqueIds(entries);
  const ownedRemoteIds = entries.flatMap((entry) => entry.remoteIds);
  if (new Set(ownedRemoteIds).size !== ownedRemoteIds.length)
    throw new Error('Duplicate remote ID ownership across source identities');
  const selected = selection(input.selection);
  if (selected && entries.some((e) => !selected.includes(e.sourceId)))
    throw new Error('State selection mismatch');
  return {
    schema: 1,
    scope,
    generation: input.generation as number,
    ...(selected ? { selection: selected } : {}),
    entries,
  };
}
export function planKbSync(
  corpus: KbCorpus,
  previous: KbSuccessfulState,
): KbPlan {
  const current = parseKbCorpus(corpus);
  const state = parseKbSuccessfulState(previous);
  if (current.scope !== state.scope)
    throw new Error('Corpus/state scope mismatch');
  if (JSON.stringify(current.selection) !== JSON.stringify(state.selection))
    throw new Error('Corpus/state selection mismatch');
  const before = new Map(state.entries.map((entry) => [entry.sourceId, entry]));
  const identities = new Set(current.documents.map((doc) => doc.sourceId));
  const create: KbDocument[] = [],
    update: KbDocument[] = [],
    skip: string[] = [];
  for (const doc of [...current.documents].sort((a, b) =>
    a.sourceId < b.sourceId ? -1 : a.sourceId > b.sourceId ? 1 : 0,
  )) {
    const old = before.get(doc.sourceId);
    if (!old) create.push(doc);
    else if (old.hash !== doc.hash) update.push(doc);
    else skip.push(doc.sourceId);
  }
  const removed = state.entries
    .filter((entry) => !identities.has(entry.sourceId))
    .sort((a, b) =>
      a.sourceId < b.sourceId ? -1 : a.sourceId > b.sourceId ? 1 : 0,
    );
  return {
    schema: 1,
    scope: current.scope,
    revision: current.revision,
    stateGeneration: state.generation,
    ...(current.selection ? { selection: current.selection } : {}),
    create,
    update,
    delete: removed,
    skip,
    deletionBlocked: removed.length > 0,
  };
}
