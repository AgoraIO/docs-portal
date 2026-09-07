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

describe('Vercel preview deployment workflow', () => {
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

  it('keeps Production replay diagnostic and non-blocking after search sync', async () => {
    const steps = await productionSteps();
    const syncIndex = stepIndex(steps, 'Sync Algolia search index');
    const replayIndex = stepIndex(steps, 'Replay Global search golden queries');
    const replay = steps[replayIndex];

    expect(syncIndex).toBeGreaterThanOrEqual(0);
    expect(replayIndex).toBeGreaterThan(syncIndex);
    expect(replay.run).toContain(
      'bun run search:replay -- --out=global-search-replay.json',
    );
    expect(replay.run).not.toContain('--gate=');
    expect(replay['continue-on-error']).toBe(true);
  });
});
