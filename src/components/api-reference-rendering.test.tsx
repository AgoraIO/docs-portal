import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { createInstance } from 'i18next';
import { createElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import { resources } from '@/lib/i18n/resources';
import {
  ApiReturns,
  ApiReturnType,
  ApiSignature,
  getMDXComponents,
  Parameter,
  ParameterList,
  ParameterType,
} from './mdx';

it.each(['void', 'Promise<void>', 'boolean'])(
  'shows the return type %s without an empty description table',
  (type) => {
    const { container } = render(
      <ApiReturns>
        <ApiReturnType>
          <p>{type}</p>
        </ApiReturnType>
        {'\n  '}
        {createElement('a', { id: 'return-anchor' })}
      </ApiReturns>,
    );
    expect(container.querySelector('[data-api-returns]')).toHaveTextContent(
      type,
    );
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelector('[data-api-return-description]')).toBeNull();
    expect(container.querySelector('#return-anchor')).toBeInTheDocument();
  },
);

it('keeps historical parameter anchors in their row without adding empty prose blocks', () => {
  const { container } = render(
    <ParameterList>
      {createElement('a', { id: 'watermarkurl' })}
      <Parameter name="watermarkUrl">
        <p>Path to the image.</p>
      </Parameter>
      <Parameter name="options">
        {createElement('a', { id: 'options' })}
        <p>Image options.</p>
      </Parameter>
    </ParameterList>,
  );
  for (const id of ['watermarkurl', 'options']) {
    const anchor = container.querySelector(`#${id}`);
    expect(anchor?.closest('[data-parameter-item]')).toBeInTheDocument();
    expect(anchor?.closest('[data-parameter-description]')).toBeNull();
  }
  const descriptions = container.querySelectorAll(
    '[data-parameter-description]',
  );
  expect(
    [...descriptions].map((node) => node.firstElementChild?.tagName),
  ).toEqual(['P', 'P']);
});

it('preserves description-only returns and empty return destinations', () => {
  const { container } = render(
    <>
      <ApiReturns>
        <p>The operation completes asynchronously.</p>
      </ApiReturns>
      <ApiReturns>{createElement('a', { id: 'empty-return' })}</ApiReturns>
    </>,
  );
  expect(container.querySelectorAll('table')).toHaveLength(1);
  expect(container.querySelectorAll('th')).toHaveLength(1);
  expect(
    container.querySelector('[data-api-return-description]'),
  ).toHaveTextContent('The operation completes asynchronously.');
  expect(container.querySelector('#empty-return')).toBeInTheDocument();
});

it('keeps a long return type as linked text in the native table without changing its value', () => {
  render(
    <ApiReturns title="Returns">
      <ApiReturnType>
        <p>
          Promise&lt;[<a href="#video">ILocalVideoTrack</a>,{' '}
          <a href="#audio">ILocalAudioTrack</a>]&gt;
        </p>
      </ApiReturnType>
      <p>The tracks returned by this overload.</p>
    </ApiReturns>,
  );
  const type = screen
    .getByRole('link', { name: 'ILocalVideoTrack' })
    .closest('[data-api-return-type]');
  expect(type?.textContent).toBe(
    'Promise<[ILocalVideoTrack, ILocalAudioTrack]>',
  );
  expect(type?.closest('table')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'ILocalAudioTrack' }),
  ).toHaveAttribute('href', '#audio');
});

describe('shared API reference rendering', () => {
  it.each(['cards', 'table'] as const)(
    'uses the ordinary DocsTable primitive for %s parameters',
    (variant) => {
      const { table: Table } = getMDXComponents();
      const { container } = render(
        <>
          <Table data-testid="ordinary">
            <tbody>
              <tr>
                <td>Ordinary cell</td>
              </tr>
            </tbody>
          </Table>
          <ParameterList title="Parameters" variant={variant}>
            {/* Imported legacy anchors intentionally have no href/content. */}
            {/* biome-ignore lint/a11y/useAnchorContent: regression fixture for historical destinations. */}
            {/* biome-ignore lint/a11y/useValidAnchor: destination anchor, not a link. */}
            <a id="legacy-uid" />
            <Parameter direction="[in]" name="uid" type="number">
              <p>
                User identifier. See <a href="/en/api-reference/user">User</a>.
              </p>
              <ul>
                <li>Zero selects the local user.</li>
              </ul>
            </Parameter>
          </ParameterList>
        </>,
      );
      const parameter = screen
        .getByText('uid')
        .closest('[data-parameter-item]');
      expect(parameter?.tagName).toBe('TR');
      const table = parameter?.closest('table');
      expect(table?.className).toBe(screen.getByTestId('ordinary').className);
      expect(table?.closest('.docs-table-container')).toBeInTheDocument();
      expect(
        within(table as HTMLElement).getAllByRole('columnheader'),
      ).toHaveLength(2);
      expect(parameter?.querySelector('#legacy-uid')).toBeInTheDocument();
      expect(
        parameter?.querySelector('[data-parameter-description] li'),
      ).toHaveTextContent('Zero selects');
      expect(
        within(parameter as HTMLElement).getByRole('link', { name: 'User' }),
      ).toHaveAttribute('href', '/en/api-reference/user');
      expect(container.querySelector('tbody > a')).toBeNull();
    },
  );

  it('uses the native Fumadocs code frame and copy action without flattening type links', () => {
    render(
      <ApiSignature labels="extern static">
        <p>
          int open(<a href="/en/api-reference/config">Config</a> *config);
        </p>
      </ApiSignature>,
    );
    const signature = screen
      .getByRole('link', { name: 'Config' })
      .closest('[data-api-signature]');
    expect(signature?.tagName).toBe('FIGURE');
    expect(signature?.querySelector('pre code')).toHaveTextContent(
      'int open(Config *config);',
    );
    expect(signature?.querySelector('pre p')).toBeNull();
    expect(
      within(signature as HTMLElement).getByRole('button', {
        name: 'Copy Text',
      }),
    ).toBeInTheDocument();
    expect(within(signature as HTMLElement).getByText('extern')).toBeVisible();
    expect(
      within(signature as HTMLElement).getByRole('link', { name: 'Config' }),
    ).toHaveAttribute('href', '/en/api-reference/config');
  });
});

