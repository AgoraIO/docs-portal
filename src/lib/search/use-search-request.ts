import { useEffect, useMemo, useState } from 'react';

/** Keep accepted results and their request metadata together, including empty arrays. */
export function useSearchRequest<T>(
  run: (query: string) => Promise<T>,
  delayMs: number,
  enabled: boolean,
) {
  const [search, setSearch] = useState('');
  const request = useMemo(
    () => ({ run, search, enabled }),
    [run, search, enabled],
  );
  const [state, setState] = useState<{
    request: typeof request;
    data?: T;
    error?: unknown;
  }>();
  const active = enabled && search.trim() !== '';
  useEffect(() => {
    if (!active) return;
    let accepted = true;
    const timer = window.setTimeout(async () => {
      try {
        const data = await request.run(request.search);
        if (accepted) setState({ request, data });
      } catch (error) {
        if (accepted) setState({ request, error });
      }
    }, delayMs);
    return () => {
      accepted = false;
      window.clearTimeout(timer);
    };
  }, [request, delayMs, active]);
  const current = active && state?.request === request;
  return {
    search,
    setSearch,
    data: active ? state?.data : undefined,
    error: current ? state.error : undefined,
    isLoading: active && !current,
  };
}
