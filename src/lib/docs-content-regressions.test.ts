import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

const docsRoot = resolve(process.cwd(), 'content/docs/en');
const allDocsRoot = resolve(process.cwd(), 'content/docs');
const voiceDocsRoot = resolve(docsRoot, 'realtime-media/voice');

describe('docs content regressions', () => {
  function expectListItemToContainNestedOrderedList(
    compiled: string,
    marker: string,
  ) {
    const markerIndex = compiled.indexOf(marker);
    expect(markerIndex).toBeGreaterThanOrEqual(0);

    const nestedListIndex = compiled.indexOf('<_components.ol>', markerIndex);
    const itemCloseIndex = compiled.indexOf('</_components.li>', markerIndex);

    expect(nestedListIndex).toBeGreaterThan(markerIndex);
    expect(nestedListIndex).toBeLessThan(itemCloseIndex);
  }

  function expectCompiledSectionToHaveSingleOrderedList(
    compiled: string,
    startMarker: string,
    endMarker: string,
    itemCount: number,
  ) {
    const startIndex = compiled.indexOf(startMarker);
    const endIndex = compiled.indexOf(endMarker, startIndex + 1);

    expect(startIndex).toBeGreaterThanOrEqual(0);
    expect(endIndex).toBeGreaterThan(startIndex);

    const section = compiled.slice(startIndex, endIndex);

    expect(section.match(/<_components\.ol>/g) ?? []).toHaveLength(1);
    expect(section.match(/<_components\.li>/g) ?? []).toHaveLength(itemCount);
  }

  function expectMarkersToStayInSameOrderedList(
    compiled: string,
    markers: string[],
  ) {
    const markerIndexes = markers.map((marker) => {
      const markerIndex = compiled.indexOf(marker);
      expect(markerIndex).toBeGreaterThanOrEqual(0);

      return markerIndex;
    });
    const listRanges: Array<{ start: number; end: number }> = [];
    const openListIndexes: number[] = [];

    for (const match of compiled.matchAll(/<\/?_components\.ol>/g)) {
      const token = match[0];
      const index = match.index ?? 0;

      if (token === '<_components.ol>') {
        openListIndexes.push(index);
      } else {
        const start = openListIndexes.pop();

        if (start !== undefined) {
          listRanges.push({ start, end: index });
        }
      }
    }

    const containingList = listRanges.find(({ start, end }) => {
      return markerIndexes.every((markerIndex) => {
        return markerIndex > start && markerIndex < end;
      });
    });

    expect(containingList).toBeDefined();
  }

  function expectListItemToContainMarkers(
    compiled: string,
    startMarker: string,
    containedMarkers: string[],
  ) {
    const startIndex = compiled.indexOf(startMarker);
    expect(startIndex).toBeGreaterThanOrEqual(0);

    const itemCloseIndex = compiled.indexOf('</_components.li>', startIndex);
    expect(itemCloseIndex).toBeGreaterThan(startIndex);

    for (const marker of containedMarkers) {
      const markerIndex = compiled.indexOf(marker, startIndex);

      expect(markerIndex).toBeGreaterThan(startIndex);
      expect(markerIndex).toBeLessThan(itemCloseIndex);
    }
  }

  function listMarkdownFiles(root: string): string[] {
    const files: string[] = [];

    for (const entry of readdirSync(root, { withFileTypes: true })) {
      const entryPath = join(root, entry.name);

      if (entry.isDirectory()) {
        files.push(...listMarkdownFiles(entryPath));
        continue;
      }

      if (entry.isFile() && /\.(?:md|mdx)$/.test(entry.name)) {
        files.push(entryPath);
      }
    }

    return files;
  }

  function readVoiceDoc(relativePath: string) {
    return readFileSync(resolve(voiceDocsRoot, relativePath), 'utf8');
  }

  function readDoc(relativePath: string) {
    return readFileSync(resolve(docsRoot, relativePath), 'utf8');
  }

  function aiModelsDocSlugs(file: string) {
    const relativePath = relative(docsRoot, file).replace(/\\/g, '/');
    const withoutExtension = relativePath.replace(/\.mdx?$/, '');
    const segments = withoutExtension.split('/');

    if (segments.at(-1) === 'index') {
      return segments.slice(0, -1);
    }

    return segments;
  }

  it('keeps block-style lists and notes out of GFM table cells', () => {
    const blockSyntaxPattern =
      /(?:<\/?(?:ul|ol|li)\b|\*\*Note\*\*|<Note\b|:::note|:::info|:::warning|:::caution|\[!NOTE\])/i;
    const inlineTableCellBlockPattern = new RegExp(
      String.raw`^\s*\|.*${blockSyntaxPattern.source}.*$`,
      'i',
    );
    const offenders: string[] = [];

    for (const file of listMarkdownFiles(allDocsRoot)) {
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);

      for (let index = 0; index < lines.length; index += 1) {
        if (inlineTableCellBlockPattern.test(lines[index])) {
          offenders.push(
            `${relative(process.cwd(), file)}:${index + 1}: ${lines[index]}`,
          );
        }

        if (!/^\s*\|.*\|.*\|\s*\S.*[^|]\s*$/.test(lines[index])) {
          continue;
        }

        const blockStart = index;
        const blockLines: string[] = [];
        let cursor = index + 1;

        while (
          cursor < lines.length &&
          !/^\s*\|\s*$/.test(lines[cursor]) &&
          !/^\s*\|.*\|/.test(lines[cursor])
        ) {
          blockLines.push(lines[cursor]);
          cursor += 1;
        }

        if (
          cursor < lines.length &&
          /^\s*\|\s*$/.test(lines[cursor]) &&
          blockSyntaxPattern.test(blockLines.join('\n'))
        ) {
          offenders.push(
            `${relative(process.cwd(), file)}:${blockStart + 1}-${cursor + 1}: multiline table cell contains block syntax`,
          );
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('keeps docs free of four-colon directive fences', () => {
    const offenders: string[] = [];

    for (const file of listMarkdownFiles(allDocsRoot)) {
      const lines = readFileSync(file, 'utf8').split('\n');

      lines.forEach((line, index) => {
        const match = line.match(/^\s*(:+)($|[^:])/);

        if (match?.[1].length === 4) {
          offenders.push(
            `${relative(process.cwd(), file)}:${index + 1}: ${line.trim()}`,
          );
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it('keeps PR 285 code and table recovery pages from regressing to placeholders', () => {
    const multihostDocs = [
      'realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx',
      'realtime-media/video/build/manage-connection-and-quality/optimize-multihost-video.mdx',
      'solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx',
    ];

    for (const relativePath of multihostDocs) {
      const content = readDoc(relativePath);

      expect(content).not.toContain('not available yet');
      expect(content).toContain(
        '<Tabs defaultValue="android" groupId="platform">',
      );
      expect(content).not.toContain('<PlatformStructured platform=');
      expect(content.match(/<TabsContent value=/g) ?? []).toHaveLength(3);
      expect(content).toContain('```java');
      expect(content).toContain('```swift');
      expect(content).toContain('```dart');
      expect(content).toContain('onTranscodedStreamLayoutInfo');
      expect(content).toContain(
        'didTranscodedStreamLayoutInfoUpdatedWithUserId',
      );
    }

    const cloudRecording = readDoc(
      'realtime-media/cloud-recording/reference/restful-api.mdx',
    );

    expect(cloudRecording).toContain(
      '`POST /v1/apps/{appid}/cloud_recording/acquire`',
    );
    expect(cloudRecording).toContain(
      '`GET /v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/query`',
    );
    expect(cloudRecording).toContain('`GET /v1/ncs/ip`');

    const cloudRecordingApiOverview = readDoc(
      'api-reference/api-ref/cloud-recording/index.mdx',
    );

    expect(cloudRecordingApiOverview).not.toMatch(
      /\]\((?:authentication|acquire|start|update|update-layout|query|stop|get-ncs-ip)\)/,
    );
    expect(cloudRecordingApiOverview).toContain(
      '[Acquire a cloud recording resource](/en/api-reference/api-ref/cloud-recording/acquire)',
    );
    expect(cloudRecordingApiOverview).toContain(
      '[Query message notification server IP addresses](/en/api-reference/api-ref/cloud-recording/get-ncs-ip)',
    );

    const whiteboard = readDoc(
      'realtime-media/whiteboard/overview/core-concepts.md',
    );

    expect(whiteboard).toContain(
      '| Permission | `admin` | `writer` | `reader` |',
    );
    expect(whiteboard.match(/^\|:-----------\|/gm) ?? []).toHaveLength(3);
    expect(whiteboard).toContain(
      '| Query the progress of a specific file-conversion task | Yes | Yes | Yes |',
    );

    const whiteboardStatus = readDoc(
      'realtime-media/whiteboard/reference/status-page.md',
    );

    expect(whiteboardStatus).toContain(
      '| Metric   | Description | Calculation method   |',
    );
    expect(whiteboardStatus).toContain(
      '| Video fluency | Measures video playback smoothness',
    );
    expect(whiteboardStatus).toContain(
      'Interactive Whiteboard reliability and user experience status',
    );

    const srtStreaming = readDoc(
      'realtime-media/rtmp-gateway/reference/srt-streaming.md',
    );

    expect(srtStreaming).toContain('`srtlive-rtcpush-prod-{region}.agoramdn.com`');
    expect(srtStreaming).toContain('- `na`: North America');
    expect(srtStreaming).toContain(
      '[Get streaming key](../build/set-up-and-authenticate/quickstart-best-practices#get-streaming-key)',
    );

    const simulcasting = readDoc(
      'realtime-media/video/build/manage-connection-and-quality/simulcasting.mdx',
    );

    expect(simulcasting).toContain(
      '| Feature | Simulcasting | Dual-stream video |',
    );
    expect(simulcasting).toContain(
      '| Small stream automatically adapts video attributes | No | Yes |',
    );

    const htAvatar = readDoc(
      'realtime-media/marketplace/build/add-video-and-ar-effects/ht-3d-avatar.mdx',
    );

    expect(htAvatar).toContain('| Key | Description |');
    expect(htAvatar).toContain(
      '| [`htARRenderEnable`](#htarrenderenable) | Turns AR special effects on or off. |',
    );
    expect(htAvatar).toContain(
      '| `maxFaces` | Integer. The maximum number of supported faces. The value range is `[1, 5]`. |',
    );

    const geofencingDocs = [
      'realtime-media/broadcast-streaming/build/secure-and-protect-channels/geofencing.mdx',
      'realtime-media/video/build/manage-connection-and-quality/geofencing.mdx',
      'solutions/interactive-live-streaming/build/secure-and-protect-channels/geofencing.mdx',
      'realtime-media/voice/build/manage-connection-and-quality/geofencing.mdx',
    ];

    for (const relativePath of geofencingDocs) {
      const content = readDoc(relativePath);

      expect(content).toContain(
        "| Designated access zone | User's location | Zone actually accessed by the SDK | User experience |",
      );
      expect(content).not.toContain('<thead>');
      expect(content).not.toContain('<td rowspan="2">');
    }

    const securityDocs = [
      'realtime-media/cloud-recording/reference/security.mdx',
      'realtime-media/video/reference/security.mdx',
      'realtime-media/marketplace/reference/security.mdx',
      'realtime-media/rtmp-gateway/reference/security.md',
    ];

    for (const relativePath of securityDocs) {
      const content = readDoc(relativePath);

      expect(content).toMatch(/\|\s*Customer Account Data\s*\|/);
      expect(content).toMatch(/\|\s*Information Security Sub-Committee\s*\|/);
      expect(content).not.toMatch(/<\/?(details|summary)>/);
    }

    const activeFence = readDoc(
      'realtime-media/marketplace/build/add-moderation-and-intelligence/activefence.mdx',
    );

    expect(activeFence).toContain('| Title and key | Type | Meaning |');
    expect(activeFence).toContain('| `requestId` | Text | Request ID of the screenshot |');

    const rtmDownloads = readDoc('realtime-media/rtm/reference/downloads.md');

    const rtmDownloadPlatforms = [
      'web',
      'android',
      'ios',
      'macos',
      'linux-java',
      'linux-cpp',
      'windows',
      'unity',
      'flutter',
    ];

    expect(rtmDownloads).toContain(
      '<Tabs defaultValue="web" groupId="platform">',
    );
    expect(rtmDownloads).not.toContain('<PlatformStructured platform=');
    expect(rtmDownloads.match(/<TabsContent value=/g) ?? []).toHaveLength(
      rtmDownloadPlatforms.length,
    );
    for (const platform of rtmDownloadPlatforms) {
      expect(rtmDownloads).toContain(`<TabsContent value="${platform}">`);
    }
    expect(rtmDownloads).toContain('| `agora-rtm_sdk.jar` | `/app/libs/` |');
    expect(rtmDownloads).toContain("pod 'AgoraRtm_iOS'");
    expect(rtmDownloads).toContain("pod 'AgoraRtm_macOS'");
    expect(rtmDownloads).toContain('<artifactId>agora-rtm-sdk</artifactId>');
    expect(rtmDownloads).toContain(
      'target_link_libraries($' + '{TARGET_NAME} agora_rtm_sdk pthread)',
    );
    expect(rtmDownloads).toContain('`agora_rtm_sdk.lib`');
    expect(rtmDownloads).toContain(
      '| Android | `Plugins/Android` | `/Assets/Plugins/Android/` |',
    );
    expect(rtmDownloads).toContain('agora_rtm: ^2.2.1');
    expect(rtmDownloads).not.toMatch(/<\/?(details|summary|PlatformWrapper)>/);

    const rtmpCoreConcepts = readDoc(
      'realtime-media/rtmp-gateway/reference/core-concepts.md',
    );

    expect(rtmpCoreConcepts).toContain('| Channel profile | Description |');
    expect(rtmpCoreConcepts).toContain('| `LIVE_BROADCASTING` |');

    const rtmpNotifications = readDoc(
      'realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications.md',
    );

    expect(rtmpNotifications).toContain('| `eventType` | Event name | Description |');
    expect(rtmpNotifications).toContain('| `3` | `live_stream_aborted` |');

    const whiteboardReleaseNotes = readDoc(
      'realtime-media/whiteboard/overview/release-notes.mdx',
    );

    expect(whiteboardReleaseNotes).toContain(
      '|Domain                      |Covered region       |',
    );
    expect(whiteboardReleaseNotes).toContain(
      "implementation 'com.github.netless-io:whiteboard-android:<version>'",
    );
    expect(whiteboardReleaseNotes).toContain("pod 'Whiteboard/Whiteboard-YYKit'");
    expect(whiteboardReleaseNotes).not.toContain('<Admonition');
    expect(whiteboardReleaseNotes).not.toContain('<Link to="{{Global.');
    expect(whiteboardReleaseNotes).not.toContain(
      '/interactive-whiteboard/get-started/get-started-sdk',
    );
  });

  it('keeps agora analytics call inspector headings free of inline raw anchors', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'content/docs/en/solutions/agora-analytics/build/call-search.md',
      ),
      'utf8',
    );

    expect(source).not.toMatch(/^#{1,6} .*<a name=".*"><\/a>/m);
  });

  it('keeps android broadcast streaming setup steps nested in ordered lists', async () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'content/docs/en/realtime-media/broadcast-streaming/quickstart.mdx',
      ),
      'utf8',
    );

    const compiled = String(
      await compile(source, {
        jsx: true,
      }),
    );

    expectListItemToContainNestedOrderedList(
      compiled,
      'href="https://developer.android.com/studio/projects/create-project"',
    );
    expectListItemToContainNestedOrderedList(
      compiled,
      '{"Add a new activity to your project."}',
    );
  });

  it('compiles the realtime video quickstart without MDX tag nesting errors', async () => {
    const source = readFileSync(
      resolve(process.cwd(), 'content/docs/en/realtime-media/video/index.mdx'),
      'utf8',
    );

    await expect(
      compile(source, {
        jsx: true,
      }),
    ).resolves.toBeDefined();
  });

  it('uses nested canonical build routes for voice docs content', async () => {
    const { source } = await import('./source.server');

    expect(
      source.getPage(
        [
          'realtime-media',
          'voice',
          'build',
          'set-up-token-authentication',
          'use-tokens',
        ],
        'en',
      ),
    ).toBeDefined();
    expect(
      source.getPage(
        [
          'realtime-media',
          'voice',
          'build',
          'set-up-your-project',
          'compile-run-sample-project',
        ],
        'en',
      ),
    ).toBeDefined();
    expect(
      source.getPage(
        [
          'realtime-media',
          'voice',
          'build',
          'manage-connection-and-quality',
          'cloud-proxy',
        ],
        'en',
      ),
    ).toBeDefined();

    expect(
      source.getPage(['realtime-media', 'voice', 'build', 'use-tokens'], 'en'),
    ).toBeUndefined();
    expect(
      source.getPage(
        ['realtime-media', 'voice', 'build', 'compile-run-sample-project'],
        'en',
      ),
    ).toBeUndefined();
    expect(
      source.getPage(['realtime-media', 'voice', 'build', 'cloud-proxy'], 'en'),
    ).toBeUndefined();
  });

  it('uses specific titles for English top-level overview pages', async () => {
    const { source } = await import('./source.server');

    const overviewPages = [
      {
        expectedTitle: 'Voice Agent overview',
        slugs: ['ai'],
      },
      {
        expectedTitle: 'Realtime Media overview',
        slugs: ['realtime-media', 'overview'],
      },
      {
        expectedTitle: 'Solutions overview',
        slugs: ['solutions'],
      },
      {
        expectedTitle: 'Reference overview',
        slugs: ['api-reference'],
      },
    ];

    for (const { expectedTitle, slugs } of overviewPages) {
      expect(source.getPage(slugs, 'en')?.data.title).toBe(expectedTitle);
    }
  });

  it('keeps voice token server deployment steps in continuous ordered lists', async () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/voice/build/set-up-token-authentication/deploy-token-server.mdx',
      ),
      'utf8',
    );

    const compiled = String(
      await compile(source, {
        jsx: true,
      }),
    );

    expectCompiledSectionToHaveSingleOrderedList(
      compiled,
      'Use the NPM package',
      'Deploy with Docker',
      4,
    );
    expectCompiledSectionToHaveSingleOrderedList(
      compiled,
      'Deploy with Docker',
      'Manual local deployment',
      3,
    );
    expectCompiledSectionToHaveSingleOrderedList(
      compiled,
      'Manual local deployment',
      'Reference',
      4,
    );
  });

  it('keeps representative voice calling steps in continuous ordered lists', async () => {
    const releaseNotes = String(
      await compile(readVoiceDoc('reference/release-notes.mdx'), {
        jsx: true,
      }),
    );
    const notifications = String(
      await compile(
        readVoiceDoc('build/optimize-and-operate/receive-notifications.mdx'),
        {
          jsx: true,
        },
      ),
    );
    const quickstart = String(
      await compile(readVoiceDoc('quickstart.mdx'), {
        jsx: true,
      }),
    );

    expectListItemToContainMarkers(releaseNotes, 'Local audio mixing', [
      'startLocalAudioMixer',
      'local video mixing feature',
    ]);
    expectListItemToContainMarkers(releaseNotes, 'External MediaProjection', [
      'setExternalMediaProjection',
      'more flexible screen capture',
    ]);
    expectMarkersToStayInSameOrderedList(notifications, [
      'Set up Go',
      'Create a Go project for your server',
      'Run your Go server',
      'Create a public URL for your server',
      'Test the server',
    ]);
    expectListItemToContainNestedOrderedList(
      quickstart,
      'href="https://developer.android.com/studio/projects/create-project"',
    );
  });

  it('keeps voice calling markdown free of hidden and ambiguous rendering syntax', () => {
    const offenders: string[] = [];

    for (const file of listMarkdownFiles(voiceDocsRoot)) {
      const relativePath = relative(process.cwd(), file);
      const source = readFileSync(file, 'utf8');

      if (/[\u200B\u200C\u200D\uFEFF]/.test(source)) {
        offenders.push(`${relativePath}: contains zero-width characters`);
      }

      if (/<CodeBlockTab value="php">\n\s*```js/.test(source)) {
        offenders.push(`${relativePath}: PHP code block is labeled as js`);
      }

      if (
        /^\s*```go\n\s*(?:go|npm|curl|docker|choco|ngrok|mkdir|cd)\b/m.test(
          source,
        )
      ) {
        offenders.push(`${relativePath}: shell command is labeled as go`);
      }
    }

    const securitySource = readVoiceDoc('reference/security.md');
    expect(securitySource).not.toContain(
      '|Log |Media server logs generated by the Agora servers when accessing the Agora SDRTN®.| Media server logs do not contain text messages or personal information.|',
    );
    expect(offenders).toEqual([]);
  });

  it('does not leave legacy videoURL placeholders in MDX content', () => {
    const sources = [
      'realtime-media/cloud-recording/build/receive-notifications.mdx',
      'realtime-media/transcoding/build/receive-ncs-events.md',
      'solutions/interactive-live-streaming/build/receive-notifications.mdx',
      'solutions/interactive-live-streaming/build/virtual-background.mdx',
    ].map((relativePath) => {
      return readFileSync(resolve(docsRoot, relativePath), 'utf8');
    });

    for (const source of sources) {
      expect(source).not.toContain('src={videoURL}');
    }
  });

  it('uses the local Flexible Classroom product architecture image asset', () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'solutions/flexible-classroom/reference/product-features.md',
      ),
      'utf8',
    );

    expect(source).toContain(
      '![Product Architecture](/images/flexible-classroom/product-architecture.png)',
    );
    expect(source).not.toContain(
      'https://web-cdn.agora.io/docs-files/1658392957746',
    );
  });

  it('preserves explicit table cell line breaks in processed markdown', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(['ai', 'get-started', 'test-mdx-comps'], 'en');

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error('Expected test MDX page to expose processed markdown.');
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain(
      'Default value includes all users.<br />An empty array excludes all audio streams.',
    );
  });

  it('keeps IoT SDK compatibility table cells readable without raw HTML lists', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['solutions', 'iot', 'reference', 'communicate-with-rtc-sdk'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error('Expected IoT SDK page to expose processed markdown.');
    }

    const processed = await page.data.getText('processed');

    expect(processed).not.toContain('<ul>');
    expect(processed).not.toContain('<li>');
    expect(processed).toContain(
      'Native/third-party frameworks: Android, iOS/macOS, Windows, Electron, Unity, Flutter, React Native',
    );
    expect(processed).toContain(
      'Audio: G722, G711, Opus, AAC; Video: H.264, JPEG',
    );
  });

  it('renders media push layout images inside GFM table cells', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['realtime-media', 'media-push', 'reference', 'set-vertical-layout'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected media push vertical layout page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('| Number of people | Layout effect');
    expect(processed).toMatch(
      /\| 1\s+\| !\[1645770574489\]\(https:\/\/web-cdn\.agora\.io\/docs-files\/1645770574489\) \|/,
    );
  });

  it('keeps shared geofencing pages wrapped in full html tables when using rowspan', () => {
    const pages = [
      'realtime-media/video/build/manage-connection-and-quality/geofencing.mdx',
      'realtime-media/voice/build/manage-connection-and-quality/geofencing.mdx',
      'realtime-media/broadcast-streaming/build/secure-and-protect-channels/geofencing.mdx',
      'solutions/interactive-live-streaming/build/secure-and-protect-channels/geofencing.mdx',
    ];

    for (const relativePath of pages) {
      const source = readFileSync(resolve(docsRoot, relativePath), 'utf8');

      expect(source).toContain('<thead>');
      expect(source).toContain('<td rowspan="2">North America</td>');
      expect(source).toContain('<table>');
      expect(source).toContain('</table>');
    }
  });

  it('does not leave multi-host optimization pages as placeholder stubs', () => {
    const pages = [
      'realtime-media/video/build/manage-connection-and-quality/optimize-multihost-video.mdx',
      'realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx',
      'solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx',
    ];

    for (const relativePath of pages) {
      const source = readFileSync(resolve(docsRoot, relativePath), 'utf8');

      expect(source).not.toContain('**This feature guide is not available yet.**');
      expect(source).toContain('client-customized composite layout');
      expect(source).toContain('Cloud Transcoding');
    }
  });

  it('keeps shared security tables free of broken extra cells in the Log row', () => {
    const pages = [
      'realtime-media/video/reference/security.mdx',
      'realtime-media/voice/reference/security.md',
      'realtime-media/cloud-recording/reference/security.mdx',
      'realtime-media/marketplace/reference/security.mdx',
      'solutions/interactive-live-streaming/reference/security.md',
    ];

    for (const relativePath of pages) {
      const source = readFileSync(resolve(docsRoot, relativePath), 'utf8');

      expect(source).not.toContain(
        '|Log |Media server logs generated by the Agora servers when accessing the Agora SDRTN®.| Media server logs do not contain text messages or personal information.|',
      );
    }
  });

  it('keeps optimize-frame-rendering iOS and macOS links on video-sdk docs instead of voice-sdk docs', () => {
    const pages = [
      'realtime-media/video/build/capture-and-render-video/optimize-frame-rendering.mdx',
      'realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-frame-rendering.mdx',
      'solutions/interactive-live-streaming/build/optimize-quality-and-connection/optimize-frame-rendering.mdx',
    ];

    for (const relativePath of pages) {
      const source = readFileSync(resolve(docsRoot, relativePath), 'utf8');

      expect(source).not.toContain('https://api-ref.agora.io/en/voice-sdk/ios/4.x/');
      expect(source).toContain('https://api-ref.agora.io/en/video-sdk/ios/4.x/');
    }
  });

  it('keeps video and voice API examples pages present with sample repository content', () => {
    const pages = [
      'realtime-media/video/reference/api-examples.mdx',
      'realtime-media/voice/reference/api-examples.mdx',
    ];

    for (const relativePath of pages) {
      const source = readFileSync(resolve(docsRoot, relativePath), 'utf8');

      expect(source).toContain('Sample project repositories');
      expect(source).toContain('AgoraIO/API-Examples');
    }
  });

  it('keeps video reference api-examples populated with repository links', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/video/reference/api-examples.mdx'),
      'utf8',
    );

    expect(source.trim().length).toBeGreaterThan(0);
    expect(source).toContain('## Sample project repositories');
    expect(source).toContain('[AgoraIO/API-Examples-Web]');
  });

  it('keeps the simulcasting comparison table headers in place', () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/video/build/manage-connection-and-quality/simulcasting.mdx',
      ),
      'utf8',
    );

    expect(source).toContain(
      '| Item | Simulcasting | Dual-stream video |',
    );
    expect(source).toContain(
      '| Number of published stream layers | Up to four simultaneous layers from one video source |',
    );
  });

  it('keeps video quickstart free of the broken gradle code fence structure', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/video/get-started-sdk.mdx'),
      'utf8',
    );

    expect(source).toContain("- Groovy `build.gradle`\n\n          ```groovy");
    expect(source).toContain(
      "- Kotlin `build.gradle.kts`\n\n          ```kotlin",
    );
    expect(source).not.toContain("```json\nimplementation 'io.agora.rtc:full-sdk:x.y.z'");
  });

  it('keeps voice quickstart free of isolated directive closers in setup steps', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/voice/quickstart.mdx'),
      'utf8',
    );
    const androidSection = source.slice(
      0,
      source.indexOf('<PlatformStructured platform="ios">'),
    );

    expect(androidSection).toContain(
      '2. Add a layout file for your activity.\n\n    Set up a basic layout for your activity. Refer to [Create a user interface](#create-a-user-interface) to get a bare bones sample layout.\n\n### Install the SDK',
    );
    expect(androidSection).toContain(
      '1. Open the unzipped file and copy the following files or subfolders to your project path.\n\n  | File or folder        | Project path    |',
    );
  });

  it('keeps voice api-examples populated with sample repositories and next steps', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/voice/reference/api-examples.mdx'),
      'utf8',
    );

    expect(source.trim().length).toBeGreaterThan(0);
    expect(source).toContain('## Sample project repositories');
    expect(source).toContain('AgoraIO/API-Examples');
    expect(source).toContain('## Next steps');
  });

  it('keeps voice error codes page in the condensed reference format', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/voice/reference/error-codes.mdx'),
      'utf8',
    );

    expect(source).toContain('## Common error codes');
    expect(source).toContain('## Audio-related error codes');
    expect(source).toContain('## Data stream-related error codes');
    expect(source).toContain('| `109` | The current token has expired and is no longer valid. Generate a new token on the server and call `renewToken`. |');
    expect(source).toContain('| `1501` | There is no permission to use the microphone or related capture device. Check device permissions. |');
    expect(source).not.toContain('<PlatformStructured platform="android">');
    expect(source).not.toContain('<PlatformStructured platform="web">');
  });

  it('keeps media gateway pages aligned with the actual migrated entry points', () => {
    const abr = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/enable-adaptive-bitrate.md',
      ),
      'utf8',
    );
    const notifications = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications.md',
      ),
      'utf8',
    );
    const features = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/rtmp-gateway/reference/media-gateway-features.md',
      ),
      'utf8',
    );

    expect(abr).toContain('### API endpoint');
    expect(abr).toContain('https://api.agora.io/{region}/v1/projects/{appId}/rtls/ingress/stream-templates/{templateId}');
    expect(notifications).toContain('### Media Gateway event types');
    expect(notifications).toContain('### `live_stream_aborted` error codes');
    expect(features).toContain('## Related APIs and implementation entry points');
    expect(features).toContain('REST API overview');
  });

  it('keeps parameter table lists and callouts in the media push type definition page', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['api-reference', 'api-ref', 'media-push', 'restful-type-definition'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected media push type definition page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('| Field');
    expect(processed).toContain('| Type');
    expect(processed).toContain('| Descriptions');
    expect(processed).not.toContain('<ParamTable>');
    expect(processed).not.toContain('<Slot');
    expect(processed).toContain('`LC-AAC` (Default): MPEG-4 AAC LC');
    expect(processed).toContain('<CalloutContainer type="info">');
    expect(processed).toContain(
      '`volumes.rtcStreamUid` needs to exist in the `rtcStreamUids` array',
    );
  });

  it('keeps console REST API table slot callout content in processed markdown', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      [
        'api-reference',
        'api-ref',
        'console',
        'solutions-agora-console-rest-api',
      ],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected console REST API page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('| `enable_sign_key`');
    expect(processed).not.toContain('<Slot name="enablesignkey"');
    expect(processed).toContain('<CalloutContainer type="info">');
    expect(processed).toMatch(/<CalloutTitle>\s*Note\s*<\/CalloutTitle>/);
    expect(processed).toContain(
      'After creating a project, you can send a request to `https://api.agora.io/dev/v1/signkey`',
    );
  });

  it('renders AI model callout directives through the processed markdown pipeline', async () => {
    const { source } = await import('./source.server');
    const modelDocsRoot = resolve(docsRoot, 'ai/models');
    const filesWithCallouts = listMarkdownFiles(modelDocsRoot).filter((file) => {
      const sourceText = readFileSync(file, 'utf8');
      return /^:{3,4}(?:caution|danger|info|note|tip|warn|warning)\b/m.test(
        sourceText,
      );
    });

    for (const file of filesWithCallouts) {
      const page = source.getPage(aiModelsDocSlugs(file), 'en');

      expect(page).toBeDefined();
      expect(page?.type).toBe('docs');

      if (!page || !('getText' in page.data)) {
        throw new Error(
          `Expected AI model page ${relative(process.cwd(), file)} to expose processed markdown.`,
        );
      }

      const processed = await page.data.getText('processed');

      expect(processed).not.toMatch(
        /^:{3,4}(?:caution|danger|info|note|tip|warn|warning)\b/m,
      );
      expect(processed).toContain('<CalloutContainer');
    }
  });

  it('keeps nested and repeated AI model callouts rendered as callout containers', async () => {
    const { source } = await import('./source.server');
    const akool = source.getPage(['ai', 'models', 'avatar', 'akool'], 'en');
    const deepgram = source.getPage(['ai', 'models', 'asr', 'deepgram'], 'en');
    const elevenLabs = source.getPage(
      ['ai', 'models', 'tts', 'elevenlabs'],
      'en',
    );

    for (const page of [akool, deepgram, elevenLabs]) {
      expect(page).toBeDefined();
      expect(page?.type).toBe('docs');
    }

    if (
      !akool ||
      !deepgram ||
      !elevenLabs ||
      !('getText' in akool.data) ||
      !('getText' in deepgram.data) ||
      !('getText' in elevenLabs.data)
    ) {
      throw new Error('Expected AI model regression pages to expose processed markdown.');
    }

    const akoolProcessed = await akool.data.getText('processed');
    const deepgramProcessed = await deepgram.data.getText('processed');
    const elevenLabsProcessed = await elevenLabs.data.getText('processed');

    expect(akoolProcessed.match(/<CalloutContainer type="info">/g) ?? []).toHaveLength(3);
    expect(akoolProcessed).toContain('sales@agora.io');
    expect(deepgramProcessed).toContain('<CalloutContainer type="warning">');
    expect(deepgramProcessed).toContain('callback_method');
    expect(
      elevenLabsProcessed.match(/<CalloutContainer type="warning">/g) ?? [],
    ).toHaveLength(2);
    expect(elevenLabsProcessed).toContain('Paid plan required');
  });

  it('renders IoT authentication code tabs as MDX components', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['solutions', 'iot', 'build', 'authentication-workflow'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');
    expect(page?.path).toBe(
      'en/solutions/iot/build/authentication-workflow.mdx',
    );

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected IoT authentication page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('<CodeBlockTabs defaultValue="java">');
    expect(processed).toContain('<CodeBlockTab value="java">');
    expect(processed).toContain('<CodeBlockTab value="kotlin">');
    expect(processed).not.toContain('&lt;/CodeBlockTab&gt;');
    expect(processed).not.toContain('&lt;CodeBlockTab');
  });

  it('renders stream channel code tabs as MDX components', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['realtime-media', 'rtm', 'build', 'channels', 'stream-channel'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');
    expect(page?.path).toBe(
      'en/realtime-media/rtm/build/channels/stream-channel.mdx',
    );

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected stream channel page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('<CodeBlockTabs defaultValue="java">');
    expect(processed).toContain('<CodeBlockTab value="java">');
    expect(processed).toContain('<CodeBlockTab value="kotlin">');
    expect(processed).not.toContain('&lt;/CodeBlockTab&gt;');
    expect(processed).not.toContain('&lt;CodeBlockTab');
  });
});
