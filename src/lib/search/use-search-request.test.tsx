import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useSearchRequest } from './use-search-request';

it('waits for the new request when a user returns to an earlier query', async () => {
  let count = 0;
  const run = async () => {
    count++;
    if (count === 1) return { items: ['first'], snapshot: 'first' };
    return new Promise<{ items: string[]; snapshot: string }>(() => {});
  };
  const { result } = renderHook(() => useSearchRequest(run, 0, true));
  act(() => result.current.setSearch('Token'));
  await waitFor(() => expect(result.current.data?.snapshot).toBe('first'));
  act(() => result.current.setSearch('missing'));
  await waitFor(() => expect(count).toBe(2));
  act(() => result.current.setSearch('Token'));
  expect(result.current.isLoading).toBe(true);
});
