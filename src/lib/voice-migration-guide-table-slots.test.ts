import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import {
  remarkDirectiveAdmonition,
  remarkGfm,
} from 'fumadocs-core/mdx-plugins';
import remarkDirective from 'remark-directive';
import { describe, expect, it } from 'vitest';
import { remarkTableSlots } from './mdx/remark-table-slots';

const targetPath =
  'content/docs/en/realtime-media/voice/reference/migration-guide.mdx';

function readContent() {
  return readFileSync(resolve(process.cwd(), targetPath), 'utf8');
}

async function compileContent(source: string) {
  return String(
    await compile(source, {
      format: 'mdx',
      jsx: true,
      remarkPlugins: [
        remarkGfm,
        remarkDirective,
        [
          remarkDirectiveAdmonition,
          {
            types: {
              info: 'info',
              note: 'info',
            },
          },
        ],
        remarkTableSlots,
      ],
    }),
  );
}

describe('voice migration guide audio-route table', () => {
  it('renders audio-route comparison rows with list markup inside both tables', async () => {
    const source = readContent();
    const compiled = await compileContent(source);

    expect(source).toContain('<Slot name="audio-route-v3-default-route" />');
    expect(source).toContain('<Slot name="audio-route-v4-default-route" />');
    expect(source).toContain(
      '<Slot name="audio-route-objc-v3-default-route" />',
    );
    expect(source).toContain(
      '<Slot name="audio-route-objc-v4-default-route" />',
    );

    expect(compiled).toContain('<_components.ul>');
    expect(compiled).toContain(
      '<_components.li>{"You can only set the audio route before joining a channel."}</_components.li>',
    );
    expect(compiled).toContain(
      '<_components.li>{"You can set the audio route either before or after joining a channel."}</_components.li>',
    );
    expect(compiled).toContain(
      '<_components.li>{"This method only controls the initial state of the audio route and does not change the default audio route of the system. For example, regardless of whether you set the parameter of "}<_components.code>{"setDefaultAudioRouteToSpeakerphone"}</_components.code>{" to "}<_components.code>{"YES"}</_components.code>{" or "}<_components.code>{"NO"}</_components.code>{", calling "}<_components.code>{"setEnableSpeakerphone(NO)"}</_components.code>{" changes the audio route to the earpiece."}</_components.li>',
    );
    expect(compiled).toContain(
      '<_components.li>{"This method is a steady API and can change the default audio route of the system. For example, after calling "}<_components.code>{"setDefaultAudioRouteToSpeakerphone(YES)"}</_components.code>{" to set the initial audio route to the speakerphone, calling "}<_components.code>{"setEnableSpeakerphone(NO)"}</_components.code>{" cannot change the audio route to the earpiece."}</_components.li>',
    );
  });
});
