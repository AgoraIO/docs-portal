import { render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { DocsContentBody } from './DocsContentBody';

const state = vi.hoisted(() => ({
  pending: false,
  promise: Promise.resolve(),
}));
vi.mock('@/lib/source.browser', () => ({
  useDocsContent: () => {
    if (state.pending) throw state.promise;
    return <h3 id="v462-1">v4.6.2</h3>;
  },
}));
afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});
it('scrolls to the requested version after a lazy platform body becomes available', async () => {
  window.history.replaceState(
    null,
    '',
    '/en/realtime-media/video/reference/release-notes/ios#v462-1',
  );
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  state.pending = true;
  let resolve = () => {};
  state.promise = new Promise<void>((done) => {
    resolve = done;
  });
  render(
    <Suspense fallback={<p>Loading</p>}>
      <DocsContentBody contentPath="ios.mdx" />
    </Suspense>,
  );
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  state.pending = false;
  resolve();
  expect(
    await screen.findByRole('heading', { name: 'v4.6.2' }),
  ).toBeInTheDocument();
  await waitFor(() =>
    expect(scroll).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'auto' }),
    ),
  );
});
