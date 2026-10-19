import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import type { OpenAPIV3 } from 'openapi-types';
import { describe, expect, it } from 'vitest';

const productRoot = 'content/docs/zh-CN/realtime-media/cloud-recording';
const individualGuide = 'build/recording-modes/individual-mode/set-individual';
const fileGuide = 'build/manage-recorded-files/introduce-recorded-files';
const startPath =
  '/v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/mode/{mode}/start';

function readContent(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function readOpenApi(locale: string) {
  return yaml.load(
    readContent(
      `content/openapi/cloud-recording/cloud-recording.${locale}.yaml`,
    ),
  ) as OpenAPIV3.Document;
}

describe('Cloud Recording upstream PR #2091 parity', () => {
  it('removes v1 streamMode from the Chinese raw-mode schema and examples', () => {
    const document = readOpenApi('zh-CN');
    const config = document.components?.schemas
      ?.recordingConfig as OpenAPIV3.SchemaObject;
    const request = document.paths[startPath]?.post
      ?.requestBody as OpenAPIV3.RequestBodyObject;

    expect(config.properties).not.toHaveProperty('streamMode');
    expect(JSON.stringify(request.content)).not.toContain('streamMode');
    expect(request.content['application/json'].examples).toMatchObject({
      单流转码录制: {
        value: {
          clientRequest: {
            recordingFileConfig: { avFileType: ['hls', 'mp4'] },
          },
        },
      },
      单流不转码录制: {
        value: {
          clientRequest: {
            recordingFileConfig: { avFileType: ['hls', 'mp3'] },
          },
        },
      },
      单流录制且云端截图: {
        value: {
          clientRequest: {
            recordingFileConfig: { avFileType: ['hls', 'mp4'] },
          },
        },
      },
    });
  });

  it('documents raw output combinations, segmentation, and stranded uploads', () => {
    const schemas = readOpenApi('zh-CN').components?.schemas;
    const files = schemas?.recordingFileConfig as OpenAPIV3.SchemaObject;
    const fileType = files.properties?.avFileType as OpenAPIV3.SchemaObject;
    const upload = schemas?.['uploadingStatus-r'] as OpenAPIV3.SchemaObject;

    expect(fileType.description).toContain('["hls","mp4"]');
    expect(fileType.description).toContain('["hls","mp3"]');
    expect(fileType.description).toContain('约 3 小时');
    expect(fileType.description).toContain('默认 180 分钟');
    expect(fileType.description).not.toContain('约 2 小时');
    expect(upload.description).toContain('"stranded"');
  });

  it('keeps the English reference duration changes in sync', () => {
    const source = readContent(
      'content/openapi/cloud-recording/cloud-recording.en.yaml',
    );
    expect(source).toContain('~3 hours');
    expect(source).not.toContain('~2 hours');
    expect(source).toMatch(
      /maxVideoDuration:\s+type: (?:number|integer)\s+default: 180/,
    );
  });

  it('documents the Go MP4 duration default as 180 minutes', () => {
    const source = readContent(
      'content/docs/zh-CN/api-reference/cloud-recording/go-api/struct.go.mdx',
    );
    const row = source
      .split('\n')
      .find((line) => line.startsWith('| `MaxVideoDuration`'));
    expect(row).toContain('默认值为 180');
  });

  it.each([
    [individualGuide, '实现单流录制（旧版）', 'mode/individual/stop'],
    [fileGuide, '录制文件介绍（旧版）', '__uid_e_<type>_utc.ts'],
  ])('preserves the v1 content and links from %s', (guide, title, marker) => {
    const legacyGuide = guide.replace(/\/([^/]+)$/, '/legacy-$1');
    const path = `${productRoot}/${legacyGuide}.mdx`;
    expect(existsSync(resolve(process.cwd(), path))).toBe(true);

    const legacy = readContent(path);
    expect(legacy).toContain(`title: "${title}"`);
    expect(legacy).toContain(marker);
    expect(legacy).not.toMatch(/<(Admonition|TabItem|Image|Table|Tr|Td)\b/);
    expect(readContent(`${productRoot}/${guide}.mdx`)).toContain(
      `/zh-CN/realtime-media/cloud-recording/${legacyGuide}`,
    );
  });

  it('links both historical release entries to the preserved v1 guide', () => {
    const source = readContent(`${productRoot}/reference/release-notes.mdx`);
    const legacyUrl =
      '/zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/legacy-set-individual';
    expect(source.split(legacyUrl)).toHaveLength(3);
  });

  it('preserves readable placeholders and a rectangular legacy naming table', () => {
    const source = readContent(
      `${productRoot}/build/manage-recorded-files/legacy-introduce-recorded-files.mdx`,
    );
    expect(source).not.toMatch(/`&lt;(?:utc|timestamp)&gt;`/);
    const rows = source.split('\n').filter((line) => line.startsWith('|'));
    expect(rows.length).toBeGreaterThan(2);
    for (const row of rows) {
      expect(row.split('|')).toHaveLength(4);
    }
  });

  it('keeps the old non-transcoding and legacy pages out of primary navigation', () => {
    const navigation = JSON.parse(
      readContent(
        `${productRoot}/build/recording-modes/individual-mode/meta.json`,
      ),
    );
    expect(navigation.pages).toEqual(['set-individual']);
    expect(
      readContent(`${productRoot}/build/manage-recorded-files/meta.json`),
    ).not.toContain('legacy-introduce-recorded-files');
  });
});
