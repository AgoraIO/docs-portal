import { Link } from '@tanstack/react-router';
import {
  BotIcon,
  CheckIcon,
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import { DEFAULT_LOCALE, normalizeLocale } from '@/lib/i18n/i18n-config';

const AGORA_DOCS_MCP_URL = 'https://mcp.agora.io';
const AGORA_DOCS_MCP_NAME = 'agora-docs';
const SHENGWANG_DOCS_MCP_URL = 'https://doc-mcp.shengwang.cn/mcp';
const SHENGWANG_DOCS_MCP_NAME = 'shengwang-docs';
const AGORA_MCP_DOC_ROUTE = '/$locale/$tab/$';
const CHATGPT_BASE_URL = 'https://chatgpt.com/';
const CLAUDE_BASE_URL = 'https://claude.ai/new';
const COPY_STATE_MS = 2500;

export type DocsCopyPageAction = {
  markdownUrl: string;
  slug: string;
  title: string;
};

function buildCanonicalPageUrl(locale: string, slug: string) {
  return buildDocsPageUrl(`/${locale}/${slug}`);
}

function buildMarkdownPageUrl(markdownUrl: string) {
  return buildDocsPageUrl(markdownUrl);
}

function buildDocsPageUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const origin =
    typeof window === 'undefined' || !window.location.origin
      ? ''
      : window.location.origin;

  return `${origin}${normalizedPath}`;
}

function buildAiPrompt(input: {
  locale?: string;
  markdownUrl: string;
  pageUrl: string;
  title: string;
}) {
  if (normalizeLocale(input.locale) === 'zh-CN') {
    return [
      `请使用这篇声网文档作为上下文：${input.title}`,
      `正式页面：${input.pageUrl}`,
      `Markdown 页面：${buildMarkdownPageUrl(input.markdownUrl)}`,
    ].join('\n');
  }

  return [
    `Use this Agora docs page as context: ${input.title}`,
    `Canonical page: ${input.pageUrl}`,
    `Markdown page: ${buildMarkdownPageUrl(input.markdownUrl)}`,
  ].join('\n');
}

function buildChatGptUrl(input: {
  locale?: string;
  markdownUrl: string;
  pageUrl: string;
  title: string;
}) {
  return `${CHATGPT_BASE_URL}?q=${encodeURIComponent(buildAiPrompt(input))}`;
}

function buildClaudeUrl(input: {
  locale?: string;
  markdownUrl: string;
  pageUrl: string;
  title: string;
}) {
  return `${CLAUDE_BASE_URL}?q=${encodeURIComponent(buildAiPrompt(input))}`;
}

function getMcpServer(locale: string) {
  if (normalizeLocale(locale) === 'zh-CN') {
    return {
      name: SHENGWANG_DOCS_MCP_NAME,
      url: SHENGWANG_DOCS_MCP_URL,
    };
  }

  return {
    name: AGORA_DOCS_MCP_NAME,
    url: AGORA_DOCS_MCP_URL,
  };
}

function getMcpDocParams(locale: string) {
  if (normalizeLocale(locale) === 'zh-CN') {
    return {
      _splat: 'mcp-integrate',
      locale: 'zh-CN',
      tab: 'introduction',
    };
  }

  return {
    _splat: 'agora-mcp',
    locale: 'en',
    tab: 'introduction',
  };
}

function getCursorMcpConfig(locale = DEFAULT_LOCALE) {
  const server = getMcpServer(locale);

  return JSON.stringify(
    {
      mcpServers: {
        [server.name]: {
          url: server.url,
        },
      },
    },
    null,
    2,
  );
}

function getVsCodeMcpCommand(locale = DEFAULT_LOCALE) {
  const server = getMcpServer(locale);

  return `code --add-mcp '{"name":"${server.name}","url":"${server.url}"}'`;
}

