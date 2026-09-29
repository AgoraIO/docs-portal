export type AskDocsCitation = {
  title: string;
  url: string;
  headingPath: string[];
};

export type AskDocsResponse = {
  answer: string;
  citations: AskDocsCitation[];
};

export function getAskDocsUrl(): string | null {
  const configured = (import.meta.env as Record<string, string | undefined>)
    .VITE_ASK_DOCS_URL;
  if (configured) return configured;
  return import.meta.env.DEV ? 'http://127.0.0.1:8788' : null;
}

export async function askDocs(
  question: string,
  endpoint: string,
): Promise<AskDocsResponse> {
  const normalizedQuestion = question.trim();
  if (!normalizedQuestion) throw new Error('question must not be empty');

  let response: Response;
  try {
    response = await fetch(`${endpoint.replace(/\/$/, '')}/api/ask-docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: normalizedQuestion }),
    });
  } catch {
    throw new Error('AI service unavailable');
  }

  if (!response.ok) throw new Error('AI service unavailable');

  try {
    const result = (await response.json()) as Partial<AskDocsResponse>;
    if (typeof result.answer !== 'string' || !Array.isArray(result.citations)) {
      throw new Error('invalid AI response');
    }
    return {
      answer: result.answer,
      citations: result.citations.filter(isCitation),
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid AI response') {
      throw error;
    }
    throw new Error('invalid AI response');
  }
}

function isCitation(value: unknown): value is AskDocsCitation {
  if (!value || typeof value !== 'object') return false;
  const citation = value as Partial<AskDocsCitation>;
  return (
    typeof citation.title === 'string' &&
    typeof citation.url === 'string' &&
    Array.isArray(citation.headingPath) &&
    citation.headingPath.every((item) => typeof item === 'string')
  );
}
