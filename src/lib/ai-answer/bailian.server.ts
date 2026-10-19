import { open } from 'node:fs/promises';
import { workspaceHost } from '../ai-kb/bailian-config';
import type { KbCorpus } from '../ai-kb/corpus';
import { parseKbCorpus } from '../ai-kb/plan';
import { createAnswerService, type Evidence } from './answer.server';
import { AnswerError } from './contracts';
import {
  createBailianPost,
  createQwenGenerator,
  upstreamObject as object,
} from './qwen.server';

function id(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_.:-]{1,256}$/.test(value))
    throw new AnswerError('AI_CONFIG');
  return value;
}
export async function readAnswerBindings(path: string): Promise<unknown> {
  const file = await open(path, 'r');
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > 1024 * 1024)
      throw new AnswerError('AI_CONFIG');
    const buffer = Buffer.alloc(stat.size + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await file.read(
        buffer,
        offset,
        buffer.length - offset,
        null,
      );
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset !== stat.size) throw new AnswerError('AI_CONFIG');
    return JSON.parse(buffer.subarray(0, offset).toString('utf8'));
  } finally {
    await file.close();
  }
}

/** Demo integration; remote bindings must come from verified cloud document receipts. */
export function createBailianAnswer(options: {
  corpus: KbCorpus;
  bindings: unknown;
  apiKey: string;
  modelApiKey?: string;
  model?: string;
  fetch?: typeof fetch;
}) {
  const corpus = parseKbCorpus(options.corpus);
  if (corpus.documents.length > 100) throw new AnswerError('AI_CONFIG');
  const binding = object(options.bindings);
  const workspaceId = id(binding.workspaceId);
  const host = workspaceHost(workspaceId);
  const indexId = id(binding.indexId),
    agentId = id(binding.agentId);
  if (
    binding.schema !== 1 ||
    binding.scope !== corpus.scope ||
    !Array.isArray(binding.documents) ||
    binding.documents.length !== corpus.documents.length
  )
    throw new AnswerError('AI_CONFIG');
  const documents = new Map(corpus.documents.map((d) => [d.sourceId, d]));
  const remoteSources = new Map<string, string>();
  const sourceIds = new Set<string>();
  for (const raw of binding.documents) {
    const row = object(raw);
    const doc = documents.get(String(row.sourceId));
    const documentId = id(row.documentId);
    if (
      !doc ||
      row.hash !== doc.hash ||
      sourceIds.has(doc.sourceId) ||
      remoteSources.has(documentId)
    )
      throw new AnswerError('AI_CONFIG');
    sourceIds.add(doc.sourceId);
    remoteSources.set(documentId, doc.sourceId);
  }
  const apiKey = options.apiKey;
  const modelKey = options.modelApiKey ?? apiKey;
  if (
    [apiKey, modelKey].some(
      (k) => typeof k !== 'string' || !k.trim() || /[\r\n]/.test(k),
    )
  )
    throw new AnswerError('AI_CONFIG');
  const post = createBailianPost(host, [apiKey, modelKey], options.fetch);
  const generate = createQwenGenerator({
    apiKey: modelKey,
    additionalSecrets: [apiKey],
    workspaceId,
    model: options.model,
    fetch: options.fetch,
  });
  return createAnswerService({
    mode: 'bailian',
    corpus,
    async retrieve(input, signal) {
      const response = await post(
        '/api/v1/indices/knowledge/search',
        {
          agent_id: agentId,
          query: input.question,
          kb_search_configs: [{ id: indexId }],
        },
        apiKey,
        signal,
      );
      if (
        response.success !== true ||
        response.code !== 'Success' ||
        response.status_code !== 200 ||
        response.status !== 'SUCCESS'
      )
        throw new AnswerError('AI_UPSTREAM');
      const nodes = object(response.data).nodes;
      if (!Array.isArray(nodes) || nodes.length > 1000)
        throw new AnswerError('AI_UPSTREAM');
      const evidence: Evidence[] = [];
      for (const raw of nodes.slice(0, 100)) {
        const node = object(raw),
          metadata = object(node.metadata);
        // Never trust doc_url/file_path or service-generated decorated `text`.
        const sourceId = remoteSources.get(String(metadata.doc_id));
        if (
          !sourceId ||
          metadata.pipeline_id !== indexId ||
          metadata.workspace_id !== workspaceId ||
          typeof metadata.content !== 'string'
        )
          continue;
        evidence.push({
          id: `e${evidence.length + 1}`,
          sourceId,
          text: metadata.content,
        });
      }
      // The orchestrator additionally enforces corpus content and request filters.
      return evidence;
    },
    generate,
  });
}
