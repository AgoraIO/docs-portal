import { describe, expect, it } from 'vitest';
import { createCnSdkPublicationPolicy } from './cn-sdk-publication';

const android = '/zh-CN/api-reference/rtc/android';
const web = '/zh-CN/api-reference/rtc/web';
function policy(version = '4.7.0') {
  return createCnSdkPublicationPolicy([
    {
      scopeUrl: android,
      navScope: {
        defaultVersion: 'current',
        versions: [
          { id: 'current', label: `v${version}`, path: '(current)' },
          {
            id: '4.6.0',
            label: 'v4.6.0',
            path: '4.6.0',
            href: 'https://archive.example/rtc/android',
          },
        ],
      },
    },
    {
      scopeUrl: web,
      navScope: { versions: [{ id: 'current', label: 'v4.24.9', path: '.' }] },
    },
  ]);
}

describe('CN SDK publication policy', () => {
  it('excludes retained historical bodies and archive entries without changing ordinary docs', () => {
    const resolve = policy();
    expect(resolve(`${android}/channel`)).toEqual({
      searchable: true,
      version: '4.7.0',
    });
    expect(resolve(`${android}/4.6.0/channel`)).toEqual({ searchable: false });
    expect(resolve('https://archive.example/rtc/android')).toEqual({
      searchable: false,
    });
    expect(resolve('/zh-CN/reference/faq/token')).toEqual({ searchable: true });
    expect(resolve('/en/api-reference/rtc/android/4.6.0/channel')).toEqual({
      searchable: true,
    });
  });

  it('switches by publication configuration and retires unlisted old SDK bodies independently per platform', () => {
    const previousRelease = policy();
    const nextRelease = policy('4.7.1');
    expect(previousRelease(`${android}/channel`).version).toBe('4.7.0');
    expect(nextRelease(`${android}/channel`).version).toBe('4.7.1');
    expect(nextRelease(`${android}/4.7.0/channel`).searchable).toBe(false);
    expect(nextRelease(`${web}/client`)).toEqual({
      searchable: true,
      version: '4.24.9',
    });
  });

  it('uses the deepest override and configured current version instead of the largest version number', () => {
    const scopeUrl = '/zh-CN/api-reference/rtc/react-sdk';
    const resolve = createCnSdkPublicationPolicy([
      {
        scopeUrl,
        navScope: {
          versions: [
            { id: 'current', label: 'v2.5.0', path: '.' },
            { id: '6.0.0', label: 'v6.0.0', path: '6.0.0' },
          ],
          versionOverrides: [
            {
              path: 'web-sdk/deep',
              versions: [{ id: 'current', label: 'v1.0.0', path: '.' }],
            },
            {
              path: 'web-sdk',
              versions: [{ id: 'current', label: 'v4.22.0', path: '.' }],
            },
          ],
        },
      },
    ]);
    expect(resolve(`${scopeUrl}/hooks`).version).toBe('2.5.0');
    expect(resolve(`${scopeUrl}/6.0.0/hooks`).searchable).toBe(false);
    expect(resolve(`${scopeUrl}/web-sdk/client`).version).toBe('4.22.0');
    expect(resolve(`${scopeUrl}/web-sdk/deep/client`).version).toBe('1.0.0');
    expect(resolve(`${scopeUrl}/web-sdk/4.21.0/client`).searchable).toBe(false);
  });

  it('supports an explicit published path and does not label siblings as that version', () => {
    const resolve = createCnSdkPublicationPolicy([
      {
        scopeUrl: android,
        navScope: {
          defaultVersion: '4.8.0',
          versions: [
            { id: '4.8.0', label: 'v4.8.0', path: '4.8.0' },
            { id: '4.7.0', label: 'v4.7.0', path: '4.7.0' },
          ],
        },
      },
    ]);
    expect(resolve(`${android}/4.8.0/channel`)).toEqual({
      searchable: true,
      version: '4.8.0',
    });
    expect(resolve(`${android}/4.7.0/channel`).searchable).toBe(false);
    expect(resolve(`${android}/channel`).searchable).toBe(false);
  });

  it('does not fabricate a version from a navigation label or mask a parent with unversioned metadata', () => {
    const resolve = createCnSdkPublicationPolicy([
      {
        scopeUrl: android,
        navScope: {
          versions: [{ id: 'current', label: '当前版本', path: '.' }],
        },
      },
      { scopeUrl: `${android}/legacy`, navScope: { platformTabs: true } },
    ]);
    expect(resolve(`${android}/legacy/channel`)).toEqual({ searchable: true });
  });
});
