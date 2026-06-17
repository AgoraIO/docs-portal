import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const appCssPath = path.resolve(import.meta.dirname, 'app.css');
const misansDirPath = path.resolve(import.meta.dirname, '../../public/fonts/misans');

describe('app.css font configuration', () => {
  it('does not reference bundled MiSans font files', () => {
    const stylesheet = readFileSync(appCssPath, 'utf8');

    expect(stylesheet).not.toContain('/fonts/misans/');
    expect(stylesheet).not.toContain('"MiSans"');
  });

  it('does not keep unused MiSans assets in public', () => {
    expect(existsSync(misansDirPath)).toBe(false);
  });
});
