import { expect, it, vi } from 'vitest';
import { waitForEnglishSearch } from './wait-for-english-search';

it('retries until an English document can be found through the public search client', async () => {
  const search = vi
    .fn()
    .mockRejectedValueOnce(new Error('filter is not ready'))
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ url: '/en/unrelated' }])
    .mockResolvedValueOnce([{ url: '/en/ai/get-started/quickstart#setup' }]);
  await waitForEnglishSearch(search, 4, 0);
  expect(search).toHaveBeenCalledTimes(4);
});

it('fails before replay if the English document never becomes searchable', async () => {
  await expect(waitForEnglishSearch(async () => [], 2, 0)).rejects.toThrow(
    /English search/,
  );
});
