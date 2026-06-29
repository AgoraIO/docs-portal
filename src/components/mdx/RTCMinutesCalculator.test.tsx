import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  calculateRTCStandardMinutes,
  RTCMinutesCalculator,
} from './RTCMinutesCalculator';

describe('RTCMinutesCalculator', () => {
  it('calculates Standard minutes from the pricing conversion ratios', () => {
    const result = calculateRTCStandardMinutes({
      audienceCount: 1,
      durationMinutes: 6,
      hostCount: 1,
      mode: 'broadcast',
      tier: 'audio',
    });

    expect(result.hostLine.exactStandardMinutes).toBe(6);
    expect(result.audienceLine.exactStandardMinutes).toBeCloseTo(3.42);
    expect(result.exactStandardMinutes).toBeCloseTo(9.42);
    expect(result.totalStandardMinutes).toBe(10);
  });

  it('updates the total and breakdown when users change inputs', () => {
    render(<RTCMinutesCalculator />);

    const estimate = screen.getByRole('region', {
      name: 'Standard minutes estimate',
    });

    expect(
      within(estimate).getByText('2,640', { selector: 'p' }),
    ).toBeVisible();
    expect(
      within(estimate).getByText(/Audience ratio: 4 for interactive live/i),
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText('Mode / streaming type'), {
      target: { value: 'broadcast' },
    });

    expect(
      within(estimate).getByText('1,440', { selector: 'p' }),
    ).toBeVisible();
    expect(
      within(estimate).getByText(/Audience ratio: 2 for broadcast streaming/i),
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText('Resolution / tier'), {
      target: { value: 'full-hd' },
    });

    expect(
      within(estimate).getByText('3,282', { selector: 'p' }),
    ).toBeVisible();
    expect(within(estimate).getByText(/Tier: Full HD Video/i)).toBeVisible();
  });
});
