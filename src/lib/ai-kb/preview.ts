import { createHash } from 'node:crypto';
import { createProcessor } from '@mdx-js/mdx';
import { remarkGfm } from 'fumadocs-core/mdx-plugins';
import type { KbMetadata } from './corpus';
import { parseKbCorpus } from './plan';

type Issue = {
  sourceId: string;
  code:
    | 'parse-error'
    | 'oversized-block'
    | 'unmapped-heading'
    | 'empty-body'
    | 'missing-product';
  severity: 'error' | 'warning';
  offset: number;
};
type Chunk = {
  id: string;
  sourceId: string;
  documentHash: string;
  start: number;
  end: number;
  content: string;
  citationUrl: string;
  headingPath: string[];
  metadata: KbMetadata;
};

/** Offline preview only. No cloud writes, token estimates or Bailian chunk claims. */
export function previewKbCorpus(value: unknown, targetChars = 3000) {
  if (
    !Number.isSafeInteger(targetChars) ||
    targetChars < 32 ||
    targetChars > 20000
  )
    throw new Error('targetChars must be an integer between 32 and 20000');
  const corpus = parseKbCorpus(value);
  const chunks: Chunk[] = [];
  const issues: Issue[] = [];
  const processor = createProcessor({
    format: 'mdx',
    remarkPlugins: [remarkGfm],
  });
  for (const document of corpus.documents) {
    const { content, metadata, sourceId } = document;
    const issue = (
      code: Issue['code'],
      offset = 0,
      severity: Issue['severity'] = 'warning',
    ) => issues.push({ sourceId, code, offset, severity });
    let citationUrl = sourceId;
    let headingPath = [metadata.title];
    const emit = (start: number, end: number) => {
      if (end <= start) return;
      const text = content.slice(start, end);
      const id = createHash('sha256')
        .update(
          JSON.stringify({
            policy: 'mdx-block-v1',
            sourceId,
            documentHash: document.hash,
            targetChars,
            start,
            end,
          }),
        )
        .digest('hex');
      chunks.push({
        id,
        sourceId,
        documentHash: document.hash,
        start,
        end,
        content: text,
        citationUrl,
        headingPath: [...headingPath],
        metadata,
      });
    };
    if (!metadata.products.length) issue('missing-product');
    let tree: ReturnType<typeof processor.parse>;
    try {
      tree = processor.parse(content);
    } catch {
      issue('parse-error', 0, 'error');
      emit(0, content.length);
      continue;
    }
    if (
      !tree.children.some(
        (node) => node.type !== 'heading' && node.type !== 'definition',
      )
    )
      issue('empty-body', 0, 'error');
    let start = 0;
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      const offset = node.position?.start.offset ?? 0;
      const next =
        tree.children[i + 1]?.position?.start.offset ?? content.length;
      if (node.type === 'heading') {
        emit(start, offset);
        start = offset;
        // Published Markdown explicitly marks anchors. Never derive a slug from a title.
        const raw = content.slice(offset, node.position?.end.offset);
        const anchor = raw.match(/\[#([^\]\n]+)\]\s*$/)?.[1];
        const matched = anchor
          ? metadata.sections.find((s) => s.url === `${sourceId}#${anchor}`)
          : undefined;
        citationUrl = matched?.url ?? sourceId;
        headingPath = matched?.headingPath ?? [metadata.title];
        if (!matched && (anchor || node.depth !== 1))
          issue('unmapped-heading', offset);
      }
      if (next - start > targetChars && offset > start) {
        emit(start, offset);
        start = offset;
      }
      if (next - offset > targetChars) issue('oversized-block', offset);
    }
    emit(start, content.length);
  }
  return {
    schema: 1 as const,
    policy: 'mdx-block-v1' as const,
    scope: corpus.scope,
    revision: corpus.revision,
    targetChars,
    cloudVerified: false as const,
    ready: !issues.some((x) => x.severity === 'error'),
    documents: corpus.documents.length,
    chunks,
    issues,
  };
}
