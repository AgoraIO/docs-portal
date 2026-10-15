import { isKnownPlatform } from '../platforms/registry';

export type AnswerRequest = {
  question: string;
  product?: string;
  platform?: string;
  version?: string;
  type?: 'all' | 'docs' | 'openapi';
};
export type Citation = { id: string; title: string; url: string };
export type AnswerResponse = {
  mode: 'local-demo' | 'bailian';
  status: 'answered' | 'no-evidence';
  answer: string;
  citations: Citation[];
};
export class AnswerError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'AnswerError';
  }
}
export function parseAnswerRequest(value: unknown): AnswerRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new AnswerError('INVALID_REQUEST');
  const v = value as Record<string, unknown>;
  if (
    Object.keys(v).some(
      (k) =>
        !['question', 'product', 'platform', 'version', 'type'].includes(k),
    ) ||
    typeof v.question !== 'string' ||
    !v.question.trim() ||
    v.question.length > 2000 ||
    (v.product !== undefined &&
      (typeof v.product !== 'string' ||
        !/^[a-z0-9][a-z0-9-]{0,79}$/.test(v.product))) ||
    (v.platform !== undefined &&
      (typeof v.platform !== 'string' || !isKnownPlatform(v.platform))) ||
    (v.version !== undefined &&
      (typeof v.version !== 'string' || !/^[\w.-]{1,80}$/.test(v.version))) ||
    (v.type !== undefined &&
      !['all', 'docs', 'openapi'].includes(v.type as string))
  )
    throw new AnswerError('INVALID_REQUEST');
  return {
    question: v.question.trim(),
    ...(v.product !== undefined ? { product: v.product as string } : {}),
    ...(v.platform !== undefined ? { platform: v.platform as string } : {}),
    ...(v.version !== undefined ? { version: v.version as string } : {}),
    ...(v.type !== undefined ? { type: v.type as AnswerRequest['type'] } : {}),
  };
}

// Both server citations and untrusted HTTP responses must pass this check.
export function isSafeCitationUrl(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/zh-CN/') ||
    value.includes('?')
  )
    return false;
  try {
    const decoded = decodeURIComponent(value);
    if (
      /[\s\\%]/.test(decoded) ||
      Array.from(decoded).some(
        (c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127,
      ) ||
      decoded.split('#').length > 2
    )
      return false;
    const page = decoded.split('#')[0];
    return (
      !page.split('/').some((s) => s === '.' || s === '..') &&
      new URL(value, 'https://docs.local').origin === 'https://docs.local'
    );
  } catch {
    return false;
  }
}
