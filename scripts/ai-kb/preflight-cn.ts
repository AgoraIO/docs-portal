import { parseArgs } from 'node:util';
import { createBailianClient } from '../../src/lib/ai-kb/bailian-client.server';
import {
  parseKbTarget,
  targetIdentity,
} from '../../src/lib/ai-kb/bailian-config';
import { readJson, requiredArg } from './files';

try {
  const { values } = parseArgs({
    options: { config: { type: 'string' } },
    strict: true,
  });
  const target = parseKbTarget(
    await readJson(requiredArg(values.config, 'config')),
  );
  if (!process.env.BAILIAN_API_KEY) throw new Error('MISSING_API_KEY');
  const client = createBailianClient({
    workspaceId: target.workspaceId,
    apiKey: process.env.BAILIAN_API_KEY,
  });
  await client.listFiles({ categoryId: target.categoryId });
  if (target.indexId) await client.documents({ indexId: target.indexId });
  console.log(
    JSON.stringify({
      status: 'read-access-confirmed',
      identity: targetIdentity(target),
      writePermissionVerified: false,
      remoteWrites: 0,
    }),
  );
} catch (error) {
  console.error(
    error instanceof Error && error.message === 'MISSING_API_KEY'
      ? 'MISSING_API_KEY'
      : 'KB_PREFLIGHT_FAILED',
  );
  process.exitCode = 1;
}
