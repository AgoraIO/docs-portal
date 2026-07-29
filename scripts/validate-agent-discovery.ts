import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MCP_PROTOCOL_VERSION = '2025-06-18';
const repoRoot = path.resolve(import.meta.dirname, '..');

type McpDiscovery = {
  servers?: Array<{ name: string; url: string }>;
  url: string;
};

type McpInitializeResult = {
  protocolVersion: string;
  serverInfo: { name: string; version: string };
};

type McpServerCard = {
  url: string;
};

type SkillsIndex = {
  skills?: Array<{ digest: string; url: string }>;
};

export function validateDiscoveryDocuments({
  mcpDiscovery,
  mcpServerCard,
  skillBody,
  skillsIndex,
}: {
  mcpDiscovery: McpDiscovery;
  mcpServerCard: McpServerCard;
  skillBody: string;
  skillsIndex: SkillsIndex;
}) {
  const [skill] = skillsIndex.skills ?? [];
  if (!skill) {
    throw new Error('Agent Skills discovery does not advertise a Skill.');
  }

  const actualDigest = `sha256:${createHash('sha256').update(skillBody).digest('hex')}`;
  if (skill.digest !== actualDigest) {
    throw new Error(
      `The canonical Skill digest changed: expected ${skill.digest}, received ${actualDigest}.`,
    );
  }

  if (!mcpDiscovery.url || mcpDiscovery.url !== mcpServerCard.url) {
    throw new Error('MCP discovery documents advertise different endpoints.');
  }

  const publicServer = mcpDiscovery.servers?.find(
    (server) => server.name === 'public',
  );
  if (publicServer?.url !== mcpDiscovery.url) {
    throw new Error('MCP discovery does not advertise its public endpoint.');
  }

  return {
    mcpUrl: mcpDiscovery.url,
    skillDigest: actualDigest,
    skillUrl: skill.url,
  };
}

export function parseMcpInitializeResponse(body: string): McpInitializeResult {
  const payload: {
    error?: unknown;
    result?: McpInitializeResult;
  } = body.trim().startsWith('{')
    ? JSON.parse(body)
    : JSON.parse(
        body
          .split('\n')
          .find((line) => line.startsWith('data: '))
          ?.slice('data: '.length) ?? '',
      );

  if (payload.error) {
    throw new Error(`MCP initialize failed: ${JSON.stringify(payload.error)}`);
  }
  if (!payload.result?.protocolVersion || !payload.result?.serverInfo?.name) {
    throw new Error('MCP initialize returned incomplete server metadata.');
  }

  return payload.result;
}

async function run() {
  const baseUrl = getArgument('--base-url')?.replace(/\/$/, '');
  const [mcpDiscovery, mcpServerCard, skillsIndex, compatibilityDiscovery] =
    baseUrl
      ? await Promise.all([
          fetchJson<McpDiscovery>(`${baseUrl}/.well-known/mcp.json`),
          fetchJson<McpServerCard>(
            `${baseUrl}/.well-known/mcp/server-card.json`,
          ),
          fetchJson<SkillsIndex>(
            `${baseUrl}/.well-known/agent-skills/index.json`,
          ),
          fetchJson<McpDiscovery>(`${baseUrl}/.well-known/mcp`),
        ])
      : await Promise.all([
          readJson<McpDiscovery>('public/.well-known/mcp.json'),
          readJson<McpServerCard>('public/.well-known/mcp/server-card.json'),
          readJson<SkillsIndex>('public/.well-known/agent-skills/index.json'),
          readJson<McpDiscovery>('public/.well-known/mcp.json'),
        ]);

  if (JSON.stringify(mcpDiscovery) !== JSON.stringify(compatibilityDiscovery)) {
    throw new Error('The MCP compatibility endpoint does not match mcp.json.');
  }

  const [skill] = skillsIndex.skills ?? [];
  if (!skill) {
    throw new Error('Agent Skills discovery does not advertise a Skill.');
  }
  const skillResponse = await fetch(
    baseUrl ? `${baseUrl}/skill.md` : skill.url,
  );
  if (!skillResponse.ok) {
    throw new Error(`Skill request failed with HTTP ${skillResponse.status}.`);
  }

  const discovery = validateDiscoveryDocuments({
    mcpDiscovery,
    mcpServerCard,
    skillBody: await skillResponse.text(),
    skillsIndex,
  });
  const initializeResponse = await fetch(discovery.mcpUrl, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        capabilities: {},
        clientInfo: { name: 'docs-portal-validator', version: '1.0.0' },
        protocolVersion: MCP_PROTOCOL_VERSION,
      },
    }),
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
    },
    method: 'POST',
  });
  if (!initializeResponse.ok) {
    throw new Error(
      `MCP initialize failed with HTTP ${initializeResponse.status}.`,
    );
  }

  const initialized = parseMcpInitializeResponse(
    await initializeResponse.text(),
  );
  console.log(
    `[agent-discovery] Skill ${discovery.skillDigest}; MCP ${initialized.serverInfo.name} ${initialized.serverInfo.version} (${initialized.protocolVersion})`,
  );
}

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(
    await readFile(path.join(repoRoot, relativePath), 'utf8'),
  ) as T;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

function getArgument(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await run();
}
