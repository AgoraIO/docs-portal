import { expect, it } from 'vitest';
import { redactSearchQuery } from './measurement-privacy';

it.each([
  '+8613812345678',
  '138 1234 5678',
  '+1 (415) 555-1212',
  '021-12345678',
  'a@example.test',
  'token=private-value',
  'https://private.example/path',
])('redacts suspected sensitive query: %s', (query) => {
  expect(redactSearchQuery(query)).toBe('[redacted]');
});
it.each(['Token', 'manualSOS', '云端录制', 'joinChannel'])(
  'retains useful public technical terms: %s',
  (query) => {
    expect(redactSearchQuery(query)).toBe(query);
  },
);
