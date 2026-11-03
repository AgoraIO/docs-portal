import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DOCS_HASH_TARGET_EVENT } from '@/lib/docs-hash';
import { OpenApiOperationPanels } from './OpenApiOperationPanels';

function Page({ locale = 'zh-CN' }: { locale?: string }) {
  return (
    <OpenApiOperationPanels
      documentation={<h2 id="parameters-query">查询参数</h2>}
      examples={
        <>
          <h2 id="response-example">响应示例</h2>
          <input aria-label="Example value" defaultValue="initial" />
        </>
      }
      locale={locale}
    />
  );
}

describe('OpenApiOperationPanels', () => {
  it('switches mobile views without remounting example controls', () => {
    render(<Page />);
    const documentation = screen.getByRole('tab', { name: '接口文档' });
    const examples = screen.getByRole('tab', { name: '请求与响应示例' });
    expect(documentation).toHaveAttribute('aria-selected', 'true');
    fireEvent.mouseDown(examples, { button: 0, ctrlKey: false });
    expect(examples).toHaveAttribute('aria-selected', 'true');
    const input = screen.getByRole('textbox', { name: 'Example value' });
    fireEvent.change(input, { target: { value: 'kept' } });
    fireEvent.mouseDown(documentation, { button: 0, ctrlKey: false });
    fireEvent.mouseDown(examples, { button: 0, ctrlKey: false });
    expect(screen.getByRole('textbox', { name: 'Example value' })).toBe(input);
    expect(input).toHaveValue('kept');
  });

  it('reveals the panel containing a heading requested by the docs navigation', () => {
    render(<Page />);
    act(() =>
      window.dispatchEvent(
        new CustomEvent(DOCS_HASH_TARGET_EVENT, {
          detail: '#response-example',
        }),
      ),
    );
    expect(screen.getByRole('tab', { name: '请求与响应示例' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    act(() =>
      window.dispatchEvent(
        new CustomEvent(DOCS_HASH_TARGET_EVENT, {
          detail: '#parameters-query',
        }),
      ),
    );
    expect(screen.getByRole('tab', { name: '接口文档' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('localizes the view switcher for English pages', () => {
    render(<Page locale="en" />);
    expect(
      screen.getByRole('tablist', { name: 'API documentation view' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Request & response examples' }),
    ).toBeInTheDocument();
  });
});
