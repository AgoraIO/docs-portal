import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(
    process.cwd(),
    'content/docs/zh-CN/ai/get-started/quick-start-agent.mdx',
  ),
  'utf8',
);

describe('Conversational AI upstream PR #2107 parity', () => {
  it('installs the latest Go Agent SDK while preserving godotenv', () => {
    expect(
      source.includes('go get github.com/AgoraIO/agora-agents-go/v2@latest'),
    ).toBe(true);
    expect(source).not.toContain(
      'go get github.com/AgoraIO/agora-agents-go/v2@v2.4.0',
    );
    expect(source).toContain('go get github.com/joho/godotenv@v1.5.1');
  });

  it('leaves the Python Agent SDK unpinned while preserving python-dotenv', () => {
    expect(/^agora-agents$/m.test(source)).toBe(true);
    expect(source).not.toContain('agora-agents==2.4.1');
    expect(source).toContain('python-dotenv==1.0.1');
  });

  it('leaves the TypeScript Agent SDK unpinned while preserving other dependencies', () => {
    expect(source.includes('npm install agora-agents dotenv@16.4.7')).toBe(
      true,
    );
    expect(source).not.toContain('npm install agora-agents@2.4.0');
    expect(source).toContain(
      'npm install -D typescript@~5.7.2 tsx @types/node',
    );
  });
});
