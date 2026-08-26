import { describe, expect, it } from 'vitest';
import {
  buildAlgoliaContentDocsRecords,
  buildAlgoliaOpenApiRecord,
  classifySearchCategory,
  extractDocSearchContent,
  toPlainText,
} from './algolia-records.server';

describe('buildAlgoliaContentDocsRecords', () => {
  it('indexes only page-tree-visible docs with real breadcrumbs', async () => {
    const visibleUrl = '/en/realtime-media/voice/reference/pricing';
    const hiddenUrl = '/en/realtime-media/voice/reference/billing-policies';
    const records = buildAlgoliaContentDocsRecords(
      [
        {
          content: 'Voice pricing details.',
          title: 'Pricing',
          url: visibleUrl,
        },
        {
          content: 'Billing and account policies.',
          title: 'Policies',
          url: hiddenUrl,
        },
      ],
      new Map([
        [
          'en',
          new Map([
            [
              visibleUrl,
              ['RTC', 'Build Live Interaction', 'Voice Calling', 'Reference'],
            ],
          ]),
        ],
      ]),
    );

    expect(records.some((record) => record.url === hiddenUrl)).toBe(false);
    expect(
      records.find((record) => record.url === visibleUrl)?.breadcrumbs,
    ).toEqual(['RTC', 'Build Live Interaction', 'Voice Calling', 'Reference']);
  });

  it('indexes hidden FAQ leaf pages with stable fallback breadcrumbs', () => {
    const records = buildAlgoliaContentDocsRecords(
      [
        {
          content: 'Troubleshoot a black screen.',
          title: 'How can I fix black screen issues?',
          url: '/en/api-reference/faq/quality/video_blank',
        },
        {
          content: 'Troubleshoot Bluetooth devices on iOS.',
          title: "Why can't I answer calls through a Bluetooth device?",
          url: '/en/api-reference/faq/quality/ios_bluetooth',
        },
      ],
      new Map([['en', new Map()]]),
    );

    expect(records.map(({ url }) => url)).toEqual([
      '/en/api-reference/faq/quality/video_blank',
      '/en/api-reference/faq/quality/ios_bluetooth',
    ]);
    expect(records.map(({ breadcrumbs }) => breadcrumbs)).toEqual([
      ['Reference', 'FAQ', 'Quality'],
      ['Reference', 'FAQ', 'Quality'],
    ]);
  });

  it('indexes hidden product overviews with humanized RTC breadcrumbs', () => {
    const records = buildAlgoliaContentDocsRecords(
      [
        {
          content: 'Low-latency interactive streaming.',
          title: 'Interactive Live Streaming Overview',
          url: '/en/realtime-media/interactive-live-streaming/product-overview',
        },
        {
          content: 'One-to-many broadcast delivery.',
          title: 'Broadcast Streaming Overview',
          url: '/en/realtime-media/broadcast-streaming/product-overview',
        },
      ],
      new Map([['en', new Map()]]),
    );

    expect(records.map(({ url }) => url)).toEqual([
      '/en/realtime-media/interactive-live-streaming/product-overview',
      '/en/realtime-media/broadcast-streaming/product-overview',
    ]);
    expect(records.map(({ breadcrumbs }) => breadcrumbs)).toEqual([
      ['RTC', 'Interactive Live Streaming'],
      ['RTC', 'Broadcast Streaming'],
    ]);
  });

  it('does not use fallback breadcrumbs for arbitrary hidden pages', () => {
    const records = buildAlgoliaContentDocsRecords(
      [
        {
          content: 'This hidden page is not explicitly searchable.',
          title: 'Hidden draft',
          url: '/en/realtime-media/rtc/build/hidden-draft',
        },
      ],
      new Map([['en', new Map()]]),
    );

    expect(records).toEqual([]);
  });
});

describe('buildAlgoliaOpenApiRecord', () => {
  it('uses canonical page-tree breadcrumbs for generated endpoints', () => {
    const breadcrumbs = [
      'Reference',
      'API reference',
      'All SDK versions',
      'Conversational AI',
    ];
    const record = buildAlgoliaOpenApiRecord({
      breadcrumbs,
      content: 'Start an agent.',
      laneId: 'conversational-ai',
      locale: 'en',
      method: 'post',
      operationId: 'start-agent',
      path: '/v2/projects/{appid}/join',
      tab: 'api-reference',
      title: 'Start an agent',
      url: '/en/api-reference/api-ref/conversational-ai/join',
    });

    expect(record.breadcrumbs).toEqual(breadcrumbs);
  });
});

