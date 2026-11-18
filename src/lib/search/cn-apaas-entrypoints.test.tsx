import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProductSdkDownloads } from '../../components/docs-overview/ProductSdkDownloads';
import { SdksCatalog } from '../../components/docs-overview/SdksCatalog';
import { buildSdkDownloadProductNavItems } from '../../components/docs-overview/sdk-download-navigation';
import { zhCNSdkDownloadPlatforms } from '../../components/docs-overview/sdk-downloads-data.zh-cn';
import { isRetiredCnDocsPath } from '../retired-cn-docs.mjs';
import { normalizeCnProductFacets } from './cn-products';
import { exportPublishedCnRecords } from './cn-records.server';
import { isPublicCnSearchUrl } from './cn-search-urls.mjs';

afterEach(() => vi.unstubAllGlobals());

describe('Chinese aPaaS discovery entries', () => {
  it.each(['/zh-CN', ''])(
    'hides IoT search URLs with prefix %s while retaining meeting and RTSA',
    (prefix) => {
      for (const path of [
        '/solutions/iot-apaas',
        '/solutions/iot-apaas/reference/downloads#sdk',
        '/api-reference/iot-apaas/client-api/call',
        '/solutions/%69ot-apaas/',
      ]) {
        expect(isPublicCnSearchUrl(`${prefix}${path}`)).toBe(false);
      }
      for (const path of [
        '/realtime-media/meeting',
        '/api-reference/meeting/restful/api/create-room',
        '/realtime-media/rtsa',
        '/api-reference/teleoperation/iot/api/device',
        '/solutions/iot-apaas-other',
      ]) {
        expect(isPublicCnSearchUrl(`${prefix}${path}`)).toBe(true);
      }
      expect(isRetiredCnDocsPath('/zh-CN/solutions/iot-apaas')).toBe(false);
    },
  );

  it('excludes IoT guides and API pages from search exports', async () => {
    const paths = [
      '/zh-CN/solutions/iot-apaas',
      '/zh-CN/api-reference/iot-apaas/client-api/call',
      '/zh-CN/realtime-media/meeting',
    ];
    const records = await exportPublishedCnRecords({
      pages: paths.map((url) => ({ url, title: '产品说明' })),
      routes: paths.map((url) => ({
        url,
        canonicalPath: url,
        markdownPath: `${url}.md`,
      })),
      readMarkdown: async () => '# 产品说明\n\n## 接入\n\n产品接入说明。',
      readRenderedHtml: async () => '<h2 id="接入">接入</h2>',
    });
    expect(records.length).toBeGreaterThan(0);
    expect(
      records.every((record) =>
        record.url.startsWith('/realtime-media/meeting'),
      ),
    ).toBe(true);
  });

  it('hides IoT product facets while retaining meeting and independent RTSA', () => {
    expect(
      normalizeCnProductFacets({
        iot: 8,
        'iot-apaas': 10,
        'flexible-classroom': 2,
        meeting: 4,
        rtsa: 6,
        teleoperation: 3,
      }),
    ).toEqual({ meeting: 4, rtsa: 6, teleoperation: 3 });
  });

  it('omits aPaaS downloads and navigation without hiding meeting or RTSA', () => {
    const ids = buildSdkDownloadProductNavItems(
      zhCNSdkDownloadPlatforms,
      'zh-CN',
    ).map((item) => item.id);
    expect(ids).not.toContain('iot');
    expect(ids).not.toContain('flexible-classroom');
    expect(ids).toContain('meeting');
    expect(ids).toContain('rtsa');
  });

  it('preserves the legacy Linux RTSA package as history in the RTSA group', () => {
    const products = zhCNSdkDownloadPlatforms.flatMap((platform) => [
      ...platform.core,
      ...(platform.addOns ?? []),
    ]);
    const rtsa = products.find((product) => product.id === 'rtsa');
    const legacy = rtsa?.versions.find(
      (version) =>
        version.downloadLink ===
        'https://download.agora.io/rtsasdk/release/Agora-RTSALite-AutAcAj-x86_64-linux-gnu-v1.8.0.tgz',
    );
    expect(legacy).toBeDefined();
    expect(legacy?.label).toContain('1.8.0');
    expect(legacy?.latestVariant).toBeUndefined();
    render(
      <ProductSdkDownloads
        product="rtsa"
        platform="c"
        versionIds={['1.8.0-rtsa-x86_64-linux-gnu']}
      />,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      legacy?.downloadLink,
    );
  });

  it('ignores an old IoT download filter and shows the remaining catalog', () => {
    window.history.replaceState(null, '', '/zh-CN/reference/sdks?product=iot');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ status: 'unauthenticated' }, { status: 401 }),
      ),
    );
    render(<SdksCatalog locale="zh-CN" />);
    expect(
      screen.queryByRole('article', { name: '物联网 aPaaS SDK' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('article', { name: '媒体流加速 RTSA SDK' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('article', { name: '智能云会议引擎 SDK' }),
    ).toBeInTheDocument();
  });
});
