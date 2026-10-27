import { parseArgs } from 'node:util';
import { buildKbCorpus } from '../../src/lib/ai-kb/corpus.server';
import { readPublishedKbInputs } from './artifacts';
import { atomicWriteJson, readJson, requiredArg } from './files';

try {
  const { values } = parseArgs({
    options: {
      public: { type: 'string' },
      out: { type: 'string' },
      scope: { type: 'string' },
      revision: { type: 'string' },
      select: { type: 'string' },
    },
    strict: true,
  });
  const root = requiredArg(values.public, 'public'),
    output = requiredArg(values.out, 'out');
  const scope = requiredArg(values.scope, 'scope'),
    revision = requiredArg(values.revision, 'revision');
  let selectedSourceIds: string[] | undefined;
  if (values.select) {
    const selected = await readJson(values.select);
    if (
      !Array.isArray(selected) ||
      !selected.every((item) => typeof item === 'string')
    )
      throw new Error('Selection must be an array of source IDs');
    selectedSourceIds = selected;
  }
  const input = await readPublishedKbInputs(root, { selectedSourceIds });
  const corpus = await buildKbCorpus({
    ...input,
    scope,
    revision,
    selectedSourceIds,
  });
  await atomicWriteJson(output, corpus, values.select ? [values.select] : [], [
    root,
  ]);
  console.log(`Exported ${corpus.documents.length} KB documents to ${output}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'KB export failed');
  process.exitCode = 1;
}
