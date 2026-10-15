import { spawnSync } from 'node:child_process';
import { realpath } from 'node:fs/promises';
import { basename, dirname, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { createBailianClient } from '../../src/lib/ai-kb/bailian-client.server';
import { parseKbTarget } from '../../src/lib/ai-kb/bailian-config';
import { parseKbCorpus, planKbSync } from '../../src/lib/ai-kb/plan';
import {
  type DeletionApproval,
  runKbSync,
  type SyncAdapter,
} from '../../src/lib/ai-kb/sync.server';
import { openSyncStore } from '../../src/lib/ai-kb/sync-state.server';
import { atomicWriteJson, readJson, requiredArg } from './files';

async function canonical(path: string): Promise<string> {
  try {
    return await realpath(path);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    const parent = dirname(resolve(path));
    if (parent === resolve(path)) throw e;
    return resolve(await canonical(parent), basename(path));
  }
}
try {
  const { values } = parseArgs({
    options: {
      config: { type: 'string' },
      corpus: { type: 'string' },
      'state-dir': { type: 'string' },
      receipt: { type: 'string' },
      apply: { type: 'boolean' },
      'new-demo': { type: 'boolean' },
      'delete-approval': { type: 'string' },
    },
    strict: true,
  });
  const configPath = requiredArg(values.config, 'config'),
    corpusPath = requiredArg(values.corpus, 'corpus'),
    directory = requiredArg(values['state-dir'], 'state-dir'),
    receipt = requiredArg(values.receipt, 'receipt');
  const target = parseKbTarget(await readJson(configPath));
  const corpus = parseKbCorpus(await readJson(corpusPath));
  const stateRoot = await canonical(directory),
    receiptPath = await canonical(receipt);
  const inputs = [
    configPath,
    corpusPath,
    ...(values['delete-approval'] ? [values['delete-approval']] : []),
  ];
  if (receiptPath === stateRoot || receiptPath.startsWith(stateRoot + sep))
    throw new Error('Receipt must be outside state tree');
  for (const path of inputs) {
    const p = await canonical(path);
    if (p === stateRoot || p.startsWith(stateRoot + sep))
      throw new Error('Inputs must be outside state tree');
  }
  if (values.apply && !process.env.BAILIAN_API_KEY)
    throw new Error('MISSING_API_KEY');
  const store = await openSyncStore({ directory, target });
  try {
    const plan = planKbSync(corpus, store.successful());
    const counts = {
      create: plan.create.length,
      update: plan.update.length,
      delete: plan.delete.length,
      skip: plan.skip.length,
    };
    const base = {
      schema: 1,
      revision: corpus.revision,
      identity: store.snapshot.identity,
      counts,
    };
    // Validate output aliases before permitting any cloud action.
    await atomicWriteJson(
      receipt,
      {
        ...base,
        status: values.apply ? 'applying' : 'preview',
        remoteWrites: values.apply ? null : 0,
        generation: store.snapshot.generation,
        pending: store.snapshot.pending.length,
        deletionBlocked: plan.deletionBlocked,
      },
      inputs,
      [directory],
    );
    if (!values.apply) {
      console.log('KB sync preview saved; remoteWrites=0');
    } else {
      if (!store.snapshot.indexId && !values['new-demo'])
        throw new Error('Explicit --new-demo initialization required');
      const client = createBailianClient({
        workspaceId: target.workspaceId,
        apiKey: process.env.BAILIAN_API_KEY ?? '',
        onRequestId: async (requestId) => {
          const s = store.snapshot;
          await store.save(
            {
              ...s,
              generation: s.generation + 1,
              requestIds: [...new Set([...(s.requestIds ?? []), requestId])],
            },
            s.generation,
          );
        },
      });
      let remoteWrites = 0;
      const adapter: SyncAdapter = {
        ...client,
        lease: async (input) => {
          remoteWrites++;
          return client.lease(input);
        },
        putFile: async (input) => {
          remoteWrites++;
          return client.putFile(input);
        },
        registerFile: async (input) => {
          remoteWrites++;
          return client.registerFile(input);
        },
        createIndex: async (input) => {
          remoteWrites++;
          return client.createIndex(input);
        },
        submitImport: async (input) => {
          remoteWrites++;
          return client.submitImport(input);
        },
        deleteDocuments: async (input) => {
          remoteWrites++;
          return client.deleteDocuments(input);
        },
      };
      let status = 'failed';
      try {
        const result = await runKbSync({
          corpus,
          store,
          adapter,
          verifyRevision: async (previous, next) => {
            if (
              !/^[a-f0-9]{40}$/.test(previous) ||
              !/^[a-f0-9]{40}$/.test(next)
            )
              return false;
            return (
              spawnSync(
                'git',
                ['merge-base', '--is-ancestor', previous, next],
                { cwd: process.cwd(), stdio: 'ignore' },
              ).status === 0
            );
          },
          ...(values['delete-approval']
            ? {
                deletionApproval: (await readJson(
                  values['delete-approval'],
                )) as DeletionApproval,
              }
            : {}),
        });
        status = result.status;
        if (status !== 'complete') process.exitCode = 2;
      } catch {
        status = store.snapshot.pending.some(
          (p) => p.intent || p.phase === 'needs-reconciliation',
        )
          ? 'needs-reconciliation'
          : 'failed';
        process.exitCode = 1;
      }
      await atomicWriteJson(
        receipt,
        {
          ...base,
          status,
          remoteWrites,
          generation: store.snapshot.generation,
          indexId: store.snapshot.indexId,
          requestIds: store.snapshot.requestIds ?? [],
          pending: store.snapshot.pending.map((p) => ({
            id: p.id,
            sourceId: p.sourceId,
            phase: p.phase,
            ...(p.errorCode ? { errorCode: p.errorCode } : {}),
            ...(p.requestId ? { requestId: p.requestId } : {}),
            ...(p.intent ? { intent: p.intent } : {}),
          })),
        },
        inputs,
        [directory],
      );
      console.log(`KB sync ${status}; remoteWriteAttempts=${remoteWrites}`);
    }
  } finally {
    await store.close();
  }
} catch {
  console.error(
    'KB_SYNC_FAILED: check target, corpus, credentials, output paths and state lock',
  );
  process.exitCode = 1;
}
