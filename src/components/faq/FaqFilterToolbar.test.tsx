import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FaqFilterToolbar } from './FaqFilterToolbar';
import { FAQ_ALL_PLATFORMS, FAQ_ALL_PRODUCTS } from './faq-data';

describe('FaqFilterToolbar', () => {
  it('reports product selection', async () => {
    const onProductChange = vi.fn();
    render(
      <FaqFilterToolbar
        hasActiveFilters={false}
        onClear={vi.fn()}
        onPlatformChange={vi.fn()}
        onProductChange={onProductChange}
        platform={FAQ_ALL_PLATFORMS}
        product={FAQ_ALL_PRODUCTS}
      />,
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: /Product/ }), {
      button: 0,
    });
    fireEvent.click(
      await screen.findByRole('menuitem', { name: /Cloud Recording/ }),
    );

    expect(onProductChange).toHaveBeenCalledWith('Cloud Recording');
  });

  it('shows Clear only when filters are active', () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <FaqFilterToolbar
        hasActiveFilters={false}
        onClear={onClear}
        onPlatformChange={vi.fn()}
        onProductChange={vi.fn()}
        platform={FAQ_ALL_PLATFORMS}
        product={FAQ_ALL_PRODUCTS}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();

    rerender(
      <FaqFilterToolbar
        hasActiveFilters={true}
        onClear={onClear}
        onPlatformChange={vi.fn()}
        onProductChange={vi.fn()}
        platform={FAQ_ALL_PLATFORMS}
        product={FAQ_ALL_PRODUCTS}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalled();
  });
});
