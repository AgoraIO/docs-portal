import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';

type WorkflowStep = {
  'continue-on-error'?: boolean;
  env?: Record<string, string>;
  if?: string;
  name?: string;
  run?: string;
  uses?: string;
  with?: Record<string, unknown>;
};

type VercelDeployWorkflow = {
  jobs: {
    'deploy-preview': {
      steps: WorkflowStep[];
    };
    'deploy-production': {
      steps: WorkflowStep[];
    };
  };
};

const workflowPath = resolve('.github/workflows/vercel-deploy.yml');

async function previewSteps(): Promise<WorkflowStep[]> {
  const workflow = load(
    await readFile(workflowPath, 'utf8'),
  ) as VercelDeployWorkflow;

  return workflow.jobs['deploy-preview'].steps;
}

async function productionSteps(): Promise<WorkflowStep[]> {
  const workflow = load(
    await readFile(workflowPath, 'utf8'),
  ) as VercelDeployWorkflow;

  return workflow.jobs['deploy-production'].steps;
}

function stepIndex(steps: WorkflowStep[], name: string): number {
  return steps.findIndex((step) => step.name === name);
}

describe('Vercel deployment workflow', () => {
  it('publishes the preview URL before replaying global search golden queries', async () => {
    const steps = await previewSteps();
    const deployIndex = stepIndex(steps, 'Deploy prebuilt output');
    const summaryIndex = stepIndex(steps, 'Write workflow summary');
    const commentIndex = stepIndex(steps, 'Comment preview URL');
    const replayIndex = stepIndex(steps, 'Replay Global search golden queries');
    const uploadIndex = stepIndex(
      steps,
      'Upload Global search replay evidence',
    );
    const replay = steps[replayIndex];
    const upload = steps[uploadIndex];

    expect(deployIndex).toBeGreaterThanOrEqual(0);
    expect(summaryIndex).toBeGreaterThan(deployIndex);
    expect(commentIndex).toBeGreaterThan(summaryIndex);
    expect(replayIndex).toBeGreaterThan(commentIndex);
    expect(uploadIndex).toBeGreaterThan(replayIndex);

    expect(upload.if).toBe('always()');
    expect(upload.uses).toBe('actions/upload-artifact@v4');
    expect(upload.with).toMatchObject({
      name: 'global-search-replay-preview',
      path: 'global-search-replay-preview.json',
    });

    expect(replay.run).toContain(
      'bun run search:replay -- --gate=preview-blockers --out=global-search-replay-preview.json',
    );
    expect(replay['continue-on-error']).toBe(true);

    const previewWorkflow = JSON.stringify(steps);
    expect(previewWorkflow).not.toContain('ALGOLIA_ADMIN_API_KEY');
    expect(previewWorkflow).not.toContain('bun run search:sync');

    expect(replay.env).toMatchObject({
      VITE_ALGOLIA_APP_ID: '$' + '{{ secrets.VITE_ALGOLIA_APP_ID }}',
      VITE_ALGOLIA_INDEX_NAME: '$' + '{{ vars.ALGOLIA_INDEX_NAME }}',
      VITE_ALGOLIA_SEARCH_API_KEY:
        '$' + '{{ secrets.VITE_ALGOLIA_SEARCH_API_KEY }}',
      VITE_SEARCH_RANKING_V2: 'true',
    });
    expect(replay.if).toBe(
      "steps.preview-context.outputs.should_deploy == 'true'",
    );
  });

  it('dispatches search only after publishing the production site', async () => {
    const steps = await productionSteps();
    const deploy = stepIndex(steps, 'Deploy prebuilt output');
    const dispatch = stepIndex(steps, 'Start Global search sync');
    expect(deploy).toBeGreaterThanOrEqual(0);
    expect(dispatch).toBeGreaterThan(deploy);
    expect(steps[dispatch].if).toBeUndefined();
    expect(steps[dispatch]['continue-on-error']).toBe(true);
    expect(steps[dispatch].run).toContain(
      'gh workflow run global-search.yml --ref release/prod',
    );
    expect(steps[dispatch].env?.RELEASE_SHA).toContain(
      'inputs.release_sha || github.sha',
    );
    expect(JSON.stringify(steps)).not.toMatch(
      /ALGOLIA_ADMIN_API_KEY|bun run search:(sync|replay)/,
    );
  });

  it('verifies the release before updating the index and reports search failures separately', async () => {
    const workflow = load(
      await readFile('.github/workflows/global-search.yml', 'utf8'),
    ) as {
      on: Record<string, unknown>;
      concurrency: { group: string; queue: string };
      jobs: { 'sync-search': { if: string; steps: WorkflowStep[] } };
    };
    expect(Object.keys(workflow.on)).toEqual(['workflow_dispatch']);
    expect(workflow.concurrency.queue).toBe('max');
    const job = workflow.jobs['sync-search'];
    expect(job.if).toContain("github.ref == 'refs/heads/release/prod'");
    const steps = job.steps;
    const verify = stepIndex(steps, 'Verify deployed revision');
    const sync = stepIndex(steps, 'Sync Algolia search index');
    const replay = stepIndex(steps, 'Replay Global search golden queries');
    const upload = stepIndex(steps, 'Upload Global search replay evidence');
    expect(steps[0].with?.ref).toBe('release/prod');
    expect(verify).toBeGreaterThan(0);
    expect(steps[verify].run).toContain('git rev-parse HEAD');
    expect(sync).toBeGreaterThan(verify);
    expect(steps[sync].run).toContain('bun run search:sync');
    expect(replay).toBeGreaterThan(sync);
    expect(steps[replay].run).toBe(
      'bun run search:replay -- --out=global-search-replay.json --wait-for-index',
    );
    expect(steps[sync]['continue-on-error']).toBeUndefined();
    expect(steps[replay]['continue-on-error']).toBeUndefined();
    expect(upload).toBeGreaterThan(replay);
    expect(steps[upload].if).toBe('always()');
  });
});

describe('Vercel preview search indexing', () => {
  it('blocks indexing before the preview build', async () => {
    const steps = await previewSteps();
    const noindexIndex = stepIndex(steps, 'Block search indexing on preview');
    const buildIndex = stepIndex(steps, 'Build with Vercel');

    expect(noindexIndex).toBeGreaterThanOrEqual(0);
    expect(buildIndex).toBeGreaterThan(noindexIndex);
    expect(steps[noindexIndex].run).toBe(
      'node scripts/apply-preview-noindex.mjs',
    );
  });

  it('never blocks indexing on production', async () => {
    const steps = await productionSteps();

    expect(
      steps.some((step) => step.run?.includes('apply-preview-noindex')),
    ).toBe(false);
  });
});
