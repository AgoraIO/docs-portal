import { createHash, randomUUID } from 'node:crypto';
import { type BailianClient, BailianError } from './bailian-client.server';
import type { KbTarget } from './bailian-config';
import type { KbCorpus, KbDocument } from './corpus';
import { parseKbCorpus, planKbSync } from './plan';
import type {
  PendingOperation,
  RemoteDocument,
  SyncStore,
} from './sync-state.server';
export type SyncAdapter = Pick<
  BailianClient,
  | 'lease'
  | 'putFile'
  | 'registerFile'
  | 'createIndex'
  | 'submitImport'
  | 'completedJob'
  | 'documents'
  | 'deleteDocuments'
>;
export type DeletionApproval = {
  identity: string;
  generation: number;
  sourceIds: string[];
};
export type RetrievalVerifier = (input: {
  target: KbTarget;
  document: KbDocument;
  remote: RemoteDocument[];
}) => Promise<boolean>;
export async function runKbSync(input: {
  corpus: KbCorpus;
  store: SyncStore;
  adapter: SyncAdapter;
  verify?: RetrievalVerifier;
  deletionApproval?: DeletionApproval;
  verifyRevision?: (previous: string, next: string) => Promise<boolean>;
}) {
  const { store, adapter } = input;
  const corpus = parseKbCorpus(input.corpus);
  const plan = planKbSync(corpus, store.successful());
  const existing = store.snapshot;
  // Validate every pending operation before any remote write, including removed sources.
  for (const p of existing.pending) {
    const d = corpus.documents.find((d) => d.sourceId === p.sourceId);
    if (p.deleted ? !!d : !d || d.hash !== p.desiredHash)
      throw new Error('Pending operation requires its original corpus');
  }
  const unapproved = plan.delete.filter(
    (e) =>
      !existing.pending.some((p) => p.sourceId === e.sourceId && p.deleted),
  );
  if (unapproved.length) {
    const a = input.deletionApproval;
    if (
      !a ||
      a.identity !== existing.identity ||
      a.generation !== existing.generation ||
      JSON.stringify([...a.sourceIds].sort()) !==
        JSON.stringify(plan.delete.map((e) => e.sourceId).sort())
    )
      throw new Error('Explicit matching deletion approval required');
  }
  const corpusHash = createHash('sha256')
    .update(
      JSON.stringify({
        ...corpus,
        documents: [...corpus.documents].sort((a, b) =>
          a.sourceId.localeCompare(b.sourceId),
        ),
      }),
    )
    .digest('hex');
  if (existing.run && existing.run.corpusHash !== corpusHash) {
    if (existing.pending.length)
      throw new Error('Pending operation requires original corpus revision');
    if (
      existing.run.revision === corpus.revision ||
      !input.verifyRevision ||
      !(await input.verifyRevision(existing.run.revision, corpus.revision))
    )
      throw new Error('Unverified or superseded corpus revision');
  }
  if (existing.run?.corpusHash !== corpusHash) {
    await store.save(
      {
        ...existing,
        generation: existing.generation + 1,
        run: { revision: corpus.revision, corpusHash },
      },
      existing.generation,
    );
  }
  async function saveOperation(
    p: PendingOperation,
    extra: Partial<ReturnType<typeof snapshot>> = {},
  ) {
    const s = store.snapshot;
    await store.save(
      {
        ...s,
        ...extra,
        generation: s.generation + 1,
        pending: [
          ...s.pending.filter((o) => o.id !== p.id),
          structuredClone(p),
        ],
      },
      s.generation,
    );
  }
  function snapshot() {
    return store.snapshot;
  }
  async function intent(
    p: PendingOperation,
    action: NonNullable<PendingOperation['intent']>,
  ) {
    p.intent = action;
    await saveOperation(p);
  }
  async function uncertain(p: PendingOperation): Promise<never> {
    p.phase = 'needs-reconciliation';
    await saveOperation(p);
    throw new Error(
      'Remote result needs reconciliation; automatic writes stopped',
    );
  }
  async function cleanup(p: PendingOperation) {
    const indexId = store.snapshot.indexId;
    if (!indexId) throw new Error('Missing bound index');
    let live = await adapter.documents({ indexId });
    const remaining = p.oldRemote
      .map((r) => r.documentId)
      .filter((id) => live.some((r) => r.documentId === id));
    if (!remaining.length) {
      delete p.intent;
      return;
    }
    if (p.intent) return uncertain(p);
    await intent(p, 'delete');
    try {
      await adapter.deleteDocuments({ indexId, documentIds: remaining });
    } catch (e) {
      // Definite HTTP rejection permits retry. A transport error leaves the intent unknown.
      if (
        e instanceof BailianError &&
        /^HTTP_(400|401|403|404|409|422|429)$/.test(e.code)
      ) {
        delete p.intent;
        await saveOperation(p);
      }
      throw e;
    }
    live = await adapter.documents({ indexId });
    if (remaining.some((id) => live.some((r) => r.documentId === id)))
      throw new Error('Deletion absence not confirmed; reconcile before retry');
    delete p.intent;
  }
  const work = [...existing.pending];
  for (const document of [...plan.create, ...plan.update])
    if (!work.some((p) => p.sourceId === document.sourceId))
      work.push({
        id: randomUUID(),
        sourceId: document.sourceId,
        desiredHash: document.hash,
        phase: 'prepared',
        oldRemote:
          existing.entries.find((e) => e.sourceId === document.sourceId)
            ?.remote ?? [],
        newRemote: [],
      });
  for (const e of plan.delete)
    if (!work.some((p) => p.sourceId === e.sourceId))
      work.push({
        id: randomUUID(),
        sourceId: e.sourceId,
        desiredHash: e.hash,
        phase: 'cleanup-pending',
        deleted: true,
        oldRemote:
          existing.entries.find((x) => x.sourceId === e.sourceId)?.remote ?? [],
        newRemote: [],
      });
  for (const p of work) {
    try {
      const document = corpus.documents.find((d) => d.sourceId === p.sourceId);
      if (p.phase === 'needs-reconciliation')
        throw new Error(
          'Remote result needs reconciliation; automatic writes stopped',
        );
      if (p.intent && p.intent !== 'delete') return uncertain(p);
      if (!existing.pending.some((o) => o.id === p.id)) await saveOperation(p);
      if (p.phase === 'prepared') {
        if (!document) throw new Error('Missing document');
        const bytes = new TextEncoder().encode(document.content);
        p.phase = 'uploading';
        await intent(p, 'lease');
        const lease = await adapter.lease({
          categoryId: existing.target.categoryId,
          fileName: `kb-${p.id}.md`,
          bytes,
        });
        await intent(p, 'put');
        await adapter.putFile({ lease, bytes });
        await intent(p, 'register');
        const tags = [
          `kb:${existing.identity.slice(0, 24)}`,
          ...document.metadata.products.map((v) => `product:${v}`),
          ...document.metadata.platforms.map((v) => `platform:${v}`),
        ];
        p.fileId = await adapter.registerFile({
          leaseId: lease.leaseId,
          categoryId: existing.target.categoryId,
          tags,
          originalFileUrl: new URL(
            document.metadata.url,
            existing.target.origin,
          ).toString(),
        });
        delete p.intent;
        p.phase = 'registered';
        await saveOperation(p);
      }
      if (p.phase === 'registered') {
        if (!p.fileId) throw new Error('Missing registered file');
        const indexId = store.snapshot.indexId;
        if (!indexId) {
          await intent(p, 'create');
          const created = await adapter.createIndex({
            name: existing.target.name,
            fileIds: [p.fileId],
          });
          p.jobId = created.jobId;
          delete p.intent;
          p.phase = 'importing';
          await saveOperation(p, {
            indexId: created.indexId,
            bootstrap: { operationId: p.id, jobId: created.jobId },
          });
        } else {
          await intent(p, 'import');
          p.jobId = await adapter.submitImport({
            indexId,
            fileIds: [p.fileId],
          });
          delete p.intent;
          p.phase = 'importing';
          await saveOperation(p);
        }
      }
      if (p.phase === 'importing') {
        if (!p.fileId || !p.jobId || !store.snapshot.indexId)
          throw new Error('Missing import evidence');
        const rows = await adapter.completedJob({
          indexId: store.snapshot.indexId,
          jobId: p.jobId,
          fileIds: [p.fileId],
        });
        if (!rows) return { status: 'indexing' as const };
        // The adapter must prove the file-to-document mapping; never infer it from a name.
        if (
          rows.length !== 1 ||
          rows[0].jobId !== p.jobId ||
          rows[0].code !== 'FINISH' ||
          rows[0].status !== 'FINISH'
        )
          throw new Error('Incomplete document job evidence');
        p.newRemote = [
          { fileId: p.fileId, documentId: rows[0].documentId, jobId: p.jobId },
        ];
        p.phase = 'verifying';
        await saveOperation(p);
      }
      if (p.phase === 'verifying') {
        if (!document || !store.snapshot.indexId || !p.newRemote.length)
          throw new Error('Missing retrieval verification inputs');
        if (
          !input.verify ||
          !(await input.verify({
            target: { ...existing.target, indexId: store.snapshot.indexId },
            document,
            remote: p.newRemote,
          }))
        )
          return { status: 'verifying' as const };
        p.phase = 'cleanup-pending';
        await saveOperation(p);
      }
      if (p.phase === 'cleanup-pending') {
        if (p.oldRemote.length) await cleanup(p);
        const s = store.snapshot;
        // Successful projection and removal of the pending journal are one durable commit.
        await store.save(
          {
            ...s,
            generation: s.generation + 1,
            entries: [
              ...s.entries.filter((e) => e.sourceId !== p.sourceId),
              ...(!p.deleted
                ? [
                    {
                      sourceId: p.sourceId,
                      hash: p.desiredHash,
                      remote: p.newRemote,
                    },
                  ]
                : []),
            ],
            pending: s.pending.filter((o) => o.id !== p.id),
          },
          s.generation,
        );
      }
    } catch (error) {
      const saved = store.snapshot.pending.find((o) => o.id === p.id);
      if (saved) {
        if (error instanceof BailianError) {
          saved.errorCode = /^[a-zA-Z0-9_.-]{1,96}$/.test(error.code)
            ? error.code
            : 'REMOTE_FAILURE';
          if (error.requestId && /^[a-zA-Z0-9_-]{1,128}$/.test(error.requestId))
            saved.requestId = error.requestId;
        } else saved.errorCode = 'SYNC_FAILURE';
        await saveOperation(saved);
      }
      throw error;
    }
  }
  return { status: 'complete' as const };
}
