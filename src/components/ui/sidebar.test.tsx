import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from './sidebar';

describe('sidebar primitive', () => {
  it('keeps the wrapper/content/inset baseline while allowing consumer overrides', () => {
    render(
      <SidebarProvider className="block min-h-screen">
        <Sidebar collapsible="none">
          <SidebarContent>Navigation</SidebarContent>
        </Sidebar>
        <SidebarInset>Main</SidebarInset>
      </SidebarProvider>,
    );

    const wrapper = screen
      .getByText('Navigation')
      .closest('[data-slot="sidebar-wrapper"]');
    const outerWrapper = wrapper?.parentElement;
    const content = screen
      .getByText('Navigation')
      .closest('[data-slot="sidebar-content"]');
    const inset = screen
      .getByText('Main')
      .closest('[data-slot="sidebar-inset"]');

    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('w-full');
    expect(wrapper).toHaveClass('min-h-0');
    expect(wrapper).toHaveClass('md:min-h-svh');

    expect(outerWrapper).toBeInTheDocument();
    expect(outerWrapper).toHaveClass('block');
    expect(outerWrapper).toHaveClass('min-h-screen');

    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('min-h-0');
    expect(content).toHaveClass('overflow-x-hidden');
    expect(content).toHaveClass('overflow-y-auto');

    expect(inset).toBeInTheDocument();
    expect(inset).toHaveClass('min-h-0');
    expect(inset).toHaveClass('flex-1');
  });
});
