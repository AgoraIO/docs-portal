import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsList, TabsTrigger } from './tabs';

describe('Tabs primitive', () => {
  it('aligns line variant active underline to the tabs strip baseline', () => {
    render(
      <Tabs value="intro">
        <TabsList variant="line">
          <TabsTrigger value="intro">Introduction</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const trigger = screen.getByRole('tab', { name: 'Introduction' });

    expect(trigger.className).not.toContain('after:bottom-[-5px]');
    expect(trigger.className).toContain(
      'group-data-[orientation=horizontal]/tabs:after:bottom-[-1px]',
    );
    expect(trigger.className).toContain(
      'group-data-[orientation=horizontal]/tabs:after:h-0.5',
    );
  });

  it('keeps triggers content-sized by default', () => {
    render(
      <Tabs value="intro">
        <TabsList variant="line">
          <TabsTrigger value="intro">Introduction</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const trigger = screen.getByRole('tab', { name: 'Introduction' });

    expect(trigger.className).toContain('shrink-0');
    expect(trigger.className).not.toContain('flex-1');
  });
});
