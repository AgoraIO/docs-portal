import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const voiceQuickstart = readFileSync(
  resolve(
    process.cwd(),
    'content/docs/en/realtime-media/rtc/voice-quickstart.mdx',
  ),
  'utf8',
);

describe('RTC voice-only quickstart platform entry', () => {
  it('keeps the voice-only purpose clear on the first screen', () => {
    expect(voiceQuickstart).toContain(
      'description: "Build a voice-only app using the Agora RTC SDK."',
    );
    expect(voiceQuickstart).toContain(
      'This page provides a step-by-step guide on how to create a voice-only app using the Agora RTC SDK.',
    );
    expect(voiceQuickstart).not.toContain(
      'Explore sample implementations to quickly integrate Conversational AI.',
    );
  });
});
