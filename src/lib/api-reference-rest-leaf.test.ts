import { describe, expect, it } from 'vitest';
import { buildApiReferenceRail } from './api-reference-sidebar.testkit';

describe('api reference REST leaf (spike)', () => {
  it('renders a Voice Agents "REST API" leaf as an internal page node', () => {
    const rail = buildApiReferenceRail();
    const allSections = rail.flatMap((n) =>
      n.type === 'section' ? [n, ...n.children] : [n],
    );
    const voiceAgents = allSections.find(
      (n) => n.type === 'section' && n.title === 'Voice Agents',
    ) as Extract<
      ReturnType<typeof buildApiReferenceRail>[number],
      { type: 'section' }
    >;
    expect(voiceAgents).toBeDefined();

    const restLeaf = voiceAgents.children.find(
      (c) => c.type === 'page' && c.title === 'REST API',
    );
    expect(restLeaf).toMatchObject({
      type: 'page',
      title: 'REST API',
      url: '/en/api-reference/api-ref/conversational-ai',
    });
    expect((restLeaf as { external?: boolean }).external).toBeFalsy();
  });
});
