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

type McpTool = {
  name: string;
};

type McpServerCard = {
  serverInfo?: { name: string; version: string };
  tools?: McpTool[];
  url: string;
};

type McpServerCards = {
  servers?: McpServerCard[];
};

type SkillsIndex = {
  skills?: Array<{ digest: string; url: string }>;
};

type Sep2127ServerCard = {
  name: string;
  remotes?: Array<{ supportedProtocolVersions?: string[]; url: string }>;
  version: string;
};

type McpJsonRpcPayload<T> = {
  error?: unknown;
  result?: T;
};

export function validateDiscoveryDocuments({
  mcpDiscovery,
  mcpServerCard,
  mcpServerCards,
  skillBody,
  skillsIndex,
}: {
  mcpDiscovery: McpDiscovery;
  mcpServerCard: McpServerCard;
  mcpServerCards: McpServerCards;
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

  if (
    mcpServerCards.servers?.length !== 1 ||
    JSON.stringify(mcpServerCards.servers[0]) !== JSON.stringify(mcpServerCard)
  ) {
    throw new Error('MCP server card endpoints advertise different metadata.');
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

export function validateSep2127ServerCard({
  mcpDiscovery,
  sep2127ServerCard,
}: {
  mcpDiscovery: McpDiscovery;
  sep2127ServerCard: Sep2127ServerCard;
}) {
  if (!/^[^/]+\/[^/]+$/.test(sep2127ServerCard.name)) {
    throw new Error(
      `MCP server card name "${sep2127ServerCard.name}" is not in reverse-DNS/server-name format.`,
    );
  }

  const [remote] = sep2127ServerCard.remotes ?? [];
  if (!remote || remote.url !== mcpDiscovery.url) {
    throw new Error(
      'MCP server card (SEP-2127) advertises a different endpoint than MCP discovery.',
    );
  }

  if (!remote.supportedProtocolVersions?.includes(MCP_PROTOCOL_VERSION)) {
    throw new Error(
      `MCP server card (SEP-2127) does not list the live MCP protocol version ${MCP_PROTOCOL_VERSION}.`,
    );
  }
}

export function parseMcpInitializeResponse(body: string): McpInitializeResult {
  const payload = parseMcpJsonRpcPayload<McpInitializeResult>(body);

  if (payload.error) {
    throw new Error(`MCP initialize failed: ${JSON.stringify(payload.error)}`);
  }
  if (!payload.result?.protocolVersion || !payload.result?.serverInfo?.name) {
    throw new Error('MCP initialize returned incomplete server metadata.');
  }

  return payload.result;
}

export function parseMcpToolsResponse(body: string): McpTool[] {
  const payload = parseMcpJsonRpcPayload<{ tools?: McpTool[] }>(body);

  if (payload.error) {
    throw new Error(`MCP tools/list failed: ${JSON.stringify(payload.error)}`);
  }
  if (!payload.result?.tools) {
    throw new Error('MCP tools/list returned incomplete tool metadata.');
  }

  return payload.result.tools;
}

export function validateMcpServiceMetadata({
  initialized,
  listedTools,
  mcpServerCard,
}: {
  initialized: McpInitializeResult;
  listedTools: McpTool[];
  mcpServerCard: McpServerCard;
}) {
  if (
    JSON.stringify(mcpServerCard.serverInfo) !==
    JSON.stringify(initialized.serverInfo)
  ) {
    throw new Error('MCP server card serverInfo does not match initialize.');
  }

  const advertisedToolNames = (mcpServerCard.tools ?? [])
    .map((tool) => tool.name)
    .sort();
  const listedToolNames = listedTools.map((tool) => tool.name).sort();
  if (JSON.stringify(advertisedToolNames) !== JSON.stringify(listedToolNames)) {
    throw new Error('MCP server card tool metadata does not match tools/list.');
  }
}

async function run() {
  const baseUrl = getArgument('--base-url')?.replace(/\/$/, '');
  const [
    mcpDiscovery,
    mcpServerCard,
    mcpServerCards,
    skillsIndex,
    compatibilityDiscovery,
    sep2127ServerCard,
  ] = baseUrl
    ? await Promise.all([
        fetchJson<McpDiscovery>(`${baseUrl}/.well-known/mcp.json`),
        fetchJson<McpServerCard>(`${baseUrl}/.well-known/mcp/server-card.json`),
        fetchJson<McpServerCards>(
          `${baseUrl}/.well-known/mcp/server-cards.json`,
        ),
        fetchJson<SkillsIndex>(
          `${baseUrl}/.well-known/agent-skills/index.json`,
        ),
        fetchJson<McpDiscovery>(`${baseUrl}/.well-known/mcp`),
        fetchJson<Sep2127ServerCard>(`${baseUrl}/.well-known/mcp-server-card`),
      ])
    : await Promise.all([
        readJson<McpDiscovery>('public/.well-known/mcp.json'),
        readJson<McpServerCard>('public/.well-known/mcp/server-card.json'),
        readJson<McpServerCards>('public/.well-known/mcp/server-cards.json'),
        readJson<SkillsIndex>('public/.well-known/agent-skills/index.json'),
        readJson<McpDiscovery>('public/.well-known/mcp.json'),
        readJson<Sep2127ServerCard>('public/.well-known/mcp-server-card'),
      ]);

  if (JSON.stringify(mcpDiscovery) !== JSON.stringify(compatibilityDiscovery)) {
    throw new Error('The MCP compatibility endpoint does not match mcp.json.');
  }
  validateSep2127ServerCard({ mcpDiscovery, sep2127ServerCard });

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
    mcpServerCards,
    skillBody: await skillResponse.text(),
    skillsIndex,
  });
  const initialized = parseMcpInitializeResponse(
    await callMcpMethod(discovery.mcpUrl, 1, 'initialize', {
      capabilities: {},
      clientInfo: { name: 'docs-portal-validator', version: '1.0.0' },
      protocolVersion: MCP_PROTOCOL_VERSION,
    }),
  );
  const listedTools = parseMcpToolsResponse(
    await callMcpMethod(discovery.mcpUrl, 2, 'tools/list', {}),
  );
  validateMcpServiceMetadata({ initialized, listedTools, mcpServerCard });
  console.log(
    `[agent-discovery] Skill ${discovery.skillDigest}; MCP ${initialized.serverInfo.name} ${initialized.serverInfo.version} (${initialized.protocolVersion}); ${listedTools.length} tools`,
  );
}

function parseMcpJsonRpcPayload<T>(body: string): McpJsonRpcPayload<T> {
  if (body.trim().startsWith('{')) {
    return JSON.parse(body) as McpJsonRpcPayload<T>;
  }

  const data = body
    .split('\n')
    .find((line) => line.startsWith('data: '))
    ?.slice('data: '.length);
  return JSON.parse(data ?? '') as McpJsonRpcPayload<T>;
}

async function callMcpMethod(
  url: string,
  id: number,
  method: string,
  params: unknown,
) {
  const response = await fetch(url, {
    body: JSON.stringify({ id, jsonrpc: '2.0', method, params }),
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
    },
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`MCP ${method} failed with HTTP ${response.status}.`);
  }
  return response.text();
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
