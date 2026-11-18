import { describe, expect, it } from 'vitest';
import type { DocsMeta } from '../docs-meta-schema';
import { resolveCnSdkPublication } from './cn-sdk-publication.server';

const metadata = import.meta.glob<DocsMeta>(
  '/content/docs/zh-CN/api-reference/**/meta.json',
  { eager: true, import: 'default' },
);

describe('published SDK metadata', () => {
  it('declares an actual SDK version for every configured current API scope and override', () => {
    const unversioned = Object.entries(metadata).flatMap(([filename, meta]) => {
      const lists = [
        meta.navScope?.versions,
        ...(meta.navScope?.versionOverrides?.map((entry) => entry.versions) ??
          []),
      ];
      return lists.flatMap(
        (versions) =>
          versions
            ?.filter(
              (version) =>
                version.id === 'current' &&
                !/^v?\d+\.\d+(?:\.\d+)?(?:[-+][\w.-]+)?$/.test(version.label),
            )
            .map(() => filename) ?? [],
      );
    });
    expect(unversioned).toEqual([]);
  });

  it('keeps React and the nested Web SDK on their independently published versions', () => {
    expect(
      resolveCnSdkPublication('/zh-CN/api-reference/rtc/react-sdk/hooks'),
    ).toEqual({ searchable: true, version: '2.5.0' });
    expect(
      resolveCnSdkPublication(
        '/zh-CN/api-reference/rtc/react-sdk/web-sdk/overview',
      ),
    ).toEqual({ searchable: true, version: '4.22.0' });
  });
});
