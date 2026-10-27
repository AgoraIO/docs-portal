import { describe, expect, it } from 'vitest';
import { createKbDocument, type KbCorpus } from './corpus';
import { type KbSuccessfulState, planKbSync } from './plan';

const makeDoc = (name: string, content = 'body') =>
  createKbDocument({
    content,
    metadata: {
      url: `/zh-CN/ai/${name}`,
      canonicalUrl: `/zh-CN/ai/${name}`,
      title: name,
      locale: 'zh-CN',
      products: [],
      platforms: [],
      docType: 'docs',
      sections: [],
    },
  });
const a = makeDoc('a'),
  b = makeDoc('b'),
  c = makeDoc('c'),
  gone = makeDoc('gone');
const corpus: KbCorpus = {
  schema: 1,
  scope: 'cn-demo',
  revision: 'r2',
  complete: true,
  documents: [a, b, c],
};
const old: KbSuccessfulState = {
  schema: 1,
  scope: 'cn-demo',
  generation: 4,
  entries: [a, b, gone].map((d) => ({
    sourceId: d.sourceId,
    hash: d === b ? '0'.repeat(64) : d.hash,
    remoteIds: [`remote-${d.metadata.title}`],
  })),
};
describe('KB incremental plan', () => {
  it('classifies create/update/delete/skip without modifying inputs', () => {
    const before = JSON.stringify(old);
    const result = planKbSync(corpus, old);
    expect(result.create.map((d) => d.sourceId)).toEqual(['/zh-CN/ai/c']);
    expect(result.update.map((d) => d.sourceId)).toEqual(['/zh-CN/ai/b']);
    expect(result.delete.map((d) => d.remoteIds)).toEqual([['remote-gone']]);
    expect(result.skip).toEqual(['/zh-CN/ai/a']);
    expect(result.deletionBlocked).toBe(true);
    expect(result.stateGeneration).toBe(4);
    expect(JSON.stringify(old)).toBe(before);
  });
  it('skips all unchanged documents regardless of revision', () => {
    const state = {
      ...old,
      entries: [a, b, c].map((d) => ({
        sourceId: d.sourceId,
        hash: d.hash,
        remoteIds: [`remote-${d.sourceId}`],
      })),
    };
    const p = planKbSync({ ...corpus, revision: 'new-repo-commit' }, state);
    expect(p.skip).toHaveLength(3);
    expect(p.create).toEqual([]);
    expect(p.update).toEqual([]);
    expect(p.delete).toEqual([]);
    expect(p.deletionBlocked).toBe(false);
  });
  it('rejects remote objects owned by multiple source identities', () => {
    expect(() =>
      planKbSync(
        { ...corpus, documents: [a] },
        {
          ...old,
          entries: [a, gone].map((d) => ({
            sourceId: d.sourceId,
            hash: d.hash,
            remoteIds: ['shared-object'],
          })),
        },
      ),
    ).toThrow(/remote.*owner|remote.*multiple|duplicate.*remote/i);
  });
  it('plans a move as create and blocked delete', () => {
    const p = planKbSync(
      { ...corpus, documents: [makeDoc('moved')] },
      { ...old, entries: [old.entries[0]] },
    );
    expect(p.create[0].sourceId).toBe('/zh-CN/ai/moved');
    expect(p.delete).toHaveLength(1);
    expect(p.deletionBlocked).toBe(true);
  });
  it('initializes explicitly empty state', () => {
    const p = planKbSync(corpus, { ...old, entries: [] });
    expect(p.create).toHaveLength(3);
    expect(p.delete).toEqual([]);
  });
  it('detects final Markdown changes caused by shared content', () => {
    const changed = makeDoc('a', 'body with changed shared content');
    const p = planKbSync(
      { ...corpus, documents: [changed] },
      { ...old, entries: [old.entries[0]] },
    );
    expect(p.update).toHaveLength(1);
  });
  it.each([
    { ...corpus, scope: 'other' },
    { ...corpus, complete: false },
    { ...corpus, documents: [] },
    { ...corpus, documents: [a, a] },
    { ...corpus, documents: [{ ...a, hash: 'f'.repeat(64) }] },
    { ...corpus, selection: [a.sourceId] },
    { ...corpus, schema: 2 },
  ])('rejects invalid or incomplete corpus %#', (value) => {
    expect(() => planKbSync(value as KbCorpus, old)).toThrow();
  });
  it.each([
    { ...old, generation: -1 },
    { ...old, entries: [old.entries[0], old.entries[0]] },
    { ...old, entries: [{ ...old.entries[0], hash: 'bad' }] },
    { ...old, entries: [{ ...old.entries[0], remoteIds: [] }] },
  ])('rejects invalid previous state %#', (value) => {
    expect(() => planKbSync(corpus, value)).toThrow();
  });
  it('refuses sample/full mismatch even when scope labels match', () => {
    expect(() =>
      planKbSync({ ...corpus, documents: [a], selection: [a.sourceId] }, old),
    ).toThrow(/selection/i);
    const selected = {
      ...old,
      selection: [a.sourceId],
      entries: [old.entries[0]],
    };
    expect(
      planKbSync(
        { ...corpus, documents: [a], selection: [a.sourceId] },
        selected,
      ).skip,
    ).toEqual([a.sourceId]);
  });
});
