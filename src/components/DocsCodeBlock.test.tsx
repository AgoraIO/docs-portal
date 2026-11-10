import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { createInstance } from 'i18next';
import { type ComponentType, type ReactNode, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import enCommon from '@/lib/i18n/resources/en/common';
import zhCommon from '@/lib/i18n/resources/zh-CN/common';
import { DocsCodeBlock } from './DocsCodeBlock';
import { getMDXComponents } from './mdx';

async function renderBlocks(children: ReactNode, locale = 'en') {
  const instance = createInstance();
  await instance.init({
    lng: locale,
    resources: { en: { common: enCommon }, 'zh-CN': { common: zhCommon } },
    defaultNS: 'common',
  });
  return render(<I18nextProvider i18n={instance}>{children}</I18nextProvider>);
}

function LanguageSelectorExample() {
  const [language, setLanguage] = useState('curl');
  return (
    <DocsCodeBlock
      Actions={({ children }) => (
        <div>
          <select
            aria-label="Language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="curl">cURL</option>
            <option value="js">JavaScript</option>
          </select>
          {children}
        </div>
      )}
    >
      <code>{language}</code>
    </DocsCodeBlock>
  );
}

describe('DocsCodeBlock', () => {
  it.each([
    ['en', 'Wrap code', 'Unwrap code'],
    ['zh-CN', '自动换行', '取消自动换行'],
  ])(
    'toggles wrapping with accessible %s labels without altering code',
    async (locale, wrap, unwrap) => {
      const source = 'const url = "https://example.com/a/very/long/path";';
      await renderBlocks(
        <DocsCodeBlock title="TypeScript">
          <code>
            <span className="line">
              <span style={{ color: 'red' }}>{source}</span>
            </span>
          </code>
        </DocsCodeBlock>,
        locale,
      );
      const code = screen.getByText(source);
      const figure = code.closest('figure');
      expect(screen.getByRole('button', { name: wrap })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      fireEvent.click(screen.getByRole('button', { name: wrap }));
      expect(screen.getByRole('button', { name: unwrap })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(code.closest('pre')).toHaveClass('whitespace-pre-wrap');
      expect(figure).toHaveAttribute('data-line-numbers', 'true');
      expect(code).toHaveStyle({ color: 'red' });
      expect(code.textContent).toBe(source);
      fireEvent.click(screen.getByRole('button', { name: unwrap }));
      expect(code.closest('pre')).not.toHaveClass('whitespace-pre-wrap');
    },
  );

  it('keeps wrapping local to each block and copies original whitespace', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const clipboard = vi
      .spyOn(navigator, 'clipboard', 'get')
      .mockReturnValue({ writeText } as unknown as Clipboard);
    try {
      const source = '  first line\n    second line';
      await renderBlocks(
        <>
          <DocsCodeBlock title="First">
            <code>{source}</code>
          </DocsCodeBlock>
          <DocsCodeBlock title="Second">
            <code>Other code</code>
          </DocsCodeBlock>
        </>,
      );
      const first = within(
        screen.getByText('First').closest('figure') as HTMLElement,
      );
      const second = within(
        screen.getByText('Second').closest('figure') as HTMLElement,
      );
      fireEvent.click(first.getByRole('button', { name: 'Wrap code' }));
      expect(second.getByRole('button', { name: 'Wrap code' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      fireEvent.click(first.getByRole('button', { name: 'Copy Text' }));
      await waitFor(() => expect(writeText).toHaveBeenCalledWith(source));
    } finally {
      clipboard.mockRestore();
    }
  });

  it('composes caller actions without replacing the wrapping control', async () => {
    await renderBlocks(
      <DocsCodeBlock
        copyButton={<button type="button">Custom copy</button>}
        Actions={({ className, children }) => (
          <div className={className}>{children}</div>
        )}
      >
        <code>Custom actions code</code>
      </DocsCodeBlock>,
    );
    expect(
      screen.getByRole('button', { name: 'Custom copy' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Wrap code' }));
    expect(
      screen.getByRole('button', { name: 'Custom copy' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unwrap code' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('retains a custom language selector and wrapping state when its action callback changes', async () => {
    await renderBlocks(<LanguageSelectorExample />);
    fireEvent.click(screen.getByRole('button', { name: 'Wrap code' }));
    const selector = screen.getByRole('combobox', { name: 'Language' });
    selector.focus();
    fireEvent.change(selector, { target: { value: 'js' } });
    expect(screen.getByRole('combobox', { name: 'Language' })).toBe(selector);
    expect(selector).toHaveFocus();
    expect(selector).toHaveValue('js');
    expect(screen.getByRole('button', { name: 'Unwrap code' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('allows wrapping when copying is disabled', async () => {
    await renderBlocks(
      <DocsCodeBlock allowCopy={false}>
        <code>Read only</code>
      </DocsCodeBlock>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Wrap code' }));
    expect(screen.getByRole('button', { name: 'Unwrap code' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('uses an explicit code locale when a generated example has a different provider language', async () => {
    await renderBlocks(
      <DocsCodeBlock locale="zh-CN">
        <code>Generated example</code>
      </DocsCodeBlock>,
      'en',
    );
    expect(
      screen.getByRole('button', { name: '自动换行' }),
    ).toBeInTheDocument();
  });

  it('localizes MDX fences and command blocks from document context with stable component identities', async () => {
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
    const Pre = components.pre as ComponentType<{ children: ReactNode }>;
    const Command = components.CommandBlock as ComponentType<{ code: string }>;
    const Signature = components.ApiSignature as ComponentType<{
      children: ReactNode;
    }>;
    await renderBlocks(
      <>
        <Pre>
          <code>Localized fence</code>
        </Pre>
        <Command code="bun install" />
        <Signature>function run(): void</Signature>
      </>,
      'en',
    );
    expect(screen.getAllByRole('button', { name: '自动换行' })).toHaveLength(3);
    expect(getMDXComponents(undefined, { locale: 'zh-CN' }).pre).toBe(Pre);
    expect(getMDXComponents(undefined, { locale: 'zh-CN' }).CommandBlock).toBe(
      Command,
    );
    expect(getMDXComponents(undefined, { locale: 'zh-CN' }).ApiSignature).toBe(
      Signature,
    );
    fireEvent.click(screen.getAllByRole('button', { name: '自动换行' })[0]);
    expect(
      screen.getByRole('button', { name: '取消自动换行' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
