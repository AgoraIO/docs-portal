import { readFileSync } from 'node:fs';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { selectPlatformMarkdown } from '@/test/platform-markdown';
import { renderDocsMdx } from '@/test/render-docs-mdx';

const cloudSource = readFileSync(
  'content/docs/zh-CN/realtime-media/cloud-recording/build/monitor-events/enable-ncs.mdx',
  'utf8',
);
const rtmSource = readFileSync(
  'content/docs/zh-CN/realtime-media/rtm/build/rtm-initialization/application-setup.mdx',
  'utf8',
);
const signatureExamples = [
  { name: 'Python', sha1: 'hashlib.sha1', sha256: 'hashlib.sha256' },
  { name: 'Node.js', sha1: "createHmac('sha1'", sha256: "createHmac('sha256'" },
  {
    name: 'Java',
    sha1: 'getInstance("HmacSHA1")',
    sha256: 'getInstance("HmacSHA256")',
  },
  { name: 'PHP', sha1: "hash_hmac('sha1'", sha256: "hash_hmac('sha256'" },
];

function chooseTab(tab: HTMLElement) {
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
  fireEvent.mouseUp(tab, { button: 0 });
  fireEvent.click(tab);
}

async function openSignatureExample(name: string) {
  const button = screen.getByRole('button', { name: `${name} 示例` });
  if (button.getAttribute('aria-expanded') !== 'true') fireEvent.click(button);
  await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'true'));
  return screen.getByRole('region', { name: `${name} 示例` });
}

function expectSignature(
  region: HTMLElement,
  algorithm: 'sha1' | 'sha256',
  code: string,
) {
  const selected = within(region).getByRole('tab', {
    name: algorithm === 'sha1' ? 'HMAC/SHA1' : 'HMAC/SHA256',
    selected: true,
  });
  expect(selected).toBeVisible();
  const panel = document.getElementById(
    selected.getAttribute('aria-controls') ?? '',
  );
  expect(panel).toHaveAttribute('role', 'tabpanel');
  expect(panel?.textContent).toContain(code);
}

describe('Chinese service guide synchronized choices', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('keeps the signature algorithm while switching all four collapsed examples', async () => {
    await renderDocsMdx(cloudSource);
    for (let index = 0; index < signatureExamples.length; index += 1) {
      const origin = signatureExamples[index];
      const destination =
        signatureExamples[(index + 1) % signatureExamples.length];
      for (const algorithm of ['sha256', 'sha1'] as const) {
        const originRegion = await openSignatureExample(origin.name);
        chooseTab(
          within(originRegion).getByRole('tab', {
            name: algorithm === 'sha1' ? 'HMAC/SHA1' : 'HMAC/SHA256',
          }),
        );
        await waitFor(() =>
          expectSignature(originRegion, algorithm, origin[algorithm]),
        );
        const destinationRegion = await openSignatureExample(destination.name);
        expect(
          screen.getByRole('button', { name: `${origin.name} 示例` }),
        ).toHaveAttribute('aria-expanded', 'false');
        await waitFor(() =>
          expectSignature(destinationRegion, algorithm, destination[algorithm]),
        );
      }
    }
  }, 30_000);

  it('keeps npm, pnpm and Yarn aligned from any of the three Web installation scenarios', async () => {
    await renderDocsMdx(selectPlatformMarkdown(rtmSource, 'web'));
    const choices = [
      {
        name: '使用 npm',
        standalone: 'npm install agora-rtm',
        combined: 'npm install agora-rtx',
      },
      {
        name: '使用 pnpm',
        standalone: 'pnpm add agora-rtm',
        combined: 'pnpm add agora-rtx --shamefully-hoist',
      },
      {
        name: '使用 Yarn',
        standalone: 'yarn add agora-rtm',
        combined: 'yarn add agora-rtx',
      },
    ];
    for (let origin = 0; origin < 3; origin += 1) {
      for (const choice of choices) {
        const controls = screen.getAllByRole('tab', { name: choice.name });
        expect(controls).toHaveLength(3);
        chooseTab(controls[origin]);
        await waitFor(() =>
          expect(
            screen.getAllByRole('tab', { name: choice.name, selected: true }),
          ).toHaveLength(3),
        );
        const selected = screen.getAllByRole('tab', {
          name: choice.name,
          selected: true,
        });
        const panels = selected.map((tab) =>
          document.getElementById(tab.getAttribute('aria-controls') ?? ''),
        );
        expect(panels[0]?.textContent).toContain(choice.standalone);
        expect(panels[1]?.textContent).toContain(choice.standalone);
        expect(panels[2]?.textContent).toContain(choice.combined);
      }
    }
  }, 30_000);
});
