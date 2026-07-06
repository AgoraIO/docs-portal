import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  calculateRTCUserStandardMinutes,
  RTCMinutesCalculator,
} from './RTCMinutesCalculator';

describe('RTCMinutesCalculator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('matches the stream subscription calculator logic for aggregate resolution and broadcast audience rates', () => {
    const result = calculateRTCUserStandardMinutes({
      durationMinutes: 6,
      streamingMode: 'broadcast',
      users: [
        {
          id: 'user-a',
          streams: [{ id: 'stream-a', resolution: '1280 x 720' }],
          subscriptions: ['stream-b'],
          audienceCount: 1,
        },
        {
          id: 'user-b',
          streams: [{ id: 'stream-b', resolution: '1920 x 1080' }],
          subscriptions: ['stream-a'],
          audienceCount: 1,
        },
        {
          id: 'user-c',
          streams: [],
          subscriptions: ['stream-a', 'stream-b'],
          audienceCount: 2,
        },
      ],
    });

    expect(result.users).toEqual([
      expect.objectContaining({
        aggregateResolution: 2_073_600,
        classification: 'Video Full HD',
        ratio: 9,
        role: 'Host',
        standardMinutes: '54.00',
      }),
      expect.objectContaining({
        aggregateResolution: 921_600,
        classification: 'Video HD',
        ratio: 4,
        role: 'Host',
        standardMinutes: '24.00',
      }),
      expect.objectContaining({
        aggregateResolution: 2_995_200,
        classification: 'Video 2K',
        ratio: 8,
        role: 'Audience',
        standardMinutes: '96.00',
      }),
    ]);
    expect(result.totalStandardMinutes).toBe('174.00');
  });

  it('updates totals when users publish streams, subscribe, and switch streaming mode', () => {
    render(<RTCMinutesCalculator />);

    fireEvent.click(screen.getByRole('button', { name: 'Add a user' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add a user' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Add Stream for User A' }),
    );

    fireEvent.change(screen.getByLabelText('Resolution for User A stream 1'), {
      target: { value: '1920 x 1080' },
    });

    expect(screen.getByText(/Total Standard Minutes:/)).toHaveTextContent(
      'Total Standard Minutes: 600.00',
    );
    expect(
      within(screen.getByLabelText('Summary for User B')).getByText(
        'Video Full HD',
      ),
    ).toBeVisible();

    fireEvent.click(
      screen.getByLabelText('Broadcast Streaming (audience only)'),
    );

    expect(screen.getByText(/Total Standard Minutes:/)).toHaveTextContent(
      'Total Standard Minutes: 334.20',
    );
  });

  it('matches the audio calculator variant with audio-only streams and a separate saved configuration', () => {
    render(<RTCMinutesCalculator type="audio" />);

    fireEvent.click(screen.getByRole('button', { name: 'Add a user' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Add Stream for User A' }),
    );

    const resolutionSelect = screen.getByLabelText(
      'Resolution for User A stream 1',
    );

    expect(
      within(resolutionSelect)
        .getAllByRole('option')
        .map((option) => option.textContent?.trim()),
    ).toEqual(['Audio only']);
    expect(screen.getByLabelText('Summary for User A')).toHaveTextContent(
      'Audio',
    );
    expect(screen.getByText(/Total Standard Minutes:/)).toHaveTextContent(
      'Total Standard Minutes: 60.00',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(localStorage.getItem('pricingCalculatorConfigAudio')).not.toBeNull();
    expect(localStorage.getItem('pricingCalculatorConfig')).toBeNull();
  });
});
