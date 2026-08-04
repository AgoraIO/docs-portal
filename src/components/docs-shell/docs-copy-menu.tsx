import {
  BotIcon,
  CheckIcon,
  DownloadIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  EyeIcon,
  MessageSquareTextIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';

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

function buildMarkdownDownloadFilename(slug: string) {
  return `${slug.split('/').filter(Boolean).join('-')}.md`;
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
  markdownUrl: string;
  pageUrl: string;
  title: string;
}) {
  return [
    `Use this Agora docs page as context: ${input.title}`,
    `Canonical page: ${input.pageUrl}`,
    `Markdown page: ${buildMarkdownPageUrl(input.markdownUrl)}`,
  ].join('\n');
}

function buildChatGptUrl(input: {
  markdownUrl: string;
  pageUrl: string;
  title: string;
}) {
  return `${CHATGPT_BASE_URL}?q=${encodeURIComponent(buildAiPrompt(input))}`;
}

function buildClaudeUrl(input: {
  markdownUrl: string;
  pageUrl: string;
  title: string;
}) {
  return `${CLAUDE_BASE_URL}?q=${encodeURIComponent(buildAiPrompt(input))}`;
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
  const { t } = useTranslation('common');
  const [copiedAction, setCopiedAction] = useState<'page' | null>(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pageUrl = buildCanonicalPageUrl(locale, slug);
  const isPrimaryCopied = copiedAction === 'page';
  const markdownDownloadFilename = buildMarkdownDownloadFilename(slug);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedAction('page');
    window.setTimeout(() => {
      setCopiedAction((current) => (current === 'page' ? null : current));
    }, COPY_STATE_MS);
  };

  const copyMarkdownPage = async () => {
    try {
      const response = await fetch(markdownUrl, { credentials: 'same-origin' });

      if (!response.ok) {
        return;
      }

      const markdown = await response.text();
      await copy(markdown);
    } catch {
      return;
    }
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const closeOnScroll = () => {
      setMenuOpen(false);
    };

    window.addEventListener('scroll', closeOnScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', closeOnScroll, { capture: true });
    };
  }, [isMenuOpen]);

  return (
    <DropdownMenu modal={false} onOpenChange={setMenuOpen} open={isMenuOpen}>
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
            aria-label={`${t('docs.copyPage')} more actions`}
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
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a download={markdownDownloadFilename} href={markdownUrl}>
              <DownloadIcon className="size-3.5" />
              {t('docs.downloadPage')}
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={markdownUrl} rel="noreferrer" target="_blank">
              <EyeIcon className="size-3.5" />
              {t('docs.viewMarkdown')}
              <ExternalLinkIcon className="ml-auto size-3.5 opacity-60" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={buildChatGptUrl({
                markdownUrl,
                pageUrl,
                title,
              })}
              rel="noreferrer"
              target="_blank"
            >
              <MessageSquareTextIcon className="size-3.5" />
              {t('docs.openInChatGpt')}
              <ExternalLinkIcon className="ml-auto size-3.5 opacity-60" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={buildClaudeUrl({
                markdownUrl,
                pageUrl,
                title,
              })}
              rel="noreferrer"
              target="_blank"
            >
              <MessageSquareTextIcon className="size-3.5" />
              {t('docs.openInClaude')}
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
  buildMarkdownDownloadFilename,
  buildMarkdownPageUrl,
};