describe('extractDocSearchContent', () => {
  const markdown = [
    '## Get started',
    '',
    'Use **bold** text and a [signaling link](https://example.com/signaling) here.',
    '',
    'Call `startRecording()` to begin.',
    '',
    '```ts',
    'const client = createSttClient();',
    'client.joinChannel();',
    '```',
    '',
    ':::note',
    'Remember to release resources.',
    ':::',
    '',
    '| Method | Description |',
    '| ------ | ----------- |',
    '| joinChannel | Joins a channel |',
  ].join('\n');

  const { contents, headings } = extractDocSearchContent(markdown);
  const joined = contents.map((block) => block.content).join('\n');

  it('strips Markdown syntax, keeping readable text', () => {
    expect(joined).toContain('Use bold text');
    expect(joined).not.toMatch(/\*\*/); // no bold markers
    expect(joined).not.toMatch(/`/); // no inline-code backticks
    expect(joined).toContain('startRecording()'); // inline-code text kept
    expect(joined).toContain('signaling link'); // link text kept
    expect(joined).not.toContain('https://example.com'); // url dropped
    expect(joined).not.toMatch(/:::/); // directive markers gone
    expect(joined).toContain('Remember to release resources'); // directive body kept
  });

  it('flattens table markup to cell text', () => {
    expect(joined).not.toMatch(/\|/); // no table pipes
    expect(joined).not.toMatch(/----/); // no separator rows
    expect(joined).toContain('joinChannel');
    expect(joined).toContain('Joins a channel');
  });

  it('keeps code-block identifiers searchable, without fences', () => {
    expect(joined).toContain('createSttClient');
    expect(joined).toContain('startRecording');
    expect(joined).not.toMatch(/```/); // no fenced-code delimiters
  });

  it('extracts headings with slugged ids', () => {
    expect(headings).toContainEqual(
      expect.objectContaining({ content: 'Get started' }),
    );
  });

  it('groups blocks under a heading into one section record', () => {
    const doc = [
      '## Setup',
      '',
      'First paragraph about setup.',
      '',
      'Second paragraph about setup.',
      '',
      '## Usage',
      '',
      'Usage details here.',
    ].join('\n');

    const result = extractDocSearchContent(doc);

    // Both paragraphs under "Setup" collapse into a single section record
    // rather than one record per paragraph (which would bloat the index).
    const setupBlock = result.contents.find((block) =>
      block.content.includes('First paragraph about setup.'),
    );
    expect(setupBlock?.content).toContain('Second paragraph about setup.');
    // One record per heading section, not per paragraph.
    expect(result.contents).toHaveLength(2);
  });
});

describe('classifySearchCategory', () => {
  it('flags glossary pages', () => {
    expect(
      classifySearchCategory('/en/realtime-media/video/reference/glossary'),
    ).toBe('glossary');
    expect(classifySearchCategory('/en/introduction/glossary')).toBe(
      'glossary',
    );
  });

  it('flags legacy and deprecated pages', () => {
    expect(
      classifySearchCategory(
        '/en/realtime-media/video/reference/pricing-legacy',
      ),
    ).toBe('deprecated');
    expect(
      classifySearchCategory(
        '/en/api-reference/whiteboard/file-conversion-deprecated',
      ),
    ).toBe('deprecated');
  });

  it('treats features and normal reference as default', () => {
    expect(
      classifySearchCategory('/en/realtime-media/video/build/simulcasting'),
    ).toBe('default');
    // Normal reference (pricing, error-codes) stays default — not demoted.
    expect(classifySearchCategory('/en/solutions/iot/reference/pricing')).toBe(
      'default',
    );
  });
});

describe('toPlainText', () => {
  it('unwraps Markdown links and inline code (OpenAPI descriptions)', () => {
    // Shape seen in OpenAPI field descriptions: a link wrapping inline code.
    expect(
      toPlainText('Inherits the [`interruption`](#properties) field.'),
    ).toBe('Inherits the interruption field.');
    expect(toPlainText('See ![diagram](https://x.com/d.png) above.')).toBe(
      'See diagram above.',
    );
  });

  it('strips emphasis but leaves literal underscores in identifiers', () => {
    expect(toPlainText('Set **filler_words.enable** to `true`.')).toBe(
      'Set filler_words.enable to true.',
    );
  });
});
