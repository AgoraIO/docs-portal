import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

const docsRoot = resolve(process.cwd(), 'content/docs/en');
const allDocsRoot = resolve(process.cwd(), 'content/docs');
const voiceDocsRoot = resolve(docsRoot, 'realtime-media/voice');
const SOURCE_LOADER_TEST_TIMEOUT = 300_000;

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

  it('keeps AI short-term memory notification event link in the AI reference section', () => {
    const content = readDoc(
      'ai/build/shape-the-conversation/short-term-memory.mdx',
    );

    expect(content).toContain(
      '[Notification event types](../../reference/event-types#103-agent-history)',
    );
    expect(content).not.toContain(
      '[Notification event types](../reference/event-types#103-agent-history)',
    );
  });

  it('keeps AI short-term memory Custom LLM link in custom model integration', () => {
    const content = readDoc(
      'ai/build/shape-the-conversation/short-term-memory.mdx',
    );

    expect(content).toContain(
      '[Custom LLM](../custom-model-integration/custom-llm)',
    );
    expect(content).not.toContain('[Custom LLM](custom-llm)');
  });

  it('keeps AI interrupt agent quickstart link on the Video Calling SDK quickstart', () => {
    const content = readDoc(
      'ai/build/shape-the-conversation/interrupt-agent.mdx',
    );

    expect(content).toContain(
      '[Quickstart](../../../realtime-media/video/quickstart)',
    );
    expect(content).not.toContain(
      '[Quickstart](../../introduction/realtime-audio-video)',
    );
    expect(content).not.toContain(
      '[Quickstart](../../../introduction/realtime-audio-video)',
    );
  });

  it('keeps AI Video SDK quickstart links on the Video Calling SDK quickstart', () => {
    const files = listMarkdownFiles(resolve(docsRoot, 'ai'));
    const offenders = files.flatMap((file) => {
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);

      return lines.flatMap((line, index) =>
        (/Video SDK|Video Calling/.test(line) &&
          /introduction\/realtime-audio-video/.test(line)) ||
        /audio and video quickstart/.test(line)
          ? [`${relative(process.cwd(), file)}:${index + 1}: ${line.trim()}`]
          : [],
      );
    });

    expect(offenders).toEqual([]);
  }, SOURCE_LOADER_TEST_TIMEOUT);

  it('keeps AI build interrupt links in shape the conversation', () => {
    const files = listMarkdownFiles(resolve(docsRoot, 'ai/build'));
    const offenders = files.flatMap((file) => {
      const content = readFileSync(file, 'utf8');

      return [...content.matchAll(/\]\(interrupt-agent\)/g)].map(
        (match) => `${relative(process.cwd(), file)}:${match.index ?? 0}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('keeps AI build event notification links in handle runtime events', () => {
    const files = listMarkdownFiles(resolve(docsRoot, 'ai/build'));
    const offenders = files.flatMap((file) => {
      const relativePath = relative(resolve(docsRoot, 'ai/build'), file);

      if (relativePath.includes('/')) {
        return [];
      }

      const content = readFileSync(file, 'utf8');

      return [...content.matchAll(/\]\(event-notifications\)/g)].map(
        (match) => `${relative(process.cwd(), file)}:${match.index ?? 0}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('keeps AI best practices webhook links in handle runtime events', () => {
    const files = listMarkdownFiles(resolve(docsRoot, 'ai/best-practices'));
    const offenders = files.flatMap((file) => {
      const content = readFileSync(file, 'utf8');

      return [...content.matchAll(/\]\(\.\.\/build\/webhooks/g)].map(
        (match) => `${relative(process.cwd(), file)}:${match.index ?? 0}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('keeps AI regional restriction media zone links on the Video SDK geofencing page', () => {
    const content = readDoc('ai/best-practices/regional-restrictions.mdx');

    expect(content).toContain(
      '[Restrict media zones](../../realtime-media/video/build/manage-connection-and-quality/geofencing)',
    );
    expect(content).not.toContain(
      '[Restrict media zones](../../best-practices/geofencing)',
    );
  });

  it('keeps AI best practices start-stop links in the build section', () => {
    const content = readDoc('ai/best-practices/record-agent-conversation.mdx');

    expect(content).toContain(
      '[Start and stop an agent](../build/start-stop-agent)',
    );
    expect(content).not.toContain(
      '[Start and stop an agent](start-stop-agent)',
    );
  });

  it('keeps AI filler words MCP servers link on the Conversational AI join API', () => {
    const content = readDoc('ai/build/shape-the-conversation/filler-words.mdx');

    expect(content).toContain(
      '[MCP servers](/en/api-reference/api-ref/conversational-ai/join#properties-llm-mcp-servers)',
    );
    expect(content).not.toContain(
      '[MCP servers](../../api-reference/conversational-ai/rest-api/agent/join#properties-llm-mcp-servers)',
    );
  });

  it('keeps AI shape-the-conversation API reference links outside the AI section', () => {
    const files = listMarkdownFiles(
      resolve(docsRoot, 'ai/build/shape-the-conversation'),
    );
    const offenders = files.flatMap((file) => {
      const content = readFileSync(file, 'utf8');

      return [...content.matchAll(/\]\(\.\.\/\.\.\/api-reference\//g)].map(
        (match) => `${relative(process.cwd(), file)}:${match.index ?? 0}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('keeps AI shape-the-conversation quickstart links outside the build section', () => {
    const files = listMarkdownFiles(
      resolve(docsRoot, 'ai/build/shape-the-conversation'),
    );
    const offenders = files.flatMap((file) => {
      const content = readFileSync(file, 'utf8');

      return [...content.matchAll(/\]\(\.\.\/get-started\/quickstart/g)].map(
        (match) => `${relative(process.cwd(), file)}:${match.index ?? 0}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('keeps nested AI build quickstart links outside the build section', () => {
    const files = listMarkdownFiles(resolve(docsRoot, 'ai/build'));
    const offenders = files.flatMap((file) => {
      const relativePath = relative(resolve(docsRoot, 'ai/build'), file);

      if (!relativePath.includes('/')) {
        return [];
      }

      const content = readFileSync(file, 'utf8');

      return [...content.matchAll(/\]\(\.\.\/get-started\/quickstart/g)].map(
        (match) => `${relative(process.cwd(), file)}:${match.index ?? 0}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('keeps AI handle-runtime-events notification type links in the AI reference section', () => {
    const files = listMarkdownFiles(
      resolve(docsRoot, 'ai/build/handle-runtime-events'),
    );
    const offenders = files.flatMap((file) => {
      const content = readFileSync(file, 'utf8');

      return [...content.matchAll(/\]\(\.\.\/reference\/event-types/g)].map(
        (match) => `${relative(process.cwd(), file)}:${match.index ?? 0}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('keeps AI event type goal link in handle runtime events', () => {
    const content = readDoc('ai/reference/event-types.mdx');

    expect(content).toContain(
      '[Monitor agent status, errors, and performance](../build/handle-runtime-events/monitor-agent-runtime)',
    );
    expect(content).toContain(
      '[Retrieve conversation history after a session ends](../build/handle-runtime-events/retrieve-session-history)',
    );
    expect(content).toContain(
      '[Debug agent failures with runtime events](../build/handle-runtime-events/debug-agent-failures)',
    );
    expect(content).not.toContain(
      '[Monitor agent status, errors, and performance](../build/monitor-agent-runtime)',
    );
    expect(content).not.toContain(
      '[Retrieve conversation history after a session ends](../build/retrieve-session-history)',
    );
    expect(content).not.toContain(
      '[Debug agent failures with runtime events](../build/debug-agent-failures)',
    );
  });

  it('keeps custom model integration audio output subtitles links on the AI build transcripts page', () => {
    const content = readDoc(
      'ai/build/custom-model-integration/audio-output.mdx',
    );

    expect(content).toContain('[Display live subtitles](../transcripts)');
    expect(content).not.toContain('[Display live subtitles](transcripts)');
  });

  it('keeps custom model integration tutorial prerequisites focused on Agora-managed presets', () => {
    const content = readDoc(
      'ai/build/custom-model-integration/build-server-client.mdx',
    );

    expect(content).toContain('- An active [Agora account]');
    expect(content).toContain('Agora-managed presets');
    expect(content).not.toContain('Conversational AI Engine enabled');
    expect(content).not.toContain('../reference/enable-conversational-ai');
  });

  it('keeps Ares ASR pricing link in the AI reference pricing page', () => {
    const content = readDoc('ai/models/asr/ares.mdx');

    expect(content).toContain('[pricing](../../reference/pricing)');
    expect(content).not.toContain('[pricing](/en/ai/pricing)');
  });

  it('keeps Whiteboard IA centered on the product root and Reference section', () => {
    const productMeta = JSON.parse(readDoc('realtime-media/whiteboard/meta.json'));
    const referenceMeta = JSON.parse(
      readDoc('realtime-media/whiteboard/reference/meta.json'),
    );

    expect(productMeta.pages).toEqual([
      'index',
      '[Compare and choose](/en/realtime-media/whiteboard/whiteboard-fastboard)',
      'build',
      'reference',
    ]);
    expect(productMeta.sidebarIndexTitle).toBe('Interactive Whiteboard overview');
    expect(productMeta.pages).not.toContain('overview');
    expect(
      existsSync(resolve(docsRoot, 'realtime-media/whiteboard/overview')),
    ).toBe(false);
    expect(
      existsSync(
        resolve(docsRoot, 'realtime-media/whiteboard/overview/core-concepts.md'),
      ),
    ).toBe(false);

    expect(referenceMeta.pages.slice(0, 5)).toEqual([
      'pricing',
      'core-concepts',
      'supported-platforms',
      'release-notes',
      'release-notes-uikit',
    ]);
  });

  it('keeps AI quickstart links from referring to a REST quickstart', () => {
    const files = listMarkdownFiles(resolve(docsRoot, 'ai'));
    const offenders = files.flatMap((file) => {
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);

      return lines.flatMap((line, index) =>
        /\bREST Quickstart\b|\bREST quickstart\b/.test(line)
          ? [`${relative(process.cwd(), file)}:${index + 1}: ${line.trim()}`]
          : [],
      );
    });

    expect(offenders).toEqual([]);
  });

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
  }, SOURCE_LOADER_TEST_TIMEOUT);

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
  }, SOURCE_LOADER_TEST_TIMEOUT);

  it('keeps screenshot upload provider details grouped in tabs across screenshot upload docs', () => {
    const screenshotUploadDocs = [
      'realtime-media/video/build/add-advanced-video-features/screenshot-upload.mdx',
      'realtime-media/broadcast-streaming/build/process-raw-and-custom-media/screenshot-upload.mdx',
      'realtime-media/interactive-live-streaming/build/process-raw-and-custom-media/screenshot-upload.mdx',
    ];

    for (const relativePath of screenshotUploadDocs) {
      const content = readDoc(relativePath);
      const startMarker = 'Fill in the following information:';
      const endMarker = '3. **Integrate Video SDK**';
      const startIndex = content.indexOf(startMarker);
      const endIndex = content.indexOf(endMarker, startIndex + 1);

      expect(startIndex).toBeGreaterThanOrEqual(0);
      expect(endIndex).toBeGreaterThan(startIndex);

      const providerSection = content.slice(startIndex, endIndex);

      expect(providerSection).toContain(
        '<Tabs defaultValue="aws" groupId="storage-provider" persist>',
      );
      expect(providerSection).toContain('<TabsList>');
      expect(providerSection).toContain(
        '<TabsTrigger value="aws">AWS</TabsTrigger>',
      );
      expect(providerSection).toContain(
        '<TabsTrigger value="alibaba-cloud">Alibaba Cloud</TabsTrigger>',
      );
      expect(providerSection).toContain('<TabsContent value="aws">');
      expect(providerSection).toContain('<TabsContent value="alibaba-cloud">');
    }
  });

  it('keeps connection status management free of undefined Vg placeholders', () => {
    const content = readDoc(
      'realtime-media/video/build/manage-connection-and-quality/connection-status-management.mdx',
    );

    expect(content).not.toContain('<Vg ');
    expect(content).not.toContain('</Vg>');
  });

  it('keeps connection status management free of undefined Vpl placeholders', () => {
    const content = readDoc(
      'realtime-media/video/build/manage-connection-and-quality/connection-status-management.mdx',
    );

    expect(content).not.toContain('<Vpl ');
    expect(content).not.toContain('</Vpl>');
  });

  it('keeps the iOS reconnection diagram in video connection status management', () => {
    const content = readDoc(
      'realtime-media/video/build/manage-connection-and-quality/connection-status-management.mdx',
    );
    const reconnectionHeading = content.indexOf(
      '##### Disconnection and reconnection',
    );
    const platformStart = content.indexOf(
      '<PlatformStructured platform="ios">',
      reconnectionHeading,
    );
    const platformEnd = content.indexOf(
      '<PlatformStructured platform="macos">',
      platformStart + 1,
    );

    expect(reconnectionHeading).toBeGreaterThanOrEqual(0);
    expect(platformStart).toBeGreaterThanOrEqual(0);
    expect(platformEnd).toBeGreaterThan(platformStart);

    const iosSection = content.slice(platformStart, platformEnd);

    expect(iosSection).toContain(
      '![Disconnection Connection](https://assets-docs.agora.io/images/video-sdk/connection-state-native.svg)',
    );
  });

  it('keeps the macOS reconnection diagram in video connection status management', () => {
    const content = readDoc(
      'realtime-media/video/build/manage-connection-and-quality/connection-status-management.mdx',
    );
    const reconnectionHeading = content.indexOf(
      '##### Disconnection and reconnection',
    );
    const platformStart = content.indexOf(
      '<PlatformStructured platform="macos">',
      reconnectionHeading,
    );
    const platformEnd = content.indexOf(
      '<PlatformStructured platform="react-native">',
      platformStart + 1,
    );

    expect(reconnectionHeading).toBeGreaterThanOrEqual(0);
    expect(platformStart).toBeGreaterThanOrEqual(0);
    expect(platformEnd).toBeGreaterThan(platformStart);

    const macosSection = content.slice(platformStart, platformEnd);

    expect(macosSection).toContain(
      '![Disconnection Connection](https://assets-docs.agora.io/images/video-sdk/connection-state-native.svg)',
    );
  });

  it('keeps the Windows reconnection diagram in video connection status management', () => {
    const content = readDoc(
      'realtime-media/video/build/manage-connection-and-quality/connection-status-management.mdx',
    );
    const reconnectionHeading = content.indexOf(
      '##### Disconnection and reconnection',
    );
    const platformStart = content.indexOf(
      '<PlatformStructured platform="windows">',
      reconnectionHeading,
    );
    const platformEnd = content.indexOf(
      '<PlatformStructured platform="blueprint">',
      platformStart + 1,
    );

    expect(reconnectionHeading).toBeGreaterThanOrEqual(0);
    expect(platformStart).toBeGreaterThanOrEqual(0);
    expect(platformEnd).toBeGreaterThan(platformStart);

    const windowsSection = content.slice(platformStart, platformEnd);

    expect(windowsSection).toContain(
      '![Disconnection Connection](https://assets-docs.agora.io/images/video-sdk/connection-state-native.svg)',
    );
  });

  it('keeps required reconnection diagrams for remaining video platforms', () => {
    const content = readDoc(
      'realtime-media/video/build/manage-connection-and-quality/connection-status-management.mdx',
    );

    const expectations = [
      {
        next: '<PlatformStructured platform="electron">',
        platform: '<PlatformStructured platform="android">',
        image:
          '![Disconnection Connection](https://assets-docs.agora.io/images/video-sdk/connection-state-native.svg)',
      },
      {
        next: '<PlatformStructured platform="flutter">',
        platform: '<PlatformStructured platform="electron">',
        image:
          '![Disconnection Connection](https://assets-docs.agora.io/images/video-sdk/connection-state-flutter-rn-electron.svg)',
      },
      {
        next: '<PlatformStructured platform="ios">',
        platform: '<PlatformStructured platform="flutter">',
        image:
          '![Disconnection Connection](https://assets-docs.agora.io/images/video-sdk/connection-state-flutter-rn-electron.svg)',
      },
      {
        next: '<PlatformStructured platform="unity">',
        platform: '<PlatformStructured platform="react-native">',
        image:
          '![Disconnection Connection](https://assets-docs.agora.io/images/video-sdk/connection-state-flutter-rn-electron.svg)',
      },
      {
        next: '<PlatformStructured platform="web">',
        platform: '<PlatformStructured platform="unreal">',
        image:
          '![Disconnection Connection](https://assets-docs.agora.io/images/video-sdk/connection-state-native.svg)',
      },
    ] as const;

    const reconnectionHeading = content.indexOf(
      '##### Disconnection and reconnection',
    );
    expect(reconnectionHeading).toBeGreaterThanOrEqual(0);

    for (const { image, next, platform } of expectations) {
      const platformStart = content.indexOf(platform, reconnectionHeading + 1);
      const platformEnd = content.indexOf(next, platformStart + 1);

      expect(platformStart).toBeGreaterThanOrEqual(0);
      expect(platformEnd).toBeGreaterThan(platformStart);

      const section = content.slice(platformStart, platformEnd);

      expect(section).toContain(image);
    }
  });

  it('keeps web connection status management free of shared prerequisite and implementation headings', () => {
    const content = readDoc(
      'realtime-media/video/build/manage-connection-and-quality/connection-status-management.mdx',
    );

    expect(content).toContain(
      '\n## Prerequisites\nEnsure that you have implemented the [SDK quickstart](/en/realtime-media/video/get-started-sdk) project.\n\n## Implement connection status management\n',
    );
  });

  it('separates the reconnection platform group from the implementation platform group', () => {
    const content = readDoc(
      'realtime-media/video/build/manage-connection-and-quality/connection-status-management.mdx',
    );

    expect(content).toContain(
      '</PlatformStructured>\n\n## Prerequisites\nEnsure that you have implemented the [SDK quickstart](/en/realtime-media/video/get-started-sdk) project.\n\n## Implement connection status management\n<PlatformStructured platform="android">',
    );
  });

  it('keeps PR 285 code and table recovery pages from regressing to placeholders', () => {
    const multihostDocs = [
      'realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx',
      'realtime-media/video/build/manage-connection-and-quality/optimize-multihost-video.mdx',
      'realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx',
    ];

    for (const relativePath of multihostDocs) {
      const content = readDoc(relativePath);
      const usesTabs = content.includes(
        '<Tabs defaultValue="android" groupId="platform">',
      );
      const usesPlatformStructured = content.includes(
        '<PlatformStructured platform="android">',
      );

      expect(content).not.toContain('not available yet');
      expect(usesTabs || usesPlatformStructured).toBe(true);
      if (usesTabs) {
        expect(content.match(/<TabsContent value=/g) ?? []).toHaveLength(3);
      } else {
        expect(content).toContain('<PlatformStructured platform="android">');
        expect(content).toContain('<PlatformStructured platform="ios">');
        expect(content).toContain('<PlatformStructured platform="flutter">');
      }
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

    expect(srtStreaming).toContain(
      '`srtlive-rtcpush-prod-{region}.agoramdn.com`',
    );
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
      '| Small stream automatically adapts video attributes | ✘ | ✔ |',
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
      'realtime-media/interactive-live-streaming/build/secure-and-protect-channels/geofencing.mdx',
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
    expect(activeFence).toContain(
      '| `requestId` | Text | Request ID of the screenshot |',
    );

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

    const appSizeOptimizationDocs = [
      'realtime-media/voice/build/optimize-and-operate/app-size-optimization.mdx',
      'realtime-media/video/build/optimize-and-operate/app-size-optimization.mdx',
    ];

    for (const relativePath of appSizeOptimizationDocs) {
      const content = readDoc(relativePath);

      expect(content).toContain('<Accordions>');
      expect(content).toContain('<Accordion title="AI Noise Suppression">');
      expect(content).toContain('<Accordion title="AI Echo Cancellation">');
      expect(content).toContain('<Accordion title="Audio Beauty">');
      expect(content).toContain('<Accordion title="Video Enhancement">');
      expect(content).toContain('<Accordion title="Local Screenshot Upload">');
    }

    const voicePricing = readDoc('realtime-media/voice/reference/pricing.mdx');

    expect(voicePricing).toContain('### FAQs');
    expect(voicePricing).toContain('#### Free minutes');
    expect(voicePricing).toContain('#### Billing');
    expect(voicePricing).toContain('#### Duration and usage');
    expect(voicePricing).toContain('#### Video resolution');
    expect(voicePricing).toContain('#### Arrears');
    expect(voicePricing).toContain(
      '<Accordion title="If I purchase a paid package, do I still get 10,000 free minutes each month?">',
    );
    expect(voicePricing).toContain(
      '<Accordion title="If a user doesn’t publish or subscribe to any audio or video streams in a channel, will they still be charged?">',
    );
    expect(voicePricing).toContain(
      '<Accordion title="How is usage duration calculated in the bill?">',
    );
    expect(voicePricing).toContain(
      '<Accordion title="Can I view individual user usage in the bill?">',
    );
    expect(voicePricing).toContain(
      '<Accordion title="Why is my applied billing rate for Ultra-HD when all users subscribe to 360 × 640 video streams?">',
    );

    const rtmpCoreConcepts = readDoc(
      'realtime-media/rtmp-gateway/reference/core-concepts.md',
    );

    expect(rtmpCoreConcepts).toContain('| Channel profile | Description |');
    expect(rtmpCoreConcepts).toContain('| `LIVE_BROADCASTING` |');

    const rtmpNotifications = readDoc(
      'realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/receive-notifications.md',
    );

    expect(rtmpNotifications).toContain(
      '| `eventType` | Event name | Description |',
    );
    expect(rtmpNotifications).toContain('| `3` | `live_stream_aborted` |');

    const whiteboardReleaseNotes = readDoc(
      'realtime-media/whiteboard/reference/release-notes.mdx',
    );

    expect(whiteboardReleaseNotes).toContain(
      '|Domain                      |Covered region       |',
    );
    expect(whiteboardReleaseNotes).toContain(
      "implementation 'com.github.netless-io:whiteboard-android:<version>'",
    );
    expect(whiteboardReleaseNotes).toContain(
      "pod 'Whiteboard/Whiteboard-YYKit'",
    );
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
        'content/docs/en/realtime-media/agora-analytics/build/explore-and-analyze-data/call-search.md',
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
  }, SOURCE_LOADER_TEST_TIMEOUT);

  it('uses specific titles for English top-level overview pages', async () => {
    const { source } = await import('./source.server');

    const overviewPages = [
      {
        expectedTitle: 'Voice Agent overview',
        slugs: ['ai'],
      },
      {
        expectedTitle: 'RTC overview',
        slugs: ['realtime-media', 'overview'],
      },
      {
        expectedTitle: 'Reference overview',
        slugs: ['api-reference'],
      },
    ];

    for (const { expectedTitle, slugs } of overviewPages) {
      expect(source.getPage(slugs, 'en')?.data.title).toBe(expectedTitle);
    }
  }, SOURCE_LOADER_TEST_TIMEOUT);

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
      'realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx',
      'realtime-media/transcoding/build/receive-ncs-events.md',
      'realtime-media/interactive-live-streaming/build/connect-across-channels/receive-notifications.mdx',
      'realtime-media/interactive-live-streaming/build/apply-effects-and-enhancements/virtual-background.mdx',
    ].map((relativePath) => {
      return readFileSync(resolve(docsRoot, relativePath), 'utf8');
    });

    for (const source of sources) {
      expect(source).not.toContain('src={videoURL}');
    }
  });

  it('keeps virtual background sample app image paths local to the sample', () => {
    const samplePaths = [
      'realtime-media/broadcast-streaming/build/apply-effects-and-enhancements/virtual-background.mdx',
      'realtime-media/marketplace/build/add-video-and-ar-effects/virtual-background.mdx',
      'realtime-media/video/build/apply-video-effects/virtual-background.mdx',
      'realtime-media/interactive-live-streaming/build/apply-effects-and-enhancements/virtual-background.mdx',
    ];

    for (const samplePath of samplePaths) {
      const source = readFileSync(resolve(docsRoot, samplePath), 'utf8');

      expect(source).toContain("imgElement.src = '/images/background.png';");
      expect(source).not.toContain(
        'https://assets-docs.agora.io/images/background.png',
      );
    }
  });

  it('uses the docs-owned Flexible Classroom product architecture image asset', () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/flexible-classroom/reference/product-features.mdx',
      ),
      'utf8',
    );

    expect(source).toContain(
      '![Product Architecture](https://assets-docs.agora.io/images/flexible-classroom/product-architecture.png)',
    );
    expect(source).not.toContain(
      'https://web-cdn.agora.io/docs-files/1658392957746',
    );
  });

  it('preserves explicit table cell line breaks in processed markdown', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['ai', 'best-practices', 'optimize-latency'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error('Expected latency page to expose processed markdown.');
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain(
      'TTFB: Time To First Byte, the first byte latency.<br />TTFS: Time To First Sentence',
    );
  }, SOURCE_LOADER_TEST_TIMEOUT);

  it('keeps IoT SDK compatibility table cells readable without raw HTML lists', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['realtime-media', 'iot', 'reference', 'communicate-with-rtc-sdk'],
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
  }, SOURCE_LOADER_TEST_TIMEOUT);

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
  }, SOURCE_LOADER_TEST_TIMEOUT);

  it('keeps shared geofencing pages with readable media-zone table content', () => {
    const pages = [
      'realtime-media/video/build/manage-connection-and-quality/geofencing.mdx',
      'realtime-media/voice/build/manage-connection-and-quality/geofencing.mdx',
      'realtime-media/broadcast-streaming/build/secure-and-protect-channels/geofencing.mdx',
      'realtime-media/interactive-live-streaming/build/secure-and-protect-channels/geofencing.mdx',
    ];

    for (const relativePath of pages) {
      const source = readFileSync(resolve(docsRoot, relativePath), 'utf8');

      expect(source).toContain(
        "| Designated access zone | User's location | Zone actually accessed by the SDK | User experience |",
      );
      expect(source).toContain(
        '| North America | North America | North America | Normal |',
      );
      expect(source).toContain(
        '| North America | China | North America | Quality may be affected |',
      );
    }
  });

  it('keeps shared geofencing pages with the web, react-js, and unreal platform sections', () => {
    const pages = [
      'realtime-media/video/build/manage-connection-and-quality/geofencing.mdx',
      'realtime-media/voice/build/manage-connection-and-quality/geofencing.mdx',
      'realtime-media/broadcast-streaming/build/secure-and-protect-channels/geofencing.mdx',
      'realtime-media/interactive-live-streaming/build/secure-and-protect-channels/geofencing.mdx',
    ];

    for (const relativePath of pages) {
      const source = readFileSync(resolve(docsRoot, relativePath), 'utf8');

      expect(source).toContain('<PlatformStructured platform="web">');
      expect(source).toContain('<PlatformStructured platform="react-js">');
      expect(source).toContain('<PlatformStructured platform="unreal">');
    }
  });

  it('does not leave multi-host optimization pages as placeholder stubs', () => {
    const pages = [
      'realtime-media/video/build/manage-connection-and-quality/optimize-multihost-video.mdx',
      'realtime-media/broadcast-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx',
      'realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/optimize-multihost-video.mdx',
    ];

    for (const relativePath of pages) {
      const source = readFileSync(resolve(docsRoot, relativePath), 'utf8');

      expect(source).not.toContain(
        '**This feature guide is not available yet.**',
      );
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
      'realtime-media/interactive-live-streaming/reference/security.md',
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
      'realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/optimize-frame-rendering.mdx',
    ];

    for (const relativePath of pages) {
      const source = readFileSync(resolve(docsRoot, relativePath), 'utf8');

      expect(source).not.toContain(
        'https://api-ref.agora.io/en/voice-sdk/ios/4.x/',
      );
      expect(source).toContain(
        'https://api-ref.agora.io/en/video-sdk/ios/4.x/',
      );
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

    expect(source).toContain('| Feature | Simulcasting | Dual-stream video |');
    expect(source).toContain(
      '| Small stream automatically adapts video attributes | ✘ | ✔ |',
    );
  });

  it('keeps simulcasting implementation details from the legacy shared Android content', () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/video/build/manage-connection-and-quality/simulcasting.mdx',
      ),
      'utf8',
    );

    expect(source).toContain(
      'Compared with dual-stream video, simulcasting offers the following improvements:',
    );
    expect(source).toContain(
      '**More subscribed streams**: Simulcasting expands the number of subscribable streams from 2 to 8.',
    );
    expect(source).toContain(
      'When the sender device is performance-limited, upstream configurations are automatically disabled, and subscribers adapt to the remaining streams.',
    );
    expect(source).toContain(
      "Simulcasting supports publishing video streams at specific tiers based on the subscriber's settings.",
    );
  });

  it('keeps video quickstart free of the broken gradle code fence structure', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/video/get-started-sdk.mdx'),
      'utf8',
    );

    expect(source).toContain('- Groovy `build.gradle`\n\n          ```groovy');
    expect(source).toContain(
      '- Kotlin `build.gradle.kts`\n\n          ```kotlin',
    );
    expect(source).not.toContain(
      "```json\nimplementation 'io.agora.rtc:full-sdk:x.y.z'",
    );
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

  it('keeps realtime video get-started-sdk sections that were missing in the PDF review', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/video/get-started-sdk.mdx'),
      'utf8',
    );

    expect(source).toContain('### Complete sample code');
    expect(source).toContain(
      '<Accordion title="Complete sample code for real-time Video Calling">',
    );
    expect(source).toContain('### Display the local video');
    expect(source).toContain('### Create a basic UI');
    expect(source).toContain(
      'Create a new project</TabsTrigger>\n  <TabsTrigger value="existing">Add to an existing project</TabsTrigger>',
    );
    expect(source).toContain(
      '4. Create a user interface for your app. Refer to [Create a user interface](#create-a-user-interface) to create a bare-bones UI.',
    );
    expect(source).toContain(
      '1. In the Unreal Project Browser, click on **Browse** and locate the `.uproject` file.',
    );
    expect(source).toContain('### Create a level');
  });

  it('keeps the video web quickstart top-of-page sample entry link', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/video/get-started-sdk.mdx'),
      'utf8',
    );
    const webSectionStart = source.indexOf(
      '<PlatformStructured platform="web">',
    );
    const unrealSectionStart = source.indexOf(
      '<PlatformStructured platform="unreal">',
    );

    expect(webSectionStart).toBeGreaterThanOrEqual(0);
    expect(unrealSectionStart).toBeGreaterThan(webSectionStart);

    const webSection = source.slice(webSectionStart, unrealSectionStart);

    expect(webSection).toContain('<Cards>');
    expect(webSection).toContain('<Card');
    expect(webSection).toContain('title="RTC SDK API examples"');
    expect(webSection).toContain(
      'href="https://github.com/AgoraIO/API-Examples-Web"',
    );
    expect(webSection).not.toContain(
      'Explore sample implementations to quickly integrate Conversational AI.',
    );
  });

  it('keeps nested AI build quickstart links pointed at the in-app quickstart page', () => {
    const customInformationSource = readDoc(
      'ai/build/shape-the-conversation/custom-information.mdx',
    );
    const customLlmSource = readDoc(
      'ai/build/custom-model-integration/custom-llm.mdx',
    );

    expect(customInformationSource).toContain(
      '](../../get-started/quickstart)',
    );
    expect(customInformationSource).not.toContain(
      '](../get-started/quickstart)',
    );

    expect(customLlmSource).toContain('](../../get-started/quickstart)');
    expect(customLlmSource).not.toContain('](../get-started/quickstart)');
  });

  it('keeps the OpenAI MLLM page free of broken overview self-links', () => {
    const source = readDoc('ai/models/mllm/openai.mdx');

    expect(source).not.toContain('[MLLM Overview](overview)');
    expect(source).not.toContain('[MLLM Overview](.)');
  });

  it('keeps the video unreal setup section fully populated', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/video/get-started-sdk.mdx'),
      'utf8',
    );
    const unrealSectionStart = source.indexOf(
      '<PlatformStructured platform="unreal">',
    );
    const blueprintSectionStart = source.indexOf(
      '<PlatformStructured platform="blueprint">',
    );

    expect(unrealSectionStart).toBeGreaterThanOrEqual(0);
    expect(blueprintSectionStart).toBeGreaterThan(unrealSectionStart);

    const unrealSection = source.slice(
      unrealSectionStart,
      blueprintSectionStart,
    );

    expect(unrealSection).toContain('<TabsList>');
    expect(unrealSection).toContain(
      '<TabsTrigger value="existing">Add to an existing project</TabsTrigger>',
    );
    expect(unrealSection).toContain(
      '1. In the Unreal Project Browser, click on **Browse** and locate the `.uproject` file.',
    );
    expect(unrealSection).toContain('3. Add the Agora dependency library');
    expect(unrealSection).toContain(
      '1. Create a new C++ class and generate header and library files',
    );
    expect(unrealSection).toContain('1. Associate C++ classes and Widgets');
    expect(unrealSection).toContain(
      '1. Create a user interface for your app. Refer to [Create a user interface](#create-a-user-interface) to create a bare bones UI.',
    );
  });

  it('keeps the react-js video quickstart local video section before remote video', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/video/get-started-sdk.mdx'),
      'utf8',
    );
    const reactJsSectionStart = source.indexOf(
      '<PlatformStructured platform="react-js">',
    );
    const unitySectionStart = source.indexOf(
      '<PlatformStructured platform="unity">',
    );

    expect(reactJsSectionStart).toBeGreaterThanOrEqual(0);
    expect(unitySectionStart).toBeGreaterThan(reactJsSectionStart);

    const reactJsSection = source.slice(reactJsSectionStart, unitySectionStart);

    expect(reactJsSection).toContain('### Display the local video');
    expect(reactJsSection).toContain('### Display remote video');
    expect(reactJsSection.indexOf('### Display the local video')).toBeLessThan(
      reactJsSection.indexOf('### Display remote video'),
    );
    expect(reactJsSection).toContain('<LocalUser');
    expect(reactJsSection).toContain('videoTrack={localCameraTrack}');
  });

  it('keeps the blueprint video quickstart new-project steps fully populated', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/video/get-started-sdk.mdx'),
      'utf8',
    );
    const blueprintSectionStart = source.indexOf(
      '<PlatformStructured platform="blueprint">',
    );

    expect(blueprintSectionStart).toBeGreaterThanOrEqual(0);

    const blueprintSection = source.slice(blueprintSectionStart);

    expect(blueprintSection).toContain('2. Configure your project as follows:');
    expect(blueprintSection).toContain('* **Language**: Select **Blueprint**.');
    expect(blueprintSection).toContain(
      '* **Target Platform**: Pick **Desktop**.',
    );
    expect(blueprintSection).toContain('Click **Create**.');
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

  it('keeps voice supported platforms expanded into the shared multi-platform structure', () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/voice/reference/supported-platforms.mdx',
      ),
      'utf8',
    );

    expect(source).toContain('<PlatformStructured platform="android">');
    expect(source).toContain('<PlatformStructured platform="ios">');
    expect(source).toContain('<PlatformStructured platform="web">');
    expect(source).toContain('<PlatformStructured platform="windows">');
    expect(source).toContain('<PlatformStructured platform="unreal">');
    expect(source).toContain('Voice SDK supports the following ABIs.');
    expect(source).not.toContain('| Android | <Slot name="android" /> |');
  });

  it('keeps video migration guide expanded into the shared ten-platform structure from the legacy source', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/video/reference/migration-guide.mdx'),
      'utf8',
    );

    expect(source).toContain('<PlatformStructured platform="android">');
    expect(source).toContain('<PlatformStructured platform="ios">');
    expect(source).toContain('<PlatformStructured platform="web">');
    expect(source).toContain('<PlatformStructured platform="macos">');
    expect(source).toContain('<PlatformStructured platform="windows">');
    expect(source).toContain('<PlatformStructured platform="electron">');
    expect(source).toContain('<PlatformStructured platform="flutter">');
    expect(source).toContain('<PlatformStructured platform="react-native">');
    expect(source).toContain('<PlatformStructured platform="unity">');
    expect(source).toContain('<PlatformStructured platform="unreal">');
    expect(source).not.toContain('<PlatformStructured platform="react-js">');
    expect(source).not.toContain('<PlatformStructured platform="blueprint">');
  });

  it('keeps optimize-multihost-video fully split into android ios and flutter platform sections', () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/video/build/manage-connection-and-quality/optimize-multihost-video.mdx',
      ),
      'utf8',
    );

    expect(source).toContain('<PlatformStructured platform="android">');
    expect(source).toContain('<PlatformStructured platform="ios">');
    expect(source).toContain('<PlatformStructured platform="flutter">');
    expect(source).not.toContain('<Tabs defaultValue="android"');
    expect(source).not.toContain('<TabsList>');
    expect(source).not.toContain('<TabsContent value="android">');
    expect(source).not.toContain('<TabsContent value="ios">');
    expect(source).not.toContain('<TabsContent value="flutter">');
  });

  it('keeps prevent-stream-bombing aligned with the legacy shared security guidance', () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'realtime-media/video/build/secure-and-protect-channels/prevent-stream-bombing.mdx',
      ),
      'utf8',
    );

    expect(source).toContain(
      'description: "Procedures to prevent and respond to room bombing."',
    );
    expect(source).toContain(
      'This page describes a series of measures to deal with room bombing and disruptive behavior',
    );
    expect(source).toContain(
      '[Secure authentication with tokens](../authenticate-users/authentication-workflow)',
    );
    expect(source).toContain(
      '[Channel Management RESTful API](/en/api-reference/api-ref/video)',
    );
    expect(source).toContain('`unsubscribe`');
    expect(source).not.toContain(
      'description: "Procedures to prevent and respond to housebreaking."',
    );
    expect(source).not.toContain(
      '[Secure authentication with tokens](../../authenticate-users/use-tokens.mdx)',
    );
  });

  it('keeps voice error codes page populated with platform-specific reference content', () => {
    const source = readFileSync(
      resolve(docsRoot, 'realtime-media/voice/reference/error-codes.mdx'),
      'utf8',
    );

    expect(source).toContain('## Common error codes');
    expect(source).toContain('## Audio-related error codes');
    expect(source).toContain('## Data stream-related error codes');
    expect(source).toContain(
      '| `109` | The currently used token has expired and is no longer valid. Generate a new token on the server side and call `renewToken` to update the token. |',
    );
    expect(source).toContain(
      '| `1501` | There is no permission to use the camera. Check if camera permission has been turned on. |',
    );
    expect(source).toContain('<PlatformStructured platform="android">');
    expect(source).toContain('<PlatformStructured platform="web">');
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
    expect(abr).toContain(
      'https://api.agora.io/{region}/v1/projects/{appId}/rtls/ingress/stream-templates/{templateId}',
    );
    expect(notifications).toContain('### Media Gateway event types');
    expect(notifications).toContain('### `live_stream_aborted` error codes');
    expect(features).toContain(
      '## Related APIs and implementation entry points',
    );
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
  }, SOURCE_LOADER_TEST_TIMEOUT);

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
  }, SOURCE_LOADER_TEST_TIMEOUT);

  it('renders AI model callout directives through the processed markdown pipeline', async () => {
    const { source } = await import('./source.server');
    const modelDocsRoot = resolve(docsRoot, 'ai/models');
    const filesWithCallouts = listMarkdownFiles(modelDocsRoot).filter(
      (file) => {
        const sourceText = readFileSync(file, 'utf8');
        return /^:{3,4}(?:caution|danger|info|note|tip|warn|warning)\b/m.test(
          sourceText,
        );
      },
    );

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
  }, SOURCE_LOADER_TEST_TIMEOUT);

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
      throw new Error(
        'Expected AI model regression pages to expose processed markdown.',
      );
    }

    const akoolProcessed = await akool.data.getText('processed');
    const deepgramProcessed = await deepgram.data.getText('processed');
    const elevenLabsProcessed = await elevenLabs.data.getText('processed');

    expect(
      akoolProcessed.match(/<CalloutContainer type="info">/g) ?? [],
    ).toHaveLength(3);
    expect(akoolProcessed).toContain('sales@agora.io');
    expect(deepgramProcessed).toContain('<CalloutContainer type="warning">');
    expect(deepgramProcessed).toContain('callback_method');
    expect(
      elevenLabsProcessed.match(/<CalloutContainer type="warning">/g) ?? [],
    ).toHaveLength(2);
    expect(elevenLabsProcessed).toContain('Paid plan required');
  }, SOURCE_LOADER_TEST_TIMEOUT);

  it('renders IoT authentication code tabs as MDX components', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      [
        'realtime-media',
        'iot',
        'build',
        'set-up-authentication-and-security',
        'authentication-workflow',
      ],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');
    expect(page?.path).toBe(
      'en/realtime-media/iot/build/set-up-authentication-and-security/authentication-workflow.mdx',
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
  }, SOURCE_LOADER_TEST_TIMEOUT);

  it('renders stream channel platform sections as MDX components', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      [
        'realtime-media',
        'rtm',
        'build',
        'work-with-channels',
        'stream-channel',
      ],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');
    expect(page?.path).toBe(
      'en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx',
    );

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected stream channel page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('<_PlatformTabsGroup');
    expect(processed).toContain('<_PlatformPanel platform="web">');
    expect(processed).toContain('<_PlatformPanel platform="android">');
    expect(processed).toContain('<_PlatformPanel platform="ios">');
    expect(processed).not.toContain('&lt;/CodeBlockTab&gt;');
    expect(processed).not.toContain('&lt;CodeBlockTab');
    expect(processed).not.toContain('&lt;PlatformStructured');
  }, SOURCE_LOADER_TEST_TIMEOUT);
});
