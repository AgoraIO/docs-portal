import browserCollections from 'collections/browser';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import type { TOCItemType } from 'fumadocs-core/toc';
import { TOCProvider } from 'fumadocs-ui/components/toc';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Blocks,
  Bot,
  Cable,
  ChevronRight,
  KeyRound,
  LayoutGrid,
  MicVocal,
  RadioTower,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { DocsSharedContent } from '@/components/docs/DocsSharedContent';
import { getMDXComponents } from '@/components/mdx';
import { cn } from '@/lib/cn';

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, default: MDX },
    {
      description,
      markdownUrl,
      path,
      title,
    }: {
      description?: string;
      markdownUrl: string;
      path: string;
      title: string;
    },
  ) {
    const isLandingPage = path.includes('landing-page');

    return (
      <PortalDocShell toc={toc}>
        <DocsSharedContent
          description={description}
          markdownUrl={markdownUrl}
          path={path}
          title={title}
        >
          {isLandingPage ? (
            <PortalLandingContent />
          ) : (
            <MDX components={getMDXComponents()} />
          )}
        </DocsSharedContent>
      </PortalDocShell>
    );
  },
});

export function PortalDocContent({
  description,
  markdownUrl,
  path,
  title,
}: {
  description?: string;
  markdownUrl: string;
  path: string;
  title: string;
}) {
  const content = useFumadocsLoader({
    description,
    markdownUrl,
    path,
    title,
  });

  return (
    <Suspense>
      {clientLoader.useContent(content.path, {
        description: content.description,
        markdownUrl: content.markdownUrl,
        path: content.path,
        title: content.title,
      })}
    </Suspense>
  );
}

function PortalDocShell({
  children,
  toc,
}: {
  children: React.ReactNode;
  toc: TOCItemType[];
}) {
  const normalizedToc = useMemo(
    () => toc.filter((item) => typeof item.title === 'string'),
    [toc],
  );
  const fallbackToc = useFallbackToc(normalizedToc);
  const resolvedToc = fallbackToc.length > 0 ? fallbackToc : normalizedToc;

  return (
    <TOCProvider toc={resolvedToc}>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,860px)_15rem] xl:items-start xl:gap-12">
        <article className="w-full max-w-[860px]">{children}</article>
        <PortalToc toc={resolvedToc} />
      </div>
    </TOCProvider>
  );
}

function PortalToc({ toc }: { toc: TOCItemType[] }) {
  const { text } = useI18n();

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-[8.8rem] max-h-[calc(100vh-10rem)] overflow-y-auto border-l border-border/70 pl-5 text-muted-foreground">
        <h3
          className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.12em]"
          id="portal-toc-title"
        >
          {text.toc}
        </h3>
        {toc.length > 0 ? (
          <ul className="space-y-1">
            {toc.map((item) => (
              <li key={item.url}>
                <a
                  className={cn(
                    'block rounded-lg px-3 py-1.5 text-[0.84rem] transition-colors hover:bg-accent/42 hover:text-foreground',
                    item.depth > 2 && 'ml-3',
                    item.depth > 3 && 'ml-6',
                  )}
                  href={item.url}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">{text.tocNoHeadings}</p>
        )}
      </div>
    </aside>
  );
}

function useFallbackToc(primaryToc: TOCItemType[]) {
  const [fallbackToc, setFallbackToc] = useState<TOCItemType[]>([]);

  useEffect(() => {
    if (primaryToc.length > 0) {
      setFallbackToc([]);
      return;
    }

    const article = document.querySelector('article.w-full');
    if (!article) {
      setFallbackToc([]);
      return;
    }

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]'),
    );

    setFallbackToc(
      headings.map((heading) => ({
        depth: Number(heading.tagName.slice(1)),
        title: heading.textContent?.trim() ?? '',
        url: `#${heading.id}`,
      })),
    );
  }, [primaryToc]);

  return fallbackToc;
}

