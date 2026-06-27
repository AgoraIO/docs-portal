import { describe, expect, it } from 'vitest';
import { deriveInstallCommand } from './sdk-install-command';

const v = (packageManager?: string) => ({
  id: 'x',
  label: 'Version 1.0.0',
  packageManager,
});

describe('deriveInstallCommand', () => {
  it('derives a Gradle command from a Maven Central URL', () => {
    expect(
      deriveInstallCommand(
        v(
          'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.6.3/aar',
        ),
      ),
    ).toEqual({
      tool: 'Gradle',
      command: "implementation 'io.agora.rtc:voice-sdk:4.6.3'",
    });
  });

  it('derives a Gradle command from a search.maven.org URL', () => {
    expect(
      deriveInstallCommand(
        v('https://search.maven.org/artifact/io.agora.rtc/chat-sdk/1.3.2/aar'),
      ),
    ).toEqual({
      tool: 'Gradle',
      command: "implementation 'io.agora.rtc:chat-sdk:1.3.2'",
    });
  });

  it('derives a pinned Flutter command from a pub.dev versions URL', () => {
    expect(
      deriveInstallCommand(
        v('https://pub.dev/packages/agora_rtc_engine/versions/6.6.2'),
      ),
    ).toEqual({
      tool: 'Flutter',
      command: 'flutter pub add agora_rtc_engine:6.6.2',
    });
  });

  it('derives an unpinned Flutter command from a pub.dev package URL', () => {
    expect(
      deriveInstallCommand(v('https://pub.dev/packages/agora_rtc_engine')),
    ).toEqual({ tool: 'Flutter', command: 'flutter pub add agora_rtc_engine' });
  });

  it('derives a pinned npm command from an unpkg URL', () => {
    expect(
      deriveInstallCommand(v('https://unpkg.com/agora-rtc-react@2.3.0/dist/')),
    ).toEqual({ tool: 'npm', command: 'npm i agora-rtc-react@2.3.0' });
  });

  it('handles a scoped unpkg package', () => {
    expect(
      deriveInstallCommand(v('https://unpkg.com/@agora/sdk@1.0.0/dist/')),
    ).toEqual({ tool: 'npm', command: 'npm i @agora/sdk@1.0.0' });
  });

  it('derives an unpinned npm command from an npmjs URL', () => {
    expect(
      deriveInstallCommand(v('https://www.npmjs.com/package/agora-chat')),
    ).toEqual({ tool: 'npm', command: 'npm i agora-chat' });
  });

  it('pins the version from a versioned npmjs URL', () => {
    expect(
      deriveInstallCommand(
        v('https://www.npmjs.com/package/agora-electron-sdk/v/4.1.0'),
      ),
    ).toEqual({ tool: 'npm', command: 'npm i agora-electron-sdk@4.1.0' });
  });

  it('handles a scoped, versioned npmjs package', () => {
    expect(
      deriveInstallCommand(
        v('https://www.npmjs.com/package/@netless/fastboard/v/1.1.0'),
      ),
    ).toEqual({ tool: 'npm', command: 'npm i @netless/fastboard@1.1.0' });
  });

  it('derives a Swift Package URL from a Swift Package Index URL', () => {
    expect(
      deriveInstallCommand(
        v('https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS'),
      ),
    ).toEqual({
      tool: 'Swift Package Manager',
      command: 'https://github.com/AgoraIO/AgoraAudio_iOS',
    });
  });

  it('derives a pip command from a pypi URL', () => {
    expect(
      deriveInstallCommand(
        v('https://pypi.org/project/agora-python-server-sdk/'),
      ),
    ).toEqual({ tool: 'pip', command: 'pip install agora-python-server-sdk' });
  });

  it('returns null for github release/source pages', () => {
    expect(
      deriveInstallCommand(v('https://github.com/AgoraIO/AgoraChat_iOS.git')),
    ).toBeNull();
  });

  it('returns null for an unknown host', () => {
    expect(
      deriveInstallCommand(v('https://downloadsdk.easemob.com/whatever')),
    ).toBeNull();
  });

  it('returns null when packageManager is missing', () => {
    expect(deriveInstallCommand(v(undefined))).toBeNull();
  });
});
