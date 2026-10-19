import { createFileRoute } from '@tanstack/react-router';
import { handleAnswerRequest } from '@/lib/ai-answer/answer-api.server';

export const Route = createFileRoute('/api/ai/answer')({
  server: { handlers: { POST: ({ request }) => handleAnswerRequest(request) } },
});
