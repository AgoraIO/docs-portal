import { parseArgs } from 'node:util';
import { previewKbCorpus } from '../../src/lib/ai-kb/preview';
import { atomicWriteJson, readJson, requiredArg } from './files';

try {
  const { values } = parseArgs({
    options: {
      corpus: { type: 'string' },
      out: { type: 'string' },
      'target-chars': { type: 'string' },
    },
    strict: true,
  });
  const input = requiredArg(values.corpus, 'corpus');
  const output = requiredArg(values.out, 'out');
  const report = previewKbCorpus(
    await readJson(input),
    values['target-chars'] === undefined
      ? 3000
      : Number(values['target-chars']),
  );
  await atomicWriteJson(output, report, [input]);
  console.log(
    JSON.stringify({
      documents: report.documents,
      chunks: report.chunks.length,
      errors: report.issues.filter((x) => x.severity === 'error').length,
      warnings: report.issues.filter((x) => x.severity === 'warning').length,
      cloudVerified: false,
    }),
  );
  if (!report.ready) process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : 'KB preview failed');
  process.exitCode = 1;
}
