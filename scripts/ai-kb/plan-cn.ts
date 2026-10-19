import { parseArgs } from 'node:util';
import {
  parseKbCorpus,
  parseKbSuccessfulState,
  planKbSync,
} from '../../src/lib/ai-kb/plan';
import { atomicWriteJson, readJson, requiredArg } from './files';

try {
  const { values } = parseArgs({
    options: {
      corpus: { type: 'string' },
      state: { type: 'string' },
      out: { type: 'string' },
    },
    strict: true,
  });
  const corpusPath = requiredArg(values.corpus, 'corpus'),
    statePath = requiredArg(values.state, 'state'),
    output = requiredArg(values.out, 'out');
  const corpus = parseKbCorpus(await readJson(corpusPath));
  const state = parseKbSuccessfulState(await readJson(statePath));
  const plan = planKbSync(corpus, state);
  await atomicWriteJson(output, plan, [corpusPath, statePath]);
  console.log(
    `KB plan: create=${plan.create.length} update=${plan.update.length} delete=${plan.delete.length} skip=${plan.skip.length} deletionBlocked=${plan.deletionBlocked}; ${output}`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : 'KB planning failed');
  process.exitCode = 1;
}
