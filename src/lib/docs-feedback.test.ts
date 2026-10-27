import { expect, it } from 'vitest';
import { buildFeedbackIssueUrl, prepareDocsFeedback } from './docs-feedback';

const base = {
  id: 'feedback-1',
  pageUrl: 'https://docs.example/realtime-media/rtc?secret=hidden#section',
  pageTitle: 'RTC 概览',
  helpfulness: 'no' as const,
  submittedAt: '2026-10-27T06:00:00.000Z',
};

it('uses other for comment-only feedback and builds the complete GitHub handoff', () => {
  const submission = prepareDocsFeedback({
    ...base,
    reasons: [],
    details: '  第二步需要更新。  ',
  });
  expect(submission).toMatchObject({
    reasons: ['other'],
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
    '其他',
    '第二步需要更新。',
  ])
    expect(body).toContain(text);
  expect(body).not.toContain('secret=hidden');
  expect(Object.isFrozen(submission)).toBe(true);
  expect(Object.isFrozen(submission?.reasons)).toBe(true);
});

it('rejects an empty or invalid response and keeps the positive branch free of hidden details', () => {
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
    details: '负向草稿',
  });
  expect(submission?.reasons).toEqual(['useful_examples']);
  expect(submission?.details).toBe('');
});
