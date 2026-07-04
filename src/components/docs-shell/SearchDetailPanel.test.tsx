import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchDetailPanel } from './SearchDetailPanel';

const renderText = (value: string) => <span>{value}</span>;

describe('SearchDetailPanel', () => {
  it('renders a floating card with title + description when placement is beside (right)', () => {
    render(
      <SearchDetailPanel
        activeValue="a"
        description="Connect to a channel."
        open
        placement="right"
        renderText={renderText}
        title="Join a channel"
      />,
    );
    const el = screen.getByTestId('search-active-detail');
    expect(el).toHaveAttribute('data-mode', 'beside');
    expect(el).toHaveTextContent('Join a channel');
    expect(el).toHaveTextContent('Connect to a channel.');
  });

  it('renders the in-footer strip with the description when placement is strip', () => {
    render(
      <SearchDetailPanel
        activeValue="a"
        description="Connect to a channel."
        open
        placement="strip"
        renderText={renderText}
        title="Join a channel"
      />,
    );
    const el = screen.getByTestId('search-active-detail');
    expect(el).toHaveAttribute('data-mode', 'strip');
    expect(el).toHaveTextContent('Connect to a channel.');
  });

  it('renders a blank reserved strip (no crash) when there is no description in strip mode', () => {
    render(
      <SearchDetailPanel
        activeValue="a"
        description={undefined}
        open
        placement="strip"
        renderText={renderText}
      />,
    );
    const el = screen.getByTestId('search-active-detail');
    expect(el).toHaveAttribute('data-mode', 'strip');
    expect(el).toHaveTextContent('');
  });

  it('renders nothing beside when there is no description', () => {
    render(
      <SearchDetailPanel
        activeValue="a"
        description={undefined}
        open
        placement="right"
        renderText={renderText}
      />,
    );
    expect(screen.queryByTestId('search-active-detail')).toBeNull();
  });

  it('runs the title through renderText so highlight markup is not shown raw', () => {
    // Algolia puts <mark> tags in the title; renderText (HighlightedText in the
    // app) turns them into highlighted text rather than literal characters.
    const stripMarks = (value: string) => (
      <span>{value.replaceAll('<mark>', '').replaceAll('</mark>', '')}</span>
    );
    render(
      <SearchDetailPanel
        activeValue="a"
        description="Join a channel to send streams."
        open
        placement="right"
        renderText={stripMarks}
        title="Join a <mark>channel</mark>"
      />,
    );
    const el = screen.getByTestId('search-active-detail');
    expect(el).not.toHaveTextContent('<mark>');
    expect(el).toHaveTextContent('Join a channel');
  });
});
