import { setTimeout as delay } from 'node:timers/promises';

// Exercise the same locale and category filters as the English search dialog.
export async function waitForEnglishSearch(
  search: (query: string) => Promise<readonly { url: string }[]>,
  attempts = 30,
  intervalMs = 2000,
) {
  const target = '/en/ai/get-started/quickstart';
  let reason = 'expected page was absent';
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const results = await search('voice agent quickstart');
      if (results.some(({ url }) => url.split('#')[0] === target)) return;
      reason = 'expected page was absent';
    } catch (error) {
      reason = error instanceof Error ? error.message : String(error);
    }
    if (attempt < attempts) await delay(intervalMs);
  }
  throw new Error(
    `English search did not return ${target} after ${attempts} probes: ${reason}`,
  );
}
