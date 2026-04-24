import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLinkIcon,
  MessageCircle,
  Sparkles,
  TextIcon,
} from 'lucide-react';
import { type ComponentProps, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

const markdownCache = new Map<string, Promise<string>>();

export function LocalizedMarkdownCopyButton({
  markdownUrl,
  ...props
}: ComponentProps<'button'> & {
  markdownUrl: string;
}) {
  const { t } = useTranslation('common');
  const [isLoading, setLoading] = useState(false);
  const [checked, onClick] = useCopyButton(async () => {
    const cached = markdownCache.get(markdownUrl);
    if (cached) {
      return navigator.clipboard.writeText(await cached);
    }

    setLoading(true);
    try {
      const markdown = fetch(markdownUrl).then((response) => response.text());
      markdownCache.set(markdownUrl, markdown);
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/plain': markdown }),
      ]);
    } finally {
      setLoading(false);
    }
  });

  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      type="button"
      {...props}
      className={cn(
        buttonVariants({
          color: 'secondary',
          size: 'sm',
          className: 'gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground',
        }),
        props.className,
      )}
    >
      {checked ? <Check /> : <Copy />}
      {props.children ?? t('docs.actions.copyMarkdown')}
    </button>
  );
}

export function LocalizedViewOptionsPopover({
  markdownUrl,
  githubUrl,
  ...props
}: ComponentProps<typeof PopoverTrigger> & {
  markdownUrl?: string;
  githubUrl?: string;
}) {
  const { t } = useTranslation('common');
  const pageUrl = typeof window === 'undefined' ? '' : window.location.href;
  const items = useMemo(() => {
    const prompt = t('docs.actions.chatPrompt', { url: pageUrl });

    return [
      markdownUrl && {
        title: t('docs.actions.openMarkdown'),
        href: markdownUrl,
        icon: <TextIcon />,
      },
      githubUrl &&
        githubUrl !== '#' && {
          title: t('docs.actions.openGithub'),
          href: githubUrl,
          icon: <ExternalLinkIcon />,
        },
      {
        title: t('docs.actions.openChatGPT'),
        href: `https://chatgpt.com/?${new URLSearchParams({
          hints: 'search',
          q: prompt,
        })}`,
        icon: <MessageCircle />,
      },
      {
        title: t('docs.actions.openClaude'),
        href: `https://claude.ai/new?${new URLSearchParams({ q: prompt })}`,
        icon: <Sparkles />,
      },
    ].filter(Boolean);
  }, [githubUrl, markdownUrl, pageUrl, t]);

  return (
    <Popover>
      <PopoverTrigger
        {...props}
        className={cn(
          buttonVariants({ color: 'secondary', size: 'sm' }),
          'gap-2 data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground',
          props.className,
        )}
      >
        {props.children ?? t('docs.actions.open')}
        <ChevronDown className="size-3.5 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {items.map((item) =>
          item ? (
            <a
              className="inline-flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4"
              href={item.href}
              key={item.href}
              rel="noreferrer noopener"
              target="_blank"
            >
              {item.icon}
              {item.title}
              <ExternalLinkIcon className="ms-auto size-3.5 text-fd-muted-foreground" />
            </a>
          ) : null,
        )}
      </PopoverContent>
    </Popover>
  );
}
