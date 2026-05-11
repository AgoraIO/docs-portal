import {
  AppWindow,
  AudioLines,
  BadgeInfo,
  Bot,
  BrainCircuit,
  Braces,
  ChevronRight,
  Coins,
  Database,
  FileCode2,
  Gauge,
  History,
  KeyRound,
  ListChecks,
  MapPinned,
  MessageSquareText,
  MicVocal,
  PackageOpen,
  PhoneCall,
  PlugZap,
  RadioTower,
  Rocket,
  ScrollText,
  Sparkles,
  SquareTerminal,
  WandSparkles,
  Webhook,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { localizePortalText } from '@/lib/convoai-portal-localization';
import { useLocale } from '@/lib/i18n/use-locale';
import type { PortalDoc, PortalTab } from '@/lib/convoai-portal.server';

type SidebarItemBlueprint = {
  children?: SidebarItemBlueprint[];
  icon: LucideIcon;
  label?: string;
  pageKey?: string;
};

type SidebarSectionBlueprint = {
  items: SidebarItemBlueprint[];
  title: string;
};

type SidebarItem = {
  children: SidebarItem[];
  href?: string;
  icon: LucideIcon;
  pageKey?: string;
  title: string;
};

const sidebarBlueprints: Record<string, SidebarSectionBlueprint[]> = {
  api: [
    {
      items: [
        { icon: Rocket, pageKey: 'operations/start-agent' },
        { icon: SquareTerminal, pageKey: 'operations/stop-agent' },
        { icon: WandSparkles, pageKey: 'operations/agent-update' },
        { icon: Gauge, pageKey: 'operations/query-agent-status' },
        { icon: ListChecks, pageKey: 'operations/get-agent-list' },
      ],
      title: '生命周期',
    },
    {
      items: [
        { icon: MicVocal, pageKey: 'operations/agent-speak' },
        { icon: AudioLines, pageKey: 'operations/agent-interrupt' },
        { icon: BrainCircuit, pageKey: 'operations/agent-think' },
      ],
      title: '对话控制',
    },
    {
      items: [
        { icon: History, pageKey: 'operations/get-history' },
        { icon: ScrollText, pageKey: 'operations/get-turns' },
        { icon: FileCode2, pageKey: 'api/response-code' },
        { icon: SquareTerminal, pageKey: 'api/api-limits' },
        { icon: AudioLines, pageKey: 'api/voice-ids' },
      ],
      title: '历史与观测',
    },
    {
      items: [
        { icon: RadioTower, pageKey: 'webhook/enable-ncs' },
        { icon: Webhook, pageKey: 'webhook/ncs-events' },
      ],
      title: 'Webhook',
    },
  ],
  docs: [
    {
      items: [
        { icon: BadgeInfo, pageKey: 'landing-page' },
        {
          children: [
            { icon: Sparkles, pageKey: 'get-started/enable-service' },
            { icon: PhoneCall, pageKey: 'get-started/quick-start' },
            {
              icon: Braces,
              label: 'Go 服务端快速开始',
              pageKey: 'get-started/quick-start-go',
            },
            {
              icon: AppWindow,
              label: 'Java 服务端快速开始',
              pageKey: 'get-started/quick-start-java',
            },
          ],
          icon: Rocket,
          label: '快速接入',
        },
      ],
      title: '开始使用',
    },
    {
      items: [
        { icon: PackageOpen, pageKey: 'overview/product-overview' },
        { icon: BrainCircuit, pageKey: 'overview/concepts' },
        { icon: Coins, pageKey: 'overview/billing' },
        { icon: History, pageKey: 'overview/release-notes' },
      ],
      title: '产品与概念',
    },
    {
      items: [
        { icon: KeyRound, pageKey: 'user-guides/http-basic-auth' },
        {
          children: [
            { icon: BrainCircuit, pageKey: 'user-guides/custom-llm' },
            { icon: Database, pageKey: 'user-guides/custom-data' },
            { icon: Sparkles, pageKey: 'user-guides/short-term-memory' },
          ],
          icon: Bot,
          label: '模型与上下文',
        },
        {
          children: [
            { icon: AudioLines, pageKey: 'user-guides/audio-modality' },
            { icon: MessageSquareText, pageKey: 'user-guides/realtime-sub' },
            { icon: MessageSquareText, pageKey: 'user-guides/send-multimodal-message' },
            { icon: MicVocal, pageKey: 'user-guides/interrupt-agent' },
            { icon: RadioTower, pageKey: 'user-guides/listen-agent-events' },
          ],
          icon: WandSparkles,
          label: '语音与交互',
        },
      ],
      title: '智能体能力',
    },
    {
      items: [
        { icon: AudioLines, pageKey: 'best-practice/audio-settings' },
        { icon: Gauge, pageKey: 'best-practice/opt-latency' },
        { icon: MapPinned, pageKey: 'best-practice/geofencing' },
      ],
      title: '最佳实践',
    },
  ],
  recepies: [
    {
      items: [
        { icon: MessageSquareText, pageKey: 'user-guides/realtime-sub' },
        { icon: AudioLines, pageKey: 'user-guides/audio-modality' },
        { icon: MessageSquareText, pageKey: 'user-guides/send-multimodal-message' },
      ],
      title: '体验设计',
    },
    {
      items: [
        { icon: Sparkles, pageKey: 'user-guides/short-term-memory' },
        { icon: MicVocal, pageKey: 'user-guides/interrupt-agent' },
        { icon: RadioTower, pageKey: 'user-guides/listen-agent-events' },
        { icon: Database, pageKey: 'user-guides/custom-data' },
      ],
      title: '智能体控制',
    },
  ],
  reference: [
    {
      items: [{ icon: ScrollText, pageKey: 'resources' }],
      title: '资源与参考',
    },
  ],
  sdks: [
    {
      items: [
        { icon: Sparkles, pageKey: 'get-started/enable-service' },
        { icon: PhoneCall, pageKey: 'get-started/quick-start' },
        {
          icon: Braces,
          label: 'Go 服务端快速开始',
          pageKey: 'get-started/quick-start-go',
        },
        {
          icon: AppWindow,
          label: 'Java 服务端快速开始',
          pageKey: 'get-started/quick-start-java',
        },
      ],
      title: '快速接入',
    },
    {
      items: [
        { icon: KeyRound, pageKey: 'user-guides/http-basic-auth' },
        { icon: Rocket, pageKey: 'operations/start-agent' },
      ],
      title: '建议补充阅读',
    },
  ],
  skillmcp: [
    {
      items: [
        { icon: Sparkles, pageKey: 'skills-integrate' },
        { icon: PlugZap, pageKey: 'mcp-integrate' },
        { icon: ScrollText, pageKey: 'resources' },
      ],
      title: 'Agent 接入',
    },
    {
      items: [
        { icon: BadgeInfo, pageKey: 'landing-page' },
        { icon: PackageOpen, pageKey: 'overview/product-overview' },
        { icon: PhoneCall, pageKey: 'get-started/quick-start' },
      ],
      title: '建议搭配阅读',
    },
  ],
};

export function PortalSidebar({
  activeDoc,
  activeTab,
  homeTab,
}: {
  activeDoc: PortalDoc;
  activeTab: PortalTab;
  homeTab?: string;
}) {
  const { locale } = useLocale();
  const sections = buildSidebarSections(activeTab, homeTab);

  return (
    <aside className="hidden border-r border-border/75 px-6 py-8 lg:block xl:px-8 xl:py-10">
      <div className="sticky top-[8.2rem] max-h-[calc(100vh-9rem)] space-y-7 overflow-y-auto pr-2">
        <nav aria-label={`${activeTab.label} sidebar`} className="space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <p className="mb-3 text-[0.8rem] font-semibold tracking-[0.01em] text-foreground/88">
                {localizePortalText(locale, section.title)}
              </p>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <SidebarTreeItem
                    activePageKey={activeDoc.pageKey}
                    item={item}
                    key={`${section.title}-${item.title}`}
                    level={0}
                    locale={locale}
                  />
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function SidebarTreeItem({
  activePageKey,
  item,
  level,
  locale,
}: {
  activePageKey: string;
  item: SidebarItem;
  level: number;
  locale: 'en' | 'zh-CN';
}) {
  const isDirectActive = item.pageKey === activePageKey;
  const hasActiveDescendant = item.children.some((child) =>
    containsActivePage(child, activePageKey),
  );
  const defaultExpanded = isDirectActive || hasActiveDescendant || level === 0;
  const [isExpanded, setExpanded] = useState(defaultExpanded);
  const ItemIcon = item.icon;
  const isGroup = item.children.length > 0;
  const labelClassName = cn(
    'min-w-0 flex-1 text-[0.97rem] leading-6 font-normal text-muted-foreground',
  );

  if (!item.href) {
    return (
      <li>
        <button
          aria-expanded={isExpanded}
          aria-label={`切换${item.title}`}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-accent/45',
            level > 0
              ? 'rounded-xl px-3 py-2 text-muted-foreground'
              : 'text-foreground',
            hasActiveDescendant && 'bg-accent/45',
          )}
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          <ItemIcon className="size-[1.05rem] shrink-0 text-foreground/52" />
          <span className={labelClassName}>
            {localizePortalText(locale, item.title)}
          </span>
          {isGroup ? (
            <ChevronRight
              className={cn(
                'size-4 shrink-0 text-foreground/40 transition-transform',
                isExpanded && 'rotate-90',
              )}
            />
          ) : null}
        </button>

        {isGroup && isExpanded ? (
          <ul className="mt-2 ml-5 space-y-1 border-l border-border/70 pl-3.5">
            {item.children.map((child) => (
              <SidebarTreeItem
                activePageKey={activePageKey}
                item={child}
                key={`${item.title}-${child.title}`}
                level={level + 1}
                locale={locale}
              />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <li>
      <div
        className={cn(
          'group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors',
          level > 0 && 'rounded-xl px-3 py-2',
          isDirectActive
            ? 'bg-primary/12 text-foreground shadow-[inset_0_0_0_1px_rgba(16,185,129,0.14)]'
            : hasActiveDescendant
              ? 'bg-accent/55 text-foreground'
              : 'text-muted-foreground hover:bg-accent/55 hover:text-foreground',
        )}
      >
        <a
          className="flex min-w-0 flex-1 items-center gap-3"
          href={item.href}
        >
          <ItemIcon
            className={cn(
              'size-[1.05rem] shrink-0',
              isDirectActive
                ? 'text-primary'
                : level > 0
                  ? 'text-muted-foreground'
                  : 'text-foreground/52',
            )}
          />
          <span className={labelClassName}>
            {localizePortalText(locale, item.title)}
          </span>
        </a>
        {isGroup ? (
          <button
            aria-expanded={isExpanded}
            aria-label={`切换${item.title}`}
            className="rounded-md p-1 text-foreground/40 transition-colors hover:bg-accent/60 hover:text-foreground"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            <ChevronRight
              className={cn(
                'size-4 shrink-0 transition-transform',
                isExpanded && 'rotate-90',
              )}
            />
          </button>
        ) : null}
      </div>

      {isGroup && isExpanded ? (
        <ul className="mt-2 ml-5 space-y-1 border-l border-border/70 pl-3.5">
          {item.children.map((child) => (
            <SidebarTreeItem
              activePageKey={activePageKey}
              item={child}
              key={`${item.title}-${child.title}`}
              level={level + 1}
              locale={locale}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function buildSidebarSections(activeTab: PortalTab, homeTab?: string) {
  const docsByPageKey = new Map(activeTab.docs.map((doc) => [doc.pageKey, doc]));
  const blueprint = sidebarBlueprints[activeTab.key] ?? sidebarBlueprints.docs;

  return blueprint
    .map((section) => ({
      items: section.items
        .map((item) =>
          resolveSidebarItem(item, activeTab.key, docsByPageKey, homeTab),
        )
        .filter((item): item is SidebarItem => item !== null),
      title: section.title,
    }))
    .filter((section) => section.items.length > 0);
}

function resolveSidebarItem(
  item: SidebarItemBlueprint,
  tabKey: string,
  docsByPageKey: Map<string, PortalDoc>,
  homeTab?: string,
): null | SidebarItem {
  const doc = item.pageKey ? docsByPageKey.get(item.pageKey) : undefined;
  const children =
    item.children
      ?.map((child) =>
        resolveSidebarItem(child, tabKey, docsByPageKey, homeTab),
      )
      .filter((child): child is SidebarItem => child !== null) ?? [];

  if (!doc && !item.label && children.length === 0) {
    return null;
  }

  return {
    children,
    href: doc
      ? `/?domain=${tabKey}&page=${doc.pageKey}${homeTab ? `&tab=${homeTab}` : ''}`
      : undefined,
    icon: item.icon,
    pageKey: doc?.pageKey,
    title: item.label ?? doc?.title ?? '',
  };
}

function containsActivePage(item: SidebarItem, activePageKey: string): boolean {
  if (item.pageKey === activePageKey) {
    return true;
  }

  return item.children.some((child) => containsActivePage(child, activePageKey));
}
