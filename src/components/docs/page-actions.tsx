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
import { buttonVariants } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
          className:
            'h-8 gap-1.5 border-transparent bg-transparent px-2.5 text-muted-foreground shadow-none hover:bg-accent/45 hover:text-foreground [&_svg]:size-3.5 [&_svg]:text-muted-foreground',
          size: 'sm',
          variant: 'outline',
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
          buttonVariants({
            className:
              'h-8 border-transparent bg-transparent px-2.5 text-muted-foreground shadow-none hover:bg-accent/45 hover:text-foreground',
            size: 'sm',
            variant: 'outline',
          }),
          'gap-1.5 data-[state=open]:bg-accent/55 data-[state=open]:text-foreground',
          props.className,
        )}
      >
        {props.children ?? t('docs.actions.open')}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {items.map((item) =>
          item ? (
            <a
              className="inline-flex items-center gap-2 rounded-xl p-2.5 text-sm hover:bg-accent hover:text-accent-foreground [&_svg]:size-4"
              href={item.href}
              key={item.href}
              rel="noreferrer noopener"
              target="_blank"
            >
              {item.icon}
              {item.title}
              <ExternalLinkIcon className="ms-auto size-3.5 text-muted-foreground" />
            </a>
          ) : null,
        )}
      </PopoverContent>
    </Popover>
  );
}