function PortalLandingContent() {
  const { i18n } = useTranslation('common');
  const isZh = i18n.resolvedLanguage !== 'en';

  const highlightCards = isZh
    ? [
        {
          body: '把实时对话、语音合成、打断控制和上下文管理串成一条完整的 agent 交互链路。',
          icon: <Bot className="size-4.5" />,
          title: '对话式 AI Agent',
        },
        {
          body: '基于 RTC 频道承载语音互动，让智能体和用户真正进入同一条实时媒体链路。',
          icon: <RadioTower className="size-4.5" />,
          title: '实时语音互动',
        },
        {
          body: '支持自定义大模型、TTS/ASR 厂商和多模态输入输出，便于做业务定制。',
          icon: <WandSparkles className="size-4.5" />,
          title: '模型与能力扩展',
        },
      ]
    : [
        {
          body: 'Connect realtime conversation, synthesis, interruption control, and memory into one production agent flow.',
          icon: <Bot className="size-4.5" />,
          title: 'Conversational AI Agent',
        },
        {
          body: 'Run the voice experience over RTC so the user and the agent share the same realtime media path.',
          icon: <RadioTower className="size-4.5" />,
          title: 'Realtime Voice Interaction',
        },
        {
          body: 'Customize models, ASR/TTS vendors, and multimodal IO for production-grade integrations.',
          icon: <WandSparkles className="size-4.5" />,
          title: 'Model & Capability Extensions',
        },
      ];

  const quickstartCards = isZh
    ? [
        {
          body: '先在控制台开通服务、获取 App ID 和客户密钥，为 RESTful 调用与 RTC 入会准备基础条件。',
          href: '/?domain=docs&page=get-started/enable-service',
          icon: <Sparkles className="size-4.5" />,
          title: '开通服务',
        },
        {
          body: '快速跑通一个最小实时对话链路，完成创建智能体、加入频道和语音互动。',
          href: '/?domain=docs&page=get-started/quick-start',
          icon: <MicVocal className="size-4.5" />,
          title: 'RESTful 快速开始',
        },
        {
          body: '如果你在服务端直接接入，优先从 Go / Java 样例进入，缩短首个接口联调时间。',
          href: '/?domain=sdks&page=get-started/quick-start-go',
          icon: <Cable className="size-4.5" />,
          title: '服务端 SDK 入口',
        },
      ]
    : [
        {
          body: 'Turn on the service in Console and collect App ID plus credentials before you call the RESTful endpoints.',
          href: '/?domain=docs&page=get-started/enable-service',
          icon: <Sparkles className="size-4.5" />,
          title: 'Enable Service',
        },
        {
          body: 'Ship the first realtime voice loop by creating an agent, joining the channel, and talking to it.',
          href: '/?domain=docs&page=get-started/quick-start',
          icon: <MicVocal className="size-4.5" />,
          title: 'RESTful Quickstart',
        },
        {
          body: 'If you integrate from the server side first, start from the Go / Java samples to shorten the first API loop.',
          href: '/?domain=sdks&page=get-started/quick-start-go',
          icon: <Cable className="size-4.5" />,
          title: 'Server SDK Entry',
        },
      ];

  const keyLinks = isZh
    ? [
        {
          href: '/?domain=docs&page=overview/product-overview',
          label: '产品概览',
        },
        {
          href: '/?domain=docs&page=overview/concepts',
          label: '关键概念',
        },
        {
          href: '/?domain=api&page=operations/start-agent',
          label: '创建智能体 API',
        },
        {
          href: '/?domain=recepies&page=user-guides/audio-modality',
          label: '语音与多模态实践',
        },
      ]
    : [
        {
          href: '/?domain=docs&page=overview/product-overview',
          label: 'Product Overview',
        },
        {
          href: '/?domain=docs&page=overview/concepts',
          label: 'Key Concepts',
        },
        {
          href: '/?domain=api&page=operations/start-agent',
          label: 'Create Agent API',
        },
        {
          href: '/?domain=recepies&page=user-guides/audio-modality',
          label: 'Voice & Multimodal Patterns',
        },
      ];

  return (
    <div className="space-y-10">
      <section
        className="grid gap-6 rounded-[1.6rem] border border-border/70 bg-[linear-gradient(180deg,rgba(248,251,250,0.98),rgba(241,247,245,0.95))] p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.25)] lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.95fr)]"
        id="overview"
      >
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-primary">
            <LayoutGrid className="size-4" />
            {isZh ? '首页总览' : 'Portal Overview'}
          </p>
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-foreground sm:text-[1.5rem]">
            {isZh
              ? '围绕声网对话式 AI 引擎建立更清晰的接入地图'
              : 'A clearer entry map for Agora Conversational AI Engine'}
          </h2>
          <p className="text-[0.98rem] leading-8 text-muted-foreground">
            {isZh
              ? '这里不只是原始文档列表，而是把开通服务、快速开始、服务端 SDK、模型扩展、语音交互和关键接口整理成一条更接近真实接入路径的首页。'
              : 'This homepage is not only a document list. It reshapes enablement, quickstarts, server SDKs, model extensions, voice interaction, and key APIs into an integration-first landing experience.'}
          </p>
        </div>

        <div className="grid gap-3 rounded-[1.4rem] border border-border/65 bg-background/72 p-4">
          {highlightCards.map((card) => (
            <div
              className="rounded-2xl border border-border/65 bg-card/70 p-4"
              key={card.title}
            >
              <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                {card.icon}
              </div>
              <h3 className="text-[0.98rem] font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="quickstart">
        <div className="mb-4 flex items-center gap-2">
          <Blocks className="size-4.5 text-primary" />
          <h2 className="text-[1.15rem] font-semibold text-foreground">
            {isZh ? '快速入门路径' : 'Quickstart Paths'}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickstartCards.map((card) => (
            <a
              className="group rounded-[1.35rem] border border-border/70 bg-card/72 p-5 transition-colors hover:bg-accent/35"
              href={card.href}
              key={card.title}
            >
              <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                {card.icon}
              </div>
              <h3 className="text-[1rem] font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {card.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {isZh ? '继续阅读' : 'Read next'}
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section
        className="grid gap-4 rounded-[1.45rem] border border-border/70 bg-background/72 p-5"
        id="key-links"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="size-4.5 text-primary" />
          <h2 className="text-[1.15rem] font-semibold text-foreground">
            {isZh ? '关键页面' : 'Key Pages'}
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {keyLinks.map((link) => (
            <a
              className="inline-flex items-center justify-between rounded-2xl border border-border/65 bg-card/70 px-4 py-3 text-[0.96rem] text-foreground transition-colors hover:bg-accent/35"
              href={link.href}
              key={link.label}
            >
              <span>{link.label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
