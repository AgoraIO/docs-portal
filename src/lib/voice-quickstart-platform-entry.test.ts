import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const voiceQuickstart = readFileSync(
  resolve(process.cwd(), 'content/docs/en/realtime-media/voice/quickstart.mdx'),
  'utf8',
);

describe('Voice quickstart platform entry', () => {
  it('keeps the current platform and platform selector clear on the first screen', () => {
    expect(voiceQuickstart).toContain(
      'description: "Build a Voice Calling app for your selected platform, and switch platforms with the selector below."',
    );
    expect(voiceQuickstart).toContain(
      'This Android quickstart shows you how to create a basic Voice Calling app using the Agora Voice SDK. Switch to the [iOS](/en/realtime-media/voice/quickstart/ios) or [Web](/en/realtime-media/voice/quickstart/web) quickstart, or choose another platform from the selector.',
    );
    expect(voiceQuickstart).toContain(
      'This Web quickstart shows you how to create a basic Voice Calling app using the Agora Voice SDK. Switch to the [Android](/en/realtime-media/voice/quickstart/android) or [iOS](/en/realtime-media/voice/quickstart/ios) quickstart, or choose another platform from the selector.',
    );
    expect(voiceQuickstart).not.toContain(
      'Explore sample implementations to quickly integrate Conversational AI.',
    );
  });
});
