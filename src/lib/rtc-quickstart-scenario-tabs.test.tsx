import { readFileSync } from 'node:fs';
import { evaluate } from '@mdx-js/mdx';
import { fireEvent, render, screen, within } from '@testing-library/react';
import * as runtime from 'react/jsx-runtime';
import { describe, expect, it } from 'vitest';
import { getMDXComponents, MDXAccordionProvider } from '@/components/mdx';
import { docs } from '../../source.config';

const contentPath =
  'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx';

async function renderScenarioSteps() {
  const source = readFileSync(contentPath, 'utf8');
  const web = source.split('<PlatformStructured platform="web">')[1];
  const steps = web.slice(
    web.indexOf('### 3. 实现用户界面'),
    web.indexOf('### 7. 后续步骤'),
  );
  const configureMdx = docs.docs.mdxOptions;
  if (typeof configureMdx !== 'function') {
    throw new Error('Expected the documentation MDX compiler configuration.');
  }
  const { default: Body } = await evaluate(steps, {
    ...(await configureMdx('bundler')),
    ...runtime,
    development: false,
  });

  render(
    <MDXAccordionProvider>
      <Body components={getMDXComponents()} />
    </MDXAccordionProvider>,
  );
}

function chooseScenario(tablist: HTMLElement, scenario: string) {
  fireEvent.mouseDown(within(tablist).getByRole('tab', { name: scenario }), {
    button: 0,
    ctrlKey: false,
  });
}

describe('RTC Web quick-start scenario selection', () => {
  it('keeps the HTML, JavaScript and expected result on the same scenario from every step', async () => {
    sessionStorage.clear();
    localStorage.clear();
    await renderScenarioSteps();

    const tablists = screen.getAllByRole('tablist');
    expect(tablists).toHaveLength(3);

    for (const tablist of tablists) {
      for (const scenario of ['视频通话', '互动直播']) {
        chooseScenario(tablist, scenario);
        for (const relatedStep of tablists) {
          expect(
            within(relatedStep).getByRole('tab', { name: scenario }),
          ).toHaveAttribute('aria-selected', 'true');
        }
      }
    }
  }, 30000);
});
