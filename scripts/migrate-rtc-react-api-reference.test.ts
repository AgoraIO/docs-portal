import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'migrate-rtc-react-api-reference.mjs',
);

it('migrates the real React MDX source separately from Web TypeDoc', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rtc-react-migration-'));
  const source = path.join(root, 'react-sdk');
  const webSource = path.join(root, 'web');
  const output = path.join(root, 'output');
  await fs.mkdir(source, { recursive: true });
  await fs.mkdir(path.join(webSource, 'interfaces'), { recursive: true });
  const webInterfaces = [
    ['iagorartc', 'IAgoraRTC'],
    ['iagorartcclient', 'IAgoraRTCClient'],
    ['ilocaltrack', 'ILocalTrack'],
    ['ilocalaudiotrack', 'ILocalAudioTrack'],
    ['imicrophoneaudiotrack', 'IMicrophoneAudioTrack'],
    ['ibuffersourceaudiotrack', 'IBufferSourceAudioTrack'],
    ['ilocalvideotrack', 'ILocalVideoTrack'],
    ['icameravideotrack', 'ICameraVideoTrack'],
    ['iremotetrack', 'IRemoteTrack'],
    ['iremoteaudiotrack', 'IRemoteAudioTrack'],
    ['iremotevideotrack', 'IRemoteVideoTrack'],
  ];
  for (const [fileName, title] of webInterfaces) {
    await fs.writeFile(
      path.join(webSource, 'interfaces', `${fileName}.html`),
      `<div class="tsd-page-title"><h1>Interface ${title}</h1></div>`,
    );
  }
  await fs.writeFile(path.join(webSource, 'globals.html'), '<h1>Globals</h1>');
  const page = (title: string, body = '') =>
    `---\ntitle: ${title}\n---\n\n${body}\n`;
  await fs.writeFile(
    path.join(source, 'overview.react.mdx'),
    page(
      '概览',
      '<H2 className="anchor" id="react-sdk">React SDK</H2>\n[Web API](/api-ref/rtc/react/interfaces/iagorartc.html#createClient)',
    ),
  );
  for (const name of ['components', 'hooks', 'data-types']) {
    await fs.writeFile(path.join(source, `${name}.react.mdx`), page(name));
  }

  execFileSync(process.execPath, [
    SCRIPT,
    '--source',
    source,
    '--output',
    output,
    '--web-source',
    webSource,
  ]);

  const index = await fs.readFile(path.join(output, 'index.mdx'), 'utf8');
  expect(index).toContain('## React SDK');
  expect(index).not.toContain('<H2');
  expect(index).toContain(
    '/zh-CN/api-reference/rtc/web/interfaces/iagora-rtc#createClient',
  );
  await expect(
    fs.stat(path.join(output, 'react-sdk', 'overview.mdx')),
  ).resolves.toBeTruthy();
  const meta = JSON.parse(
    await fs.readFile(path.join(output, 'meta.json'), 'utf8'),
  );
  expect(meta.pages[0]).toMatchObject({ title: 'API 概览' });
  expect(meta.pages[1]).toMatchObject({ title: 'Web SDK API' });

  await fs.rm(root, { force: true, recursive: true });
});
