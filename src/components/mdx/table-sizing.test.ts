import { describe, expect, it } from 'vitest';
import { planTableSizing, sizeCellContent } from './table-sizing';

describe('content-based table sizing', () => {
  it('lets any column grow for prose, regardless of its header', () => {
    const result = planTableSizing(3, [
      { column: 0, span: 1, header: true, content: { text: 'Name' } },
      { column: 1, span: 1, header: true, content: { text: 'Description' } },
      { column: 2, span: 1, header: true, content: { text: 'Required' } },
      {
        column: 0,
        span: 1,
        header: false,
        content: {
          text: 'An ordinary sentence that needs room for continuous reading.',
        },
      },
      { column: 1, span: 1, header: false, content: { text: 'Yes' } },
      {
        column: 2,
        span: 1,
        header: false,
        content: {
          text: 'Optional when the configured service does not publish this extension.',
        },
      },
    ]);
    expect(result.columns.map((column) => column.kind)).toEqual([
      'prose',
      'compact',
      'prose',
    ]);
    expect(result.flexible).toBe(2);
  });

  it('keeps short numeric lists compact without summing every item into the width', () => {
    expect(
      sizeCellContent({
        text: 'SD: 200 HD: 50',
        blocks: ['SD: 200', 'HD: 50'],
        list: true,
      }).kind,
    ).toBe('compact');
    expect(
      sizeCellContent({
        text: 'A longer list',
        blocks: [
          'A full description with multiple words and a readable explanation.',
        ],
        list: true,
      }).kind,
    ).toBe('prose');
    expect(
      sizeCellContent({
        text: 'A full introduction outside a paragraph must still receive reading room. SD: 200',
        blocks: ['SD: 200'],
        list: true,
      }).kind,
    ).toBe('prose');
  });

  it('accounts for CJK width and preserves code and nested table reading space', () => {
    expect(sizeCellContent({ text: '建议填写' }).kind).toBe('compact');
    expect(
      sizeCellContent({
        text: '配置项内容较多时应自然分配阅读空间，不能仅凭列名压窄。',
      }).kind,
    ).toBe('prose');
    expect(sizeCellContent({ text: 'NSMicrophoneUsageDescription' }).kind).toBe(
      'code',
    );
    expect(sizeCellContent({ text: 'run();', codeBlock: true }).kind).toBe(
      'code',
    );
    expect(sizeCellContent({ text: '', nestedTable: true }).kind).toBe('prose');
  });

  it('does not spread a merged note into each individual numeric column', () => {
    const result = planTableSizing(2, [
      { column: 0, span: 1, header: false, content: { text: '12,000' } },
      { column: 1, span: 1, header: false, content: { text: '18,000' } },
      {
        column: 0,
        span: 2,
        header: false,
        content: {
          text: 'This shared note belongs to the combined columns and preserves its native colspan.',
        },
      },
    ]);
    expect(result.columns.every((column) => column.kind === 'compact')).toBe(
      true,
    );
  });
});
