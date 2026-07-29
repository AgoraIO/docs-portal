import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  parseMcpInitializeResponse,
  validateDiscoveryDocuments,
} from './validate-agent-discovery';

const CANONICAL_SKILL_URL =
  'https://raw.githubusercontent.com/AgoraIO/skills/main/skills/agora/SKILL.md';
const CANONICAL_SKILL_DIGEST =
  'sha256:00c9db8670c63049466c03c00268e6e8b50f5b5eb0aaf72be31d54add864be3a';

describe('agent discovery artifacts', () => {
  const mcpDiscovery = readJson('public/.well-known/mcp.json');
  const mcpServerCard = readJson('public/.well-known/mcp/server-card.json');
  const skillsIndex = readJson('public/.well-known/agent-skills/index.json');

  it('advertises the public Agora MCP server through current discovery contracts', () => {
    expect(mcpDiscovery).toEqual({
      servers: [
        {
          authentication: 'none',
          name: 'public',
          transport: 'http',
          url: 'https://mcp.agora.io',
        },
      ],
      transport: 'http',
      url: 'https://mcp.agora.io',
      version: '1.0.0',
    });
    expect(mcpServerCard).toMatchObject({
      authentication: 'none',
      capabilities: { tools: true },
      name: 'agora-docs-search',
      transport: 'http',
      url: 'https://mcp.agora.io',
      version: '1.0.0',
    });
  });

  it('advertises the canonical Agora Skill with content integrity metadata', () => {
    expect(skillsIndex).toEqual({
      $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
      skills: [
        {
          description:
            'Build Agora voice AI, real-time media, messaging, recording, and CLI integrations using official workflows.',
          digest: CANONICAL_SKILL_DIGEST,
          name: 'agora',
          type: 'skill-md',
          url: CANONICAL_SKILL_URL,
        },
      ],
    });
  });

  it('publishes compatibility routes without proxying MCP traffic or copying the Skill', () => {
    const vercelConfig = readJson('vercel.json');

    expect(vercelConfig.routes).toContainEqual({
      dest: '/.well-known/mcp.json',
      src: '^/\\.well-known/mcp$',
    });
    expect(vercelConfig.redirects).toContainEqual({
      destination: CANONICAL_SKILL_URL,
      source: '/skill.md',
      statusCode: 307,
    });
  });

  it('rejects Skill drift and accepts the real MCP initialize response shape', () => {
    const skillBody = '# canonical Agora Skill\n';
    const digest = `sha256:${createHash('sha256').update(skillBody).digest('hex')}`;

    expect(() =>
      validateDiscoveryDocuments({
        mcpDiscovery,
        mcpServerCard,
        skillBody,
        skillsIndex: {
          ...skillsIndex,
          skills: [{ ...skillsIndex.skills[0], digest }],
        },
      }),
    ).not.toThrow();
    expect(() =>
      validateDiscoveryDocuments({
        mcpDiscovery,
        mcpServerCard,
        skillBody: `${skillBody}drift`,
        skillsIndex: {
          ...skillsIndex,
          skills: [{ ...skillsIndex.skills[0], digest }],
        },
      }),
    ).toThrow('canonical Skill digest');

    expect(
      parseMcpInitializeResponse(
        'event: message\ndata: {"result":{"protocolVersion":"2025-06-18","serverInfo":{"name":"algolia-mcp","version":"1.0.0"}},"jsonrpc":"2.0","id":1}\n',
      ),
    ).toMatchObject({
      protocolVersion: '2025-06-18',
      serverInfo: { name: 'algolia-mcp', version: '1.0.0' },
    });
  });
});

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
