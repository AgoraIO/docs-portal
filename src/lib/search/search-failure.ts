export type SearchFailure = {
  stage: 'network' | 'http' | 'parse' | 'request';
  code:
    | 'network_error'
    | 'http_error'
    | 'invalid_response'
    | 'search_unavailable';
  status: number | null;
};

export class SearchRequestError extends Error implements SearchFailure {
  constructor(
    public stage: SearchFailure['stage'],
    public code: SearchFailure['code'],
    public status: number | null = null,
  ) {
    super(
      status ? `Search unavailable (HTTP ${status})` : 'Search unavailable',
    );
    this.name = 'SearchRequestError';
  }
}

/** Never forward arbitrary exception messages, response bodies or upstream URLs. */
export function searchFailureDetails(error: unknown): SearchFailure {
  return error instanceof SearchRequestError
    ? { stage: error.stage, code: error.code, status: error.status }
    : { stage: 'request', code: 'search_unavailable', status: null };
}
