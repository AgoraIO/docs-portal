import { beforeEach, describe, expect, it, vi } from 'vitest';

const { statMock } = vi.hoisted(() => ({
  statMock: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: {
    stat: statMock,
  },
  stat: statMock,
}));

vi.mock('@/generated/docs-last-updated-manifest', () => ({
  DOCS_LAST_UPDATED_BY_PATH: {
    'content/docs/en/introduction/about-agora.md': '2026-07-06T05:32:13.000Z',
    'content/openapi/conversational-ai/rest-api.en.yaml':
      '2026-07-05T03:04:05.000Z',
  },
}));

import { resolveDocsLastUpdatedMetadata } from './docs-last-updated.server';

describe('resolveDocsLastUpdatedMetadata', () => {
  beforeEach(() => {
    statMock.mockReset();
  });

  it('uses the generated git manifest timestamp for the first tracked candidate', async () => {
    await expect(
      resolveDocsLastUpdatedMetadata([
        'content/docs/en/introduction/about-agora.md',
        'content/openapi/conversational-ai/rest-api.en.yaml',
      ]),
    ).resolves.toEqual({
      formatted: '2026/07/06 05:32:13',
      iso: '2026-07-06T05:32:13.000Z',
      source: 'git',
    });
    expect(statMock).not.toHaveBeenCalled();
  });

  it('falls back to filesystem mtime when generated metadata is unavailable', async () => {
    statMock.mockResolvedValue({
      mtime: new Date('2026-07-06T13:32:13.000Z'),
    });

    await expect(
      resolveDocsLastUpdatedMetadata(['content/docs/en/not-yet-committed.md']),
    ).resolves.toEqual({
      formatted: '2026/07/06 13:32:13',
      iso: '2026-07-06T13:32:13.000Z',
      source: 'file-mtime',
    });
  });

  it('uses the deterministic fallback timestamp when no metadata source is readable', async () => {
    statMock.mockRejectedValue(new Error('missing file'));

    await expect(
      resolveDocsLastUpdatedMetadata(['content/docs/en/missing.md']),
    ).resolves.toEqual({
      formatted: '1970/01/01 00:00:00',
      iso: '1970-01-01T00:00:00.000Z',
      source: 'fallback',
    });
  });

  it('normalizes absolute and platform-specific separators before matching metadata', async () => {
    await expect(
      resolveDocsLastUpdatedMetadata([
        `${process.cwd()}/content/docs/en/introduction/about-agora.md`,
      ]),
    ).resolves.toMatchObject({
      formatted: '2026/07/06 05:32:13',
      source: 'git',
    });
  });
});
