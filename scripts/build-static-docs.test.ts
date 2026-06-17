import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import sharp from 'sharp';
import {
  clearOutputDir,
  getBestOptimizedJpgBuffer,
  getBestOptimizedPngBuffer,
  getPngVariantsForPath,
  optimizeStaticImages,
  pruneUnusedStaticAssets,
  replaceDocsBodySkeleton,
  stripStaticHtmlDataSidebarAttrs,
  stripStaticHtmlDataSlotAttrs,
  stripStaticHtmlDataCards,
  stripStaticHtmlDataIcons,
  stripStaticHtmlModulePreloads,
  stripStaticHtmlDataPrecedenceAttrs,
  stripStaticHtmlTestIds,
  verifyPatchedStaticHtml,
} from './build-static-docs.mjs';

const tempDirs: string[] = [];

describe('build-static-docs', () => {
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      clearOutputDir(dir);
    }
  });

  it('removes stale output assets before the next build snapshot is captured', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-portal-output-'));
    tempDirs.push(root);
    const staleAsset = path.join(root, 'static/assets/legacy.js');

    mkdirSync(path.dirname(staleAsset), { recursive: true });
    writeFileSync(staleAsset, 'legacy');

    expect(existsSync(staleAsset)).toBe(true);

    clearOutputDir(root);

    expect(existsSync(root)).toBe(false);
  });

  it('replaces the prerender skeleton without injecting duplicated docs body manifest scripts', () => {
    const patched = replaceDocsBodySkeleton(
      '<div class="space-y-4 py-2" data-testid="docs-content-skeleton" role="status"></div></div><aside class="flex flex-col gap-4 xl:hidden">',
      '<p>Static body</p>',
    );

    expect(patched).toContain('<div class="docs-body"><p>Static body</p></div>');
    expect(patched).not.toContain('window.__DOCS_STATIC_HTML__');
  });

  it('allows known heavyweight hydrated pages to retain docs skeleton markup in static html verification', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-portal-static-verify-'));
    tempDirs.push(root);
    const htmlPaths = [
      'static/en/realtime-media/broadcast-streaming/build/play-media/index.html',
      'static/en/realtime-media/cloud-recording/build/receive-notifications/index.html',
      'static/en/realtime-media/im/client-api/chat-group/manage-group-member-attributes/index.html',
      'static/en/realtime-media/im/client-api/chat-room/manage-chatroom-members/index.html',
    ];

    for (const relativePath of htmlPaths) {
      const htmlPath = path.join(root, relativePath);
      mkdirSync(path.dirname(htmlPath), { recursive: true });
      writeFileSync(
        htmlPath,
        '<div class="space-y-4 py-2" data-testid="docs-content-skeleton" role="status"></div>',
      );
    }

    expect(() =>
      verifyPatchedStaticHtml(root, {
        patchedHtmlFiles: 1,
        skippedWithoutBody: 0,
        skippedWithoutSkeleton: 0,
      }),
    ).not.toThrow();
  });

  it('optimizes only large raster assets in the final static output when the encoded result is smaller', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-portal-static-'));
    tempDirs.push(root);
    const staticDir = path.join(root, 'static/images');
    const largePng = path.join(staticDir, 'large.png');
    const smallPng = path.join(staticDir, 'small.png');
    const largeJpg = path.join(staticDir, 'large.jpg');
    const smallJpg = path.join(staticDir, 'small.jpg');

    mkdirSync(staticDir, { recursive: true });

    const largeBuffer = await sharp({
      create: {
        background: '#ffffff',
        channels: 3,
        height: 1200,
        width: 1200,
      },
    })
      .composite(
        Array.from({ length: 200 }, (_, index) => ({
          input: {
            create: {
              background: index % 2 === 0 ? '#1d4ed8' : '#f97316',
              channels: 3,
              height: 40,
              width: 1200,
            },
          },
          left: 0,
          top: index * 6,
        })),
      )
      .png({ compressionLevel: 0 })
      .toBuffer();
    const smallBuffer = await sharp({
      create: {
        background: '#222222',
        channels: 3,
        height: 32,
        width: 32,
      },
    })
      .png()
      .toBuffer();
    const largeJpgBuffer = await sharp({
      create: {
        background: '#f8fafc',
        channels: 3,
        height: 1200,
        width: 1200,
      },
    })
      .composite(
        Array.from({ length: 300 }, (_, index) => ({
          input: {
            create: {
              background: index % 2 === 0 ? '#2563eb' : '#f97316',
              channels: 3,
              height: 6,
              width: 1200,
            },
          },
          left: 0,
          top: index * 4,
        })),
      )
      .jpeg({ mozjpeg: false, quality: 100 })
      .toBuffer();
    const smallJpgBuffer = await sharp({
      create: {
        background: '#222222',
        channels: 3,
        height: 32,
        width: 32,
      },
    })
      .jpeg({ quality: 85 })
      .toBuffer();

    writeFileSync(largePng, largeBuffer);
    writeFileSync(smallPng, smallBuffer);
    writeFileSync(largeJpg, largeJpgBuffer);
    writeFileSync(smallJpg, smallJpgBuffer);

    const beforeLargeSize = statSync(largePng).size;
    const beforeLargeJpgSize = statSync(largeJpg).size;
    const beforeSmallBytes = readFileSync(smallPng);
    const beforeSmallJpgBytes = readFileSync(smallJpg);

    const summary = await optimizeStaticImages(root);

    expect(summary.candidates).toBe(2);
    expect(summary.optimizedFiles).toBe(2);
    expect(statSync(largePng).size).toBeLessThan(beforeLargeSize);
    expect(statSync(largeJpg).size).toBeLessThan(beforeLargeJpgSize);
    expect(readFileSync(smallPng)).toEqual(beforeSmallBytes);
    expect(readFileSync(smallJpg)).toEqual(beforeSmallJpgBytes);
  });

  it('prunes output assets with no static refs and no reachable static docs refs', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-portal-static-prune-'));
    tempDirs.push(root);
    const staticDir = path.join(root, 'static');
    const orphanAsset = path.join(staticDir, 'img/rtm2/create-project.png');
    const docsReferencedAsset = path.join(
      staticDir,
      'images/convo-ai-device-kit/power_on.png',
    );
    const htmlReferencedAsset = path.join(
      staticDir,
      'images/video-calling/video-calling-overview.png',
    );
    const builtDocReferencedAsset = path.join(
      staticDir,
      'images/conversational-ai/custom-llm-metadata-flow.svg',
    );
    const htmlPath = path.join(staticDir, 'en/introduction/index.html');

    mkdirSync(path.dirname(orphanAsset), { recursive: true });
    mkdirSync(path.dirname(docsReferencedAsset), { recursive: true });
    mkdirSync(path.dirname(htmlReferencedAsset), { recursive: true });
    mkdirSync(path.dirname(builtDocReferencedAsset), { recursive: true });
    mkdirSync(path.dirname(htmlPath), { recursive: true });

    writeFileSync(orphanAsset, 'orphan');
    writeFileSync(docsReferencedAsset, 'docs-ref');
    writeFileSync(htmlReferencedAsset, 'html-ref');
    writeFileSync(builtDocReferencedAsset, 'built-doc-ref');
    writeFileSync(
      htmlPath,
      '<img src="/images/video-calling/video-calling-overview.png" alt="overview" />',
    );
    mkdirSync(
      path.join(staticDir, 'en/ai/custom-llm'),
      { recursive: true },
    );
    writeFileSync(
      path.join(staticDir, 'en/ai/custom-llm/index.html'),
      '<img src="/images/conversational-ai/custom-llm-metadata-flow.svg" alt="custom llm" />',
    );

    const summary = pruneUnusedStaticAssets(root);

    expect(summary.deletedFiles).toBe(2);
    expect(summary.deletedBytes).toBe(14);
    expect(existsSync(orphanAsset)).toBe(false);
    expect(existsSync(docsReferencedAsset)).toBe(false);
    expect(existsSync(htmlReferencedAsset)).toBe(true);
    expect(existsSync(builtDocReferencedAsset)).toBe(true);
  });

  it('picks the smallest supported png variant instead of assuming one fixed quality', async () => {
    const source = await sharp({
      create: {
        background: '#ffffff',
        channels: 3,
        height: 800,
        width: 1200,
      },
    })
      .composite(
        Array.from({ length: 400 }, (_, index) => ({
          input: {
            create: {
              background: `rgb(${index % 255},${(index * 3) % 255},${(index * 7) % 255})`,
              channels: 3,
              height: 2,
              width: 1200,
            },
          },
          left: 0,
          top: index * 2,
        })),
      )
      .png({ compressionLevel: 0 })
      .toBuffer();

    const quality60 = await sharp(source)
      .png({
        compressionLevel: 9,
        effort: 10,
        palette: true,
        quality: 80,
      })
      .toBuffer();
    const quality20 = await sharp(source)
      .png({
        compressionLevel: 9,
        effort: 10,
        palette: true,
        quality: 20,
      })
      .toBuffer();
    const nonPalette60 = await sharp(source)
      .png({
        compressionLevel: 9,
        effort: 10,
        quality: 60,
      })
      .toBuffer();
    const quality40 = await sharp(source)
      .png({
        compressionLevel: 9,
        effort: 10,
        palette: true,
        quality: 40,
      })
      .toBuffer();
    const best = await getBestOptimizedPngBuffer(source);

    expect(quality20.length).toBeLessThan(quality60.length);
    expect(best.length).toBe(
      Math.min(
        source.length,
        quality60.length,
        quality40.length,
        quality20.length,
        nonPalette60.length,
      ),
    );
  });

  it('uses the more aggressive console-screenshot png variants only for approved buckets', () => {
    const regularVariants = getPngVariantsForPath(
      'images/video-calling/video-calling-overview.png',
    );
    const rtm2Variants = getPngVariantsForPath('img/rtm2/get-appid.png');
    const twilioVariants = getPngVariantsForPath(
      'images/conversational-ai/twilio/select-sip-trunk.png',
    );
    const studioVariants = getPngVariantsForPath(
      'images/conversational-ai/studio/configure-llm.png',
    );
    const difyEndpointVariants = getPngVariantsForPath(
      'images/conversational-ai/dify-endpoint.png',
    );
    const serverSdkFlowVariants = getPngVariantsForPath(
      'images/conversational-ai/server-sdk-flow.png',
    );
    const heroVariants = getPngVariantsForPath(
      'images/conversational-ai/voice-agent-hero.png',
    );

    expect(regularVariants.some((variant) => variant.name.includes('dither0'))).toBe(
      false,
    );
    expect(rtm2Variants.some((variant) => variant.name === 'palette-q10-dither0')).toBe(
      true,
    );
    expect(
      twilioVariants.some((variant) => variant.name === 'palette-q10-dither0'),
    ).toBe(true);
    expect(
      studioVariants.some((variant) => variant.name === 'palette-q10-dither0'),
    ).toBe(true);
    expect(
      difyEndpointVariants.some((variant) => variant.name === 'palette-q10-dither0'),
    ).toBe(true);
    expect(
      serverSdkFlowVariants.some((variant) => variant.name === 'palette-q10-dither0'),
    ).toBe(true);
    expect(heroVariants.some((variant) => variant.name.includes('dither0'))).toBe(
      false,
    );
    expect(rtm2Variants.length).toBeGreaterThan(regularVariants.length);
  });

  it(
    'can use console-screenshot-only variants to beat the current default png candidates',
    async () => {
      const rtm2Source = readFileSync('public/img/rtm2/get-appid.png');
      const twilioSource = readFileSync(
        'public/images/conversational-ai/twilio/select-sip-trunk.png',
      );
      const difyEndpointSource = readFileSync(
        'public/images/conversational-ai/dify-endpoint.png',
      );

    const regularBestForRtm2 = await getBestOptimizedPngBuffer(
      rtm2Source,
      getPngVariantsForPath('images/console/mock.png'),
    );
    const rtm2Best = await getBestOptimizedPngBuffer(
      rtm2Source,
      getPngVariantsForPath('img/rtm2/mock.png'),
    );
    const regularBestForTwilio = await getBestOptimizedPngBuffer(
      twilioSource,
      getPngVariantsForPath('images/conversational-ai/voice-agent-hero.png'),
    );
    const twilioBest = await getBestOptimizedPngBuffer(
      twilioSource,
      getPngVariantsForPath('images/conversational-ai/twilio/mock.png'),
    );
    const regularBestForDifyEndpoint = await getBestOptimizedPngBuffer(
      difyEndpointSource,
      getPngVariantsForPath('images/conversational-ai/voice-agent-hero.png'),
    );
    const difyEndpointBest = await getBestOptimizedPngBuffer(
      difyEndpointSource,
      getPngVariantsForPath('images/conversational-ai/dify-endpoint.png'),
    );

      expect(rtm2Best.length).toBeLessThan(regularBestForRtm2.length);
      expect(twilioBest.length).toBeLessThan(regularBestForTwilio.length);
      expect(difyEndpointBest.length).toBeLessThan(regularBestForDifyEndpoint.length);
    },
    15000,
  );

  it('picks the smallest supported jpg variant instead of assuming one fixed quality', async () => {
    const source = await sharp({
      create: {
        background: '#ffffff',
        channels: 3,
        height: 900,
        width: 1200,
      },
    })
      .composite(
        Array.from({ length: 300 }, (_, index) => ({
          input: {
            create: {
              background: `rgb(${index % 255},${(index * 5) % 255},${(index * 11) % 255})`,
              channels: 3,
              height: 3,
              width: 1200,
            },
          },
          left: 0,
          top: index * 3,
        })),
      )
      .jpeg({ mozjpeg: false, quality: 100 })
      .toBuffer();

    const quality80 = await sharp(source)
      .jpeg({
        mozjpeg: true,
        quality: 80,
      })
      .toBuffer();
    const quality70 = await sharp(source)
      .jpeg({
        mozjpeg: true,
        quality: 70,
      })
      .toBuffer();
    const quality60 = await sharp(source)
      .jpeg({
        mozjpeg: true,
        quality: 60,
      })
      .toBuffer();
    const best = await getBestOptimizedJpgBuffer(source);

    expect(best.length).toBe(
      Math.min(source.length, quality80.length, quality70.length, quality60.length),
    );
  });

  it('strips production-only test ids from static html after patching', () => {
    const stripped = stripStaticHtmlTestIds(
      '<main data-testid="docs-main-column"><div data-testid="docs-main-desktop-scroll"></div><div data-testid="docs-content-skeleton"></div></main>',
    );

    expect(stripped).not.toContain('data-testid="docs-main-column"');
    expect(stripped).not.toContain('data-testid="docs-main-desktop-scroll"');
    expect(stripped).not.toContain('data-testid="docs-content-skeleton"');
  });

  it('strips presentation-only data-icon attributes from static html after patching', () => {
    const stripped = stripStaticHtmlDataIcons(
      '<button><svg data-icon="inline-start" aria-hidden="true"></svg><span>Search</span></button>',
    );

    expect(stripped).not.toContain('data-icon="inline-start"');
    expect(stripped).toContain('aria-hidden="true"');
  });

  it('strips empty heading-card attributes from static html after patching', () => {
    const stripped = stripStaticHtmlDataCards(
      '<h2 class="group/heading" id="release-notes"><a data-card="" href="#release-notes">Release notes</a></h2>',
    );

    expect(stripped).not.toContain('data-card=""');
    expect(stripped).toContain('href="#release-notes"');
  });

  it('strips modulepreload links from final static html after patching', () => {
    const stripped = stripStaticHtmlModulePreloads(
      '<head><link rel="modulepreload" href="/assets/chunk-a.js"/><link rel="stylesheet" href="/assets/app.css" data-precedence="default"/><script type="module" async="">import("/assets/index.js")</script></head>',
    );

    expect(stripped).not.toContain('rel="modulepreload"');
    expect(stripped).toContain('rel="stylesheet"');
    expect(stripped).toContain('import("/assets/index.js")');
  });

  it('strips default style precedence attributes from static html after patching', () => {
    const stripped = stripStaticHtmlDataPrecedenceAttrs(
      '<link rel="stylesheet" href="/assets/app.css" data-precedence="default"/>',
    );

    expect(stripped).not.toContain('data-precedence="default"');
    expect(stripped).toContain('rel="stylesheet"');
    expect(stripped).toContain('href="/assets/app.css"');
  });

  it('strips non-styling data-slot attributes from static html after patching', () => {
    const stripped = stripStaticHtmlDataSlotAttrs(
      '<div data-slot="sidebar-wrapper"><button data-slot="button" data-variant="ghost">Open</button></div>',
    );

    expect(stripped).not.toContain('data-slot=');
    expect(stripped).toContain('data-variant="ghost"');
  });

  it('strips non-styling data-sidebar attributes from static html after patching', () => {
    const stripped = stripStaticHtmlDataSidebarAttrs(
      '<div data-sidebar="content"><div data-sidebar="group"></div></div>',
    );

    expect(stripped).not.toContain('data-sidebar=');
    expect(stripped).toContain('<div');
  });
});
