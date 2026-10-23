import { expect, it } from 'vitest';
import { prepareCodeSource } from './source';

it('removes presentation directives while preserving command continuation and payloads', () => {
  const source =
    '// highlight-start\ncurl /endpoint \\\n// highlight-end\n--data \'{"count": 2}\'';
  const result = prepareCodeSource(source);
  expect(result.source).toBe('curl /endpoint \\\n--data \'{"count": 2}\'');
  expect([...result.highlighted]).toEqual([1]);
});
it('retains literal marker strings and arithmetic operators, while excluding diff annotations', () => {
  const result = prepareCodeSource(
    'const s = "// [!code highlight]";\nconst n = 1 + 2; // [!code ++]\nconst old = 0; // [!code --]',
  );
  expect(result.source).toBe(
    'const s = "// [!code highlight]";\nconst n = 1 + 2;\nconst old = 0;',
  );
  expect([...result.added]).toEqual([2]);
  expect([...result.removed]).toEqual([3]);
});
