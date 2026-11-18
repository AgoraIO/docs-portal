import { describe, expect, it } from 'vitest';
import { assertValidSearchSection, type SearchSection } from './kb-record';

const apiSection: SearchSection = {
  id: 'zh-CN:conversationalaiapi:removehandler',
  url: '/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi#removehandler',
  pageTitle: 'ConversationalAIAPI',
  sectionTitle: 'removeHandler',
  content: '移除事件处理器。',
  headingPath: ['ConversationalAIAPI', 'removeHandler'],
  locale: 'zh-CN',
  product: 'conversational-ai',
  platform: ['android'],
  docType: 'docs',
  audience: ['developer', 'customer-support'],
  status: 'published',
  hidden: false,
};

describe('SearchSection contract', () => {
  it('accepts a public anchored API section', () => {
    expect(() => assertValidSearchSection(apiSection)).not.toThrow();
  });

  it('rejects a hidden section from a public KB record', () => {
    expect(() =>
      assertValidSearchSection({ ...apiSection, hidden: true }),
    ).toThrow('hidden records cannot enter the public KB');
  });

  it('rejects a section without a non-empty anchored URL', () => {
    expect(() =>
      assertValidSearchSection({ ...apiSection, url: '/zh-CN/overview' }),
    ).toThrow('section URL must include an anchor');
  });

  it('rejects an unsupported status or audience', () => {
    expect(() =>
      assertValidSearchSection({
        ...apiSection,
        status: 'draft' as SearchSection['status'],
      }),
    ).toThrow('status must be published, deprecated, or internal');
  });
});
