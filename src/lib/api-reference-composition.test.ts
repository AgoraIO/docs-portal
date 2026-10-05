import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildApiReferenceRail } from './api-reference-sidebar.testkit';

const META = JSON.parse(
  readFileSync(
    path.join(process.cwd(), 'content/docs/en/api-reference/meta.json'),
    'utf8',
  ),
) as { pages: unknown[] };
const API_REFERENCE_OVERVIEW = readFileSync(
  path.join(process.cwd(), 'content/docs/en/api-reference/api-ref/index.mdx'),
  'utf8',
);

function groupTitles(): string[] {
  return (META.pages as Array<Record<string, unknown>>)
    .filter((p) => p && typeof p === 'object' && p.type === 'group')
    .map((p) => String(p.title));
}

describe('api reference composition', () => {
  it('has one API reference separator and no SDK/REST split', () => {
    const seps = (META.pages as unknown[]).filter(
      (p) => typeof p === 'string' && /^---.*---$/.test(p),
    );
    expect(seps).toContain('---API reference---');
    expect(seps).not.toContain('---SDK API reference---');
    expect(seps).not.toContain('---REST API reference---');
  });

  it('removes the IoT Channel Management lane', () => {
    expect(JSON.stringify(META.pages)).not.toContain(
      'iot-channel-management-rest-api',
    );
  });

  it('includes Fastboard and all REST-only product groups', () => {
    const titles = groupTitles();
    for (const t of [
      'Fastboard',
      'Cloud Recording',
      'Cloud Transcoding',
      'Media Gateway',
      'Media Pull',
      'Media Push',
      'Speech-to-Text',
      'Analytics',
      'Console',
      'Extensions Marketplace',
    ]) {
      expect(titles).toContain(t);
    }
    expect(titles).not.toContain('Media Player Kit');
  });

  it('does not expose Media Player Kit hosted SDK entries in the API reference overview', () => {
    expect(API_REFERENCE_OVERVIEW).not.toContain('Media Player Kit');
  });

  it('uses RTC Voice Only names within the Realtime Communication API reference group', () => {
    const realtimeCommunicationGroup = API_REFERENCE_OVERVIEW.match(
      /"Realtime Communication": \{([\s\S]*?)\n {4}\},/,
    )?.[1];

    expect(realtimeCommunicationGroup).toContain(
      'description: "This product uses the RTC SDK and RTC (Voice Only) SDK."',
    );
    expect(realtimeCommunicationGroup).toContain('icon: "rtc"');
    expect(realtimeCommunicationGroup).not.toContain('icon: "video-calling"');
    expect(API_REFERENCE_OVERVIEW).toContain(
      'description: "RTC (Voice Only) SDK for Android API reference with current and previous major-version coverage.",\n      product: "Realtime Communication",\n      sdk: "RTC (Voice Only) SDK",\n      stack: "Android",\n      title: "RTC (Voice Only) SDK for Android",',
    );
    expect(API_REFERENCE_OVERVIEW).toContain(
      'description: "RTC (Voice Only) SDK for iOS API reference with current and previous major-version coverage.",\n      product: "Realtime Communication",\n      sdk: "RTC (Voice Only) SDK",\n      stack: "iOS",\n      title: "RTC (Voice Only) SDK for iOS",',
    );
    expect(API_REFERENCE_OVERVIEW).not.toContain('sdk: "Voice SDK"');
  });

  it('gives each mapped product a REST API leaf at the right url, and SDK-only products none', () => {
    const rail = buildApiReferenceRail();
    const flat = rail.flatMap((n) =>
      n.type === 'section' ? [n, ...n.children] : [n],
    );
    const restUrlOf = (product: string) => {
      const sec = flat.find(
        (n) => n.type === 'section' && n.title === product,
      ) as Extract<(typeof flat)[number], { type: 'section' }> | undefined;
      const leaf = sec?.children.find(
        (c) => c.type === 'page' && c.title === 'REST API',
      );
      return (leaf as { url?: string } | undefined)?.url;
    };
    expect(restUrlOf('Voice & Video')).toBe('/en/api-reference/api-ref/rtc');
    expect(restUrlOf('Chat')).toBe('/en/api-reference/api-ref/im');
    expect(restUrlOf('Flexible Classroom')).toBe(
      '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    );
    expect(restUrlOf('Cloud Recording')).toBe(
      '/en/api-reference/api-ref/cloud-recording',
    );
    expect(restUrlOf('Analytics')).toBe(
      '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
    );
    expect(restUrlOf('Console')).toBe(
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    );
    expect(restUrlOf('On-Premise Recording')).toBeUndefined();
    expect(restUrlOf('Media Player Kit')).toBeUndefined();
    expect(restUrlOf('IoT')).toBeUndefined();
  });
});
