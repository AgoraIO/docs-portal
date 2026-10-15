import {
  type AnswerRequest,
  type AnswerResponse,
  isSafeCitationUrl,
  parseAnswerRequest,
} from './contracts';

export async function askDocumentQuestion(
  input: AnswerRequest,
  signal?: AbortSignal,
): Promise<AnswerResponse> {
  const response = await fetch('/api/ai/answer', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(parseAnswerRequest(input)),
  });
  if (!response.ok) throw new Error('AI_UNAVAILABLE');
  const value = await response.json();
  if (
    !['local-demo', 'bailian'].includes(value?.mode) ||
    !['answered', 'no-evidence'].includes(value.status) ||
    typeof value.answer !== 'string' ||
    !value.answer.trim() ||
    value.answer.length > 24000 ||
    !Array.isArray(value.citations) ||
    value.citations.length > 6 ||
    (value.status === 'answered'
      ? !value.citations.length
      : value.citations.length !== 0) ||
    value.citations.some((c: unknown) => {
      if (!c || typeof c !== 'object') return true;
      const entry = c as Record<string, unknown>;
      return (
        typeof entry.id !== 'string' ||
        !/^[\w-]{1,100}$/.test(entry.id) ||
        typeof entry.title !== 'string' ||
        !entry.title.trim() ||
        entry.title.length > 500 ||
        !isSafeCitationUrl(entry.url)
      );
    }) ||
    new Set(value.citations.map((c: { id: string }) => c.id)).size !==
      value.citations.length
  )
    throw new Error('INVALID_RESPONSE');
  return value as AnswerResponse;
}
