// Page ranks describe visible cards, not raw Meilisearch section ranks.
export function pageRank(hits, targets) {
  const pages = [...new Set(hits.map(hit => hit.url.split(/[?#]/, 1)[0]))];
  const rank = pages.findIndex(page => targets.includes(page));
  return rank < 0 ? null : rank + 1;
}

export function compareQuality(baseline, candidate) {
  const current = new Map(candidate.map(item => [item.id, item]));
  const failures = [];
  for (const before of baseline) {
    const after = current.get(before.id);
    if (!after) failures.push({ id: before.id, reason: 'case-missing' });
    else if (before.status !== 'ok' || after.status !== 'ok')
      failures.push({ id: before.id, reason: 'request-error' });
    else if (before.totalHits > 0 && after.totalHits === 0)
      failures.push({ id: before.id, reason: 'new-zero-results' });
    else if (before.rank !== null && (after.rank === null || after.rank > before.rank))
      failures.push({
        id: before.id,
        reason: after.rank === null ? 'target-lost' : 'rank-dropped',
        before: before.rank,
        after: after.rank,
      });
    if (after && before.status === 'ok' && after.status === 'ok' && after.totalHits > 0)
      for (const [family, count] of Object.entries(before.familyCounts ?? {}))
        if (count > 0 && !(after.familyCounts?.[family] > 0))
          failures.push({ id: before.id, reason: 'family-lost', family });
  }
  return failures;
}
