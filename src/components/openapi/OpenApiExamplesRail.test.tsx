import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OpenApiExamplesRail } from './OpenApiExamplesRail';

describe('OpenApiExamplesRail', () => {
  it('renders the examples rail structure without runtime layout state', () => {
    const { container } = render(
      <OpenApiExamplesRail>
        <div data-testid="request-examples">Request examples</div>
      </OpenApiExamplesRail>,
    );

    const rail = screen.getByTestId('openapi-examples-rail');
    const anchor = rail.parentElement;
    const content = rail.firstElementChild;
    const child = screen.getByTestId('request-examples');

    expect(container.firstElementChild).toBe(anchor);
    expect(anchor).toHaveClass('openapi-examples-rail-anchor');
    expect(rail).toHaveClass('openapi-examples-rail', 'min-w-0', 'max-w-full');
    expect(content).toHaveClass(
      'openapi-examples-rail-content',
      'min-w-0',
      'max-w-full',
    );
    expect(child.parentElement).toBe(content);
    expect(content).toHaveTextContent('Request examples');
    expect(rail).not.toHaveAttribute('data-constrained');
    expect(rail).not.toHaveAttribute('data-stuck');
    expect(rail).not.toHaveAttribute('style');
    expect(
      document.querySelector('[data-openapi-examples-rail-sentinel]'),
    ).not.toBeInTheDocument();
  });
});