export function DocsCopyMenu({
  className,
  locale,
  markdownUrl,
  slug,
  title,
}: DocsCopyPageAction & {
  className?: string;
  locale: string;
}) {
  const { i18n } = useTranslation('common');
  const currentLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const t = i18n.getFixedT(currentLocale, 'common');
  const [copiedAction, setCopiedAction] = useState<
    'page' | 'config' | 'command' | null
  >(null);
  const pageUrl = buildCanonicalPageUrl(locale, slug);
  const mcpDocParams = getMcpDocParams(currentLocale);
  const isPrimaryCopied = copiedAction === 'page';

  const copy = async (kind: 'page' | 'config' | 'command', value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedAction(kind);
    window.setTimeout(() => {
      setCopiedAction((current) => (current === kind ? null : current));
    }, COPY_STATE_MS);
  };

  const copyMarkdownPage = async () => {
    try {
      const response = await fetch(markdownUrl, { credentials: 'same-origin' });

      if (!response.ok) {
        return;
      }

      const markdown = await response.text();
      await copy('page', markdown);
    } catch {
      return;
    }
  };

  return (
    <DropdownMenu>
      <div
        className={cn(
          'inline-flex items-stretch rounded-md border border-[color:var(--line-soft)] bg-card',
          className,
        )}
      >
        <Button
          aria-label={t('docs.copyPage')}
          aria-live="polite"
          className={cn(
            'h-7 gap-1.5 rounded-r-none border-0 px-2.5 text-xs font-medium text-[color:var(--ink-3)] hover:bg-transparent hover:text-[color:var(--ink-1)]',
            isPrimaryCopied &&
              'scale-[1.02] bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/35 hover:bg-emerald-500/12 hover:text-emerald-700 dark:text-emerald-300',
          )}
          data-copied={isPrimaryCopied ? 'true' : undefined}
          onClick={() => void copyMarkdownPage()}
          size="sm"
          variant="ghost"
        >
          {isPrimaryCopied ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <BotIcon className="size-3.5" />
          )}
          <span>{isPrimaryCopied ? t('docs.copied') : t('docs.copyPage')}</span>
        </Button>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={t('docs.copyPageMoreActions')}
            className="h-7 rounded-l-none border-0 border-l border-l-[color:var(--line-soft)] px-2 text-[color:var(--ink-3)] hover:bg-transparent hover:text-[color:var(--ink-1)] data-[state=open]:text-[color:var(--ink-1)]"
            size="sm"
            variant="ghost"
          >
            <EllipsisIcon className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent
        align="start"
        aria-label={t('docs.copyPage')}
        className="w-64 rounded-lg p-1"
      >
        <DropdownMenuLabel>{t('docs.copyMenuAiTools')}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a
              href={buildChatGptUrl({
                locale: currentLocale,
                markdownUrl,
                pageUrl,
                title,
              })}
              rel="noreferrer"
              target="_blank"
            >
              {t('docs.openInChatGpt')}
              <ExternalLinkIcon className="ml-auto size-3.5 opacity-60" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={buildClaudeUrl({
                locale: currentLocale,
                markdownUrl,
                pageUrl,
                title,
              })}
              rel="noreferrer"
              target="_blank"
            >
              {t('docs.openInClaude')}
              <ExternalLinkIcon className="ml-auto size-3.5 opacity-60" />
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('docs.copyMenuMcp')}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link params={mcpDocParams} to={AGORA_MCP_DOC_ROUTE}>
              {t('docs.connectToCursor')}
              <ExternalLinkIcon className="ml-auto size-3.5 opacity-60" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link params={mcpDocParams} to={AGORA_MCP_DOC_ROUTE}>
              {t('docs.connectToVsCode')}
              <ExternalLinkIcon className="ml-auto size-3.5 opacity-60" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void copy('config', getCursorMcpConfig(currentLocale))
            }
          >
            {copiedAction === 'config' ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            {copiedAction === 'config'
              ? t('docs.copied')
              : t('docs.copyMcpConfig')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void copy('command', getVsCodeMcpCommand(currentLocale))
            }
          >
            {copiedAction === 'command' ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            {copiedAction === 'command'
              ? t('docs.copied')
              : t('docs.copyMcpCommand')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('docs.copyMenuOther')}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href={markdownUrl} rel="noreferrer" target="_blank">
              {t('docs.viewAsMarkdown')}
              <ExternalLinkIcon className="ml-auto size-3.5 opacity-60" />
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export {
  buildAiPrompt,
  buildCanonicalPageUrl,
  buildChatGptUrl,
  buildClaudeUrl,
  buildDocsPageUrl,
  buildMarkdownPageUrl,
  getCursorMcpConfig,
  getVsCodeMcpCommand,
};
