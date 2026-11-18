import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode, Ref } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getMDXComponents } from '../mdx';

const components = getMDXComponents(undefined, { locale: 'zh-CN' });
const Root = components.Accordions as ComponentType<{
  children: ReactNode;
  ref: Ref<HTMLDivElement>;
  value: string | string[];
  type: 'single' | 'multiple';
  collapsible?: boolean;
  onValueChange?: (value: string | string[]) => void;
}>;
const Item = components.Accordion as ComponentType<{
  children: ReactNode;
  title: string;
  value: string;
}>;

describe('accordion DOM registration', () => {
  it('keeps standalone examples collapsible', () => {
    render(
      <Item title="Example" value="example">
        Details
      </Item>,
    );
    const trigger = screen.getByRole('button', { name: 'Example' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('allows the caller to disable collapsing a single open item', () => {
    const onValueChange = vi.fn();
    const ref = vi.fn();
    const example = (collapsible: boolean) => (
      <Root
        ref={ref}
        type="single"
        value="example"
        collapsible={collapsible}
        onValueChange={onValueChange}
      >
        <Item title="Example" value="example">
          Details
        </Item>
      </Root>
    );
    const { rerender } = render(example(false));
    fireEvent.click(screen.getByRole('button', { name: 'Example' }));
    expect(onValueChange).not.toHaveBeenCalled();
    rerender(example(true));
    fireEvent.click(screen.getByRole('button', { name: 'Example' }));
    expect(onValueChange).toHaveBeenCalledWith('');
  });

  it.each(['single', 'multiple'] as const)(
    'keeps the %s root registered while its controlled selection changes',
    (type) => {
      const ref = vi.fn();
      const example = (open: boolean) => (
        <Root
          ref={ref}
          type={type}
          value={
            type === 'single'
              ? open
                ? 'example'
                : ''
              : open
                ? ['example']
                : []
          }
        >
          <Item title="Example" value="example">
            Details
          </Item>
        </Root>
      );
      const { container, rerender, unmount } = render(example(false));
      const root = container.firstElementChild;
      expect(ref).toHaveBeenLastCalledWith(root);
      ref.mockClear();
      rerender(example(true));
      expect(container.firstElementChild).toBe(root);
      expect(ref).not.toHaveBeenCalled();
      unmount();
      expect(ref).toHaveBeenCalledTimes(1);
      expect(ref).toHaveBeenLastCalledWith(null);
    },
  );
});
