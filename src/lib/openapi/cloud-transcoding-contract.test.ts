import Ajv2020 from 'ajv/dist/2020';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import source from '../../../content/openapi/cloud-transcoding/cloud-transcoding.en.yaml?raw';
import { buildOpenApiSchemaRows } from './schema-tree';

const document = load(source) as {
  components: { schemas: Record<string, object> };
  paths: Record<
    string,
    {
      post?: {
        'x-docs-sections': { title?: string; markdown: string }[];
      };
    }
  >;
};
const ajv = new Ajv2020({ strict: false, allErrors: true });
const validate = ajv.compile({
  $ref: '#/components/schemas/transcoder-config',
  components: document.components,
});
const rtc = {
  rtcChannel: 'output-channel',
  rtcUid: 1000,
  rtcToken: '<output-token>',
};
const cdn = (count: number) => ({
  streamUrl: Array.from(
    { length: count },
    (_, index) => `rtmp://cdn.example.com/live/stream${index}`,
  ),
});
const valid = (outputs: object[]) =>
  validate({ canvas: { width: 1280, height: 720, color: 0 }, outputs });

describe('Cloud Transcoding output contract', () => {
  it('accepts one RTC output', () => {
    expect(valid([{ rtc }]), JSON.stringify(validate.errors)).toBe(true);
  });

  it.each([1, 10])('accepts %i CDN addresses sharing one output', (count) => {
    expect(valid([cdn(count)]), JSON.stringify(validate.errors)).toBe(true);
  });

  it.each([0, 11])('rejects %i CDN addresses in an output', (count) => {
    expect(valid([cdn(count)])).toBe(false);
  });

  it('rejects an empty output list', () => {
    expect(valid([])).toBe(false);
  });

  it('rejects an output without a destination', () => {
    expect(valid([{}])).toBe(false);
  });

  it('rejects RTC and CDN in the same output', () => {
    expect(valid([{ rtc, ...cdn(1) }])).toBe(false);
  });

  it.each([[[{ rtc }, cdn(1)]], [[cdn(1), { rtc }]]])(
    'rejects a task mixing RTC and CDN outputs: %j',
    (outputs) => {
      expect(valid(outputs)).toBe(false);
    },
  );

  it('rejects more than one RTC output', () => {
    expect(
      valid([{ rtc }, { rtc: { ...rtc, rtcChannel: 'second-channel' } }]),
    ).toBe(false);
  });

  it('keeps destination fields conditional in the parameter table', () => {
    const rows = buildOpenApiSchemaRows(
      document.components.schemas['transcoder-output'],
      { document },
    );
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'rtc', required: false }),
        expect.objectContaining({ path: 'streamUrl', required: false }),
        expect.objectContaining({ path: 'rtc.rtcChannel', required: true }),
      ]),
    );
  });

  it('provides a complete schema-valid multi-CDN Create body', () => {
    const create =
      document.paths['/v1/projects/{appId}/rtsc/cloud-transcoder/tasks'].post;
    const section = create?.['x-docs-sections'].find(
      (item) => item.title === 'Publish to multiple CDNs',
    );
    const json = section?.markdown.match(/```json[^\n]*\n([\s\S]*?)\n```/);
    expect(json).toBeTruthy();
    const body = JSON.parse(json?.[1] ?? '{}');
    const validateRequest = ajv.compile({
      $ref: '#/components/schemas/cloud-transcoder-request',
      components: document.components,
    });
    expect(validateRequest(body), JSON.stringify(validateRequest.errors)).toBe(
      true,
    );
    expect(
      body.services.cloudTranscoder.config.transcoder.outputs[0].streamUrl,
    ).toHaveLength(2);
  });
});
