import { expect, it } from 'vitest';
import { buildFeedbackIssueUrl, prepareDocsFeedback } from './docs-feedback';

const base = {
  id: 'feedback-1',
  pageUrl: 'https://docs.example/realtime-media/rtc?secret=hidden#section',
  pageTitle: 'RTC 概览',
  helpfulness: 'no' as const,
  submittedAt: '2026-10-27T06:00:00.000Z',
};

it('keeps reasons optional for comment-only feedback and builds the GitHub handoff', () => {
  const submission = prepareDocsFeedback({
    ...base,
    reasons: [],
    details: '  第二步需要更新。  ',
  });
  expect(submission).toMatchObject({
    reasons: [],
    details: '第二步需要更新。',
    pageUrl: 'https://docs.example/realtime-media/rtc',
  });
  if (!submission) throw new Error('Expected a valid feedback submission');
  const body = new URL(buildFeedbackIssueUrl(submission)).searchParams.get(
    'body',
  );
  for (const text of [
    'RTC 概览',
    '是否有帮助：没有',
    '未选择',
    '第二步需要更新。',
  ])
    expect(body).toContain(text);
  expect(body).not.toContain('secret=hidden');
  expect(Object.isFrozen(submission)).toBe(true);
  expect(Object.isFrozen(submission?.reasons)).toBe(true);
});

it('rejects an empty or invalid response and preserves positive comments', () => {
  expect(
    prepareDocsFeedback({ ...base, reasons: [], details: '   ' }),
  ).toBeNull();
  expect(
    prepareDocsFeedback({ ...base, reasons: ['useful_examples'], details: '' }),
  ).toBeNull();
  const submission = prepareDocsFeedback({
    ...base,
    helpfulness: 'yes',
    reasons: ['useful_examples', 'useful_examples'],
    details: '  正向说明  ',
  });
  expect(submission?.reasons).toEqual(['useful_examples']);
  expect(submission?.details).toBe('正向说明');
});

it.each(['yes', 'no'] as const)(
  'builds an English %s GitHub handoff without query or hash',
  (helpfulness) => {
    const submission = prepareDocsFeedback({
      ...base,
      locale: 'en',
      pageTitle: 'Video Calling overview',
      helpfulness,
      reasons: [
        helpfulness === 'yes' ? 'useful_examples' : 'incorrect_or_outdated',
      ],
      details: 'Please add an example.',
    });
    if (!submission) throw new Error('Expected valid English feedback');
    const url = new URL(buildFeedbackIssueUrl(submission));
    expect(url.searchParams.get('title')).toBe(
      'Docs feedback: Video Calling overview',
    );
    const body = url.searchParams.get('body') ?? '';
    expect(body).toContain(
      helpfulness === 'yes'
        ? 'Useful examples'
        : 'Incorrect or outdated content',
    );
    expect(body).toContain(`Helpful: ${helpfulness === 'yes' ? 'Yes' : 'No'}`);
    expect(body).not.toMatch(/[\u4e00-\u9fff]|secret=hidden|#section/);
  },
);