describe('bilingual shared primitive contracts', () => {
  it('keeps direct nested fields, deeper groups and callback return descriptions', () => {
    const { container } = render(
      <ParameterList>
        <Parameter name="options">
          <Parameter name="callback" type="function">
            <ApiReturns>
              <p>The callback result stays documented.</p>
            </ApiReturns>
            <Parameter name="enabled" type="boolean" optional />
          </Parameter>
        </Parameter>
      </ParameterList>,
    );
    const lists = container.querySelectorAll('[data-parameter-nested]');
    expect(lists).toHaveLength(2);
    for (const list of lists) {
      expect(list.tagName).toBe('UL');
      expect(list.querySelector('[data-parameter-item]:not(li)')).toBeNull();
    }
    expect(
      screen.getByText('The callback result stays documented.'),
    ).toBeVisible();
    expect(container.querySelector('ul > div, ul > a')).toBeNull();
  });
  it.each(['en', 'zh-CN'])(
    'keeps nested object fields as native lists in %s',
    async (locale) => {
      const engine = createInstance();
      await engine.init({ lng: locale, resources });
      const { container } = render(
        <I18nextProvider i18n={engine}>
          <ParameterList>
            <Parameter name="options" type="object" optional>
              <p>Join options.</p>
              <ParameterList>
                <Parameter name="uid">
                  <ParameterType>
                    <p>
                      <a href="#uid-type">UID</a>
                    </p>
                  </ParameterType>
                </Parameter>
                <Parameter name="autoSubscribe" type="boolean" optional />
                <Parameter name="networkQualityProbe" type="boolean" optional>
                  See <a href="#probe">the probe</a>.
                </Parameter>
              </ParameterList>
            </Parameter>
          </ParameterList>
        </I18nextProvider>,
      );
      const nested = container.querySelector('[data-parameter-nested]');
      expect(nested?.tagName).toBe('UL');
      expect(nested?.querySelectorAll(':scope > li')).toHaveLength(3);
      expect(nested?.closest('td')).toBeInTheDocument();
      expect(nested?.querySelector('table, section')).toBeNull();
      expect(
        within(nested as HTMLElement).getByRole('link', { name: 'the probe' }),
      ).toHaveAttribute('href', '#probe');
      expect(nested).toHaveTextContent('autoSubscribe');
      expect(nested).toHaveTextContent(/optional/i);
      const richType = within(nested as HTMLElement)
        .getByRole('link', { name: 'UID' })
        .closest('[data-parameter-type]');
      expect(richType?.tagName).toBe('SPAN');
      expect(richType?.querySelector('p')).toBeNull();
    },
  );
  it.each([
    ['en', 'Parameter', 'Description', 'Horizontally scrollable table'],
    ['zh-CN', '参数名', '描述', '可横向滚动的表格'],
  ])(
    'localizes the same native table in %s',
    async (locale, name, description, label) => {
      const engine = createInstance();
      await engine.init({ lng: locale, resources });
      render(
        <I18nextProvider i18n={engine}>
          <ParameterList>
            <Parameter name="uid">Identifier.</Parameter>
          </ParameterList>
        </I18nextProvider>,
      );
      expect(screen.getByRole('columnheader', { name })).toBeVisible();
      expect(
        screen.getByRole('columnheader', { name: description }),
      ).toBeVisible();
      expect(screen.getByRole('region', { name: label })).toBeInTheDocument();
    },
  );
  it('copies signature text without metadata and keeps the type link interactive', async () => {
    const write = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    render(
      <ApiSignature labels="extern static">
        <p>
          int open(<a href="/en/api-reference/config">Config</a> *config);
        </p>
      </ApiSignature>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy Text' }));
    await waitFor(() =>
      expect(write).toHaveBeenCalledWith('int open(Config *config);'),
    );
    write.mockRestore();
  });
});

it('treats MDX paragraph soft breaks as whitespace while preserving signature links', () => {
  const { container } = render(
    <ApiSignature labels="pure virtual">
      <p>
        {'virtual bool getStatistics(\n'}
        <a href="#stats">RemoteVideoTrackStats</a>
        {'\n &\n stats\n)'}
      </p>
    </ApiSignature>,
  );
  const code = container.querySelector('[data-api-signature] pre code');
  expect(code?.querySelector(':scope > .line')?.textContent).toBe(
    code?.textContent,
  );
  expect(container.querySelector('[data-api-signature]')).not.toHaveAttribute(
    'data-line-numbers',
  );
  expect(code?.textContent).toBe(
    'virtual bool getStatistics( RemoteVideoTrackStats & stats )',
  );
  expect(code?.querySelector('a')?.getAttribute('href')).toBe('#stats');
});
