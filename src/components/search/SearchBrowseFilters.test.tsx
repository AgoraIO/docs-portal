import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchBrowseFilters } from './SearchBrowseFilters';

const platforms = [
  'general',
  'web',
  'android',
  'ios',
  'macos',
  'windows',
  'harmonyos',
  'flutter',
  'unity',
];

describe('SearchBrowseFilters', () => {
  it('offers and restores the published RTMP gateway product', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SearchBrowseFilters state={{}} platforms={[]} onChange={onChange} />,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: '全部产品' }), {
      key: 'ArrowDown',
    });
    fireEvent.click(
      await screen.findByRole('menuitemradio', { name: 'RTMP 网关' }),
    );
    expect(onChange).toHaveBeenCalledWith({
      product: 'rtmp-gateway',
      version: undefined,
    });
    rerender(
      <SearchBrowseFilters
        state={{ product: 'rtmp-gateway' }}
        platforms={[]}
        onChange={onChange}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'RTMP 网关' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '全部产品' })).toBeNull();
  });

  it('keeps an active product outside the catalog readable and selected', async () => {
    render(
      <SearchBrowseFilters
        state={{ product: 'new-product' }}
        productScopes={[
          {
            id: 'product:new-product',
            label: '新产品',
            scope: { field: 'product', value: 'new-product' },
          },
        ]}
        platforms={[]}
        onChange={vi.fn()}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: '新产品' }), {
      key: 'ArrowDown',
    });
    expect(
      await screen.findByRole('menuitemradio', { name: '新产品' }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: '全部产品' }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('retains a selected platform when collapsing without changing the active filters', () => {
    const onChange = vi.fn();
    render(
      <SearchBrowseFilters
        state={{ platform: 'flutter' }}
        platforms={platforms}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Flutter' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      screen.queryByRole('radio', { name: 'Unity' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '展开' }));
    expect(screen.getByRole('radio', { name: 'Unity' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '折叠' }));
    expect(screen.getByRole('radio', { name: 'Flutter' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('radio', { name: '全部平台' }));
    expect(onChange).toHaveBeenCalledWith({
      platform: undefined,
      version: undefined,
    });
  });

  it('selects a solution from the separate catalog group', async () => {
    const onChange = vi.fn();
    render(
      <SearchBrowseFilters
        state={{}}
        platforms={platforms}
        onChange={onChange}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: '全部产品' }), {
      key: 'ArrowDown',
    });
    expect(
      await screen.findByRole('group', { name: '产品' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '解决方案' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitemradio', { name: '智能门铃' }));
    expect(onChange).toHaveBeenCalledWith({
      product: 'smart-doorbell',
      version: undefined,
    });
  });
});

it('shows one option per platform and restores a selected alias', () => {
  const onChange = vi.fn();
  render(
    <SearchBrowseFilters
      state={{ platform: 'unreal-cpp' }}
      platforms={[
        'unreal',
        'unreal-cpp',
        'blueprint',
        'unreal-blueprint',
        'mini-program',
        'mini-program-beta',
        'web',
        'javascript',
      ]}
      onChange={onChange}
    />,
  );
  const expand = screen.queryByRole('button', { name: '展开' });
  if (expand) fireEvent.click(expand);
  expect(screen.getAllByRole('radio', { name: 'Unreal (C++)' })).toHaveLength(
    1,
  );
  expect(screen.getByRole('radio', { name: 'Unreal (C++)' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(screen.getAllByRole('radio')).toHaveLength(5);
  fireEvent.click(screen.getByRole('radio', { name: 'Unreal (Blueprint)' }));
  expect(onChange).toHaveBeenCalledWith({
    platform: 'blueprint',
    version: undefined,
  });
});

it('groups server and client language options and restores a server selection', () => {
  render(
    <SearchBrowseFilters
      state={{ platform: 'server-cpp' }}
      platforms={['cpp', 'server-cpp', 'java', 'server-java', 'restful']}
      onChange={vi.fn()}
    />,
  );
  expect(screen.getAllByRole('radio')).toHaveLength(4);
  expect(screen.getByRole('radio', { name: '服务端 C++' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(
    screen.getByRole('radio', { name: '服务端 Java' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: '服务端' })).toBeInTheDocument();
  expect(screen.queryByRole('radio', { name: 'C++' })).toBeNull();
  expect(screen.queryByRole('radio', { name: 'Java' })).toBeNull();
});
