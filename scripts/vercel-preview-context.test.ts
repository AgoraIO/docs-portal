import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { load } from 'js-yaml';
import { expect, it, vi } from 'vitest';

type Workflow = {
  jobs: Record<
    string,
    { steps: { name: string; with?: { script?: string } }[] }
  >;
};

async function resolvePreview(input: string, eventName = 'workflow_dispatch') {
  const workflow = load(
    readFileSync('.github/workflows/vercel-deploy.yml', 'utf8'),
  ) as Workflow;
  const script = workflow.jobs['deploy-preview'].steps.find(
    (step) => step.name === 'Resolve preview context',
  )?.with?.script;
  if (!script) throw new Error('Missing preview context script');
  // Model expression rendering for the original workflow as well as the fixed
  // environment-variable input, so this executes the failing production path.
  const rendered = script.replaceAll(
    '${{ toJson(inputs.pr_number) }}',
    JSON.stringify(input),
  );
  const outputs: Record<string, string> = {};
  const list = vi.fn().mockResolvedValue({
    data: [
      { number: 1309, base: { ref: 'codex/cn-newdoc-html-api-migration' } },
    ],
  });
  await runInNewContext(`(async () => {${rendered}})()`, {
    process: { env: { PREVIEW_PR_NUMBER: input } },
    context: {
      eventName,
      ref: 'refs/heads/codex/unified-doc-feedback',
      repo: { owner: 'AgoraIO', repo: 'docs-portal' },
    },
    core: {
      setOutput: (key: string, value: string) => {
        outputs[key] = value;
      },
    },
    github: { rest: { pulls: { list } } },
  });
  return { outputs, list };
}

it('keeps a manual preview PR number usable by the comment API', async () => {
  const { outputs, list } = await resolvePreview('1309');
  expect(outputs.pr_number).toBe('1309');
  expect(Number(outputs.pr_number)).toBe(1309);
  expect(outputs.should_deploy).toBe('true');
  expect(list).not.toHaveBeenCalled();
});

it('resolves the branch PR when the manual PR number is empty', async () => {
  const { outputs, list } = await resolvePreview('');
  expect(outputs.pr_number).toBe('1309');
  expect(outputs.docs_region).toBe('cn');
  expect(list).toHaveBeenCalledTimes(1);
});

it('preserves branch-push preview resolution', async () => {
  const { outputs } = await resolvePreview('', 'push');
  expect(outputs).toMatchObject({
    should_deploy: 'true',
    pr_number: '1309',
    docs_region: 'cn',
  });
});

it.each(['not-a-number', '0', '"1309"'])(
  'rejects an invalid manual PR number before building: %s',
  async (input) => {
    await expect(resolvePreview(input)).rejects.toThrow(
      'Expected a positive integer',
    );
  },
);
