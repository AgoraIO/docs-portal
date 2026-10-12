import { readFileSync } from 'node:fs';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getMDXComponents } from '../mdx';
import { AccountGuidance } from './AccountGuidance';

vi.mock('@/lib/analytics/posthog', () => ({
  captureAccountFlow: vi.fn(),
  getDocsAnonymousId: async () => null,
  synchronizeDocsAccount: async () => {},
}));

const contentPath = 'zh-CN/reference/demo/shengdong-entertainment.mdx';
const source = readFileSync(`content/docs/${contentPath}`, 'utf8');
const hrefs = [
  ...source.matchAll(/<Card title="立即体验" href="([^"]+)"/g),
].map((match) => match[1]);
const Card = getMDXComponents(undefined, { contentPath })
  .Card as ComponentType<{
  title: string;
  href: string;
}>;

beforeEach(() => {
  window.sessionStorage.clear();
  window.history.replaceState(
    null,
    '',
    '/zh-CN/reference/demo/shengdong-entertainment',
  );
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify({ status: 'unauthenticated' }), {
          status: 401,
        }),
    ),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it.each(hrefs)(
  'offers guidance for the actual demo link %s only once per session',
  async (href) => {
    render(
      <AccountGuidance enabled>
        <Card title="立即体验" href={href} />
      </AccountGuidance>,
    );
    const link = screen.getByRole('link', { name: '立即体验' });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(fireEvent.click(link)).toBe(true);
    expect(await screen.findByRole('dialog')).toBeVisible();
    await waitFor(() =>
      expect(window.sessionStorage.getItem('docs-account-guidance-shown')).toBe(
        '1',
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: '稍后再说' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(link);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  },
);
