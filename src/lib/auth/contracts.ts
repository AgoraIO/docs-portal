export type DocsAccount = {
  accountUid: string;
  companyId: string | null;
};

export type DocsUserInfo =
  | { status: 'authenticated'; user: DocsAccount; expiresAt: string }
  | { status: 'unauthenticated' }
  | { status: 'unknown'; error: string };

// Paths with first-party documentation evidence. Other products must add an
// explicit mapping; browser input cannot supply arbitrary redirect URLs.
export const cnConsoleTargets = {
  home: '/',
  rtm: '/product/RTM2?tab=config',
  'conversational-ai': '/product/ConversationAI?tab=Playground',
} as const;

export type ConsoleTarget = keyof typeof cnConsoleTargets;

export type AccountFlow = {
  flowId: string;
  target: ConsoleTarget;
  resourceType: 'sdk' | 'demo' | 'account';
  resourceId?: string;
  sourcePath?: string;
  platform?: string;
  version?: string;
  anonymousId?: string;
};

export type AuthTransaction = {
  flow: AccountFlow;
  startedAt: number;
};

export type AuthSession = {
  user: DocsAccount;
  expiresAt: number;
};

export type AccountEvent = {
  uuid: string;
  event:
    | '$identify'
    | 'docs_account_auth_succeeded'
    | 'docs_account_auth_failed'
    | 'docs_console_redirected';
  distinct_id: string;
  timestamp: string;
  properties: Record<string, unknown>;
};
