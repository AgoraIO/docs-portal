import {
  ActivityIcon,
  AppWindowIcon,
  ArrowDownToLineIcon,
  ArrowRightIcon,
  ArrowUpFromLineIcon,
  ArrowUpRightIcon,
  AudioLinesIcon,
  BarChart3Icon,
  BlocksIcon,
  BotIcon,
  CaptionsIcon,
  CloudIcon,
  Code2Icon,
  CpuIcon,
  CuboidIcon,
  FilmIcon,
  GraduationCapIcon,
  HardDriveIcon,
  MessagesSquareIcon,
  MonitorSmartphoneIcon,
  NetworkIcon,
  PhoneIcon,
  PresentationIcon,
  RadioIcon,
  RadioTowerIcon,
  ServerCogIcon,
  SmartphoneChargingIcon,
  TerminalSquareIcon,
  TicketIcon,
  TvIcon,
  VideoIcon,
  ZapIcon,
} from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import {
  lazy,
  type ReactNode,
  useDeferredValue,
  useMemo,
  useState,
} from 'react';
import { cn } from '@/lib/cn';

const SdksCatalog = lazy(() =>
  import('./SdksCatalog').then((module) => ({
    default: module.SdksCatalog,
  })),
);

const FaqCatalog = lazy(() =>
  import('../faq/FaqCatalog').then((module) => ({
    default: module.FaqCatalog,
  })),
);

export function getOverviewMDXComponents(): MDXComponents {
  return {
    CardGrid,
    FeatureCard,
    FaqCatalog,
    CapabilityGroupCard,
    CapabilityGroupGrid,
    CapabilityMatrix,
    HelpHub,
    OverviewImageCard,
    OverviewImageCardGrid,
    OverviewLinkBanner,
    OverviewSpotlightCard,
    OverviewSpotlightGrid,
    OverviewToolkits,
    RecipesCatalog,
    SdksCatalog,
    SolutionCard,
    SolutionCardGrid,
    ToolkitGroup,
    ToolkitItem,
  } satisfies MDXComponents;
}

function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">{children}</div>
  );
}

function FeatureCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function CapabilityGroupGrid({ children }: { children: ReactNode }) {
  return (
    <section className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      {children}
    </section>
  );
}

function CapabilityGroupCard({
  description,
  items,
  title,
}: {
  description: string;
  items: string[];
  title: string;
}) {
  return (
    <section className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
      <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

type HelpHubCard = {
  cta: string;
  description: string;
  href: string;
  icon: 'discord' | 'stack-overflow' | 'status' | 'ticket';
  title: string;
};

type HelpHubLink = {
  href: string;
  label: string;
};

function HelpHub({
  cards,
  knowledgeBase,
  topics,
}: {
  cards: HelpHubCard[];
  knowledgeBase: HelpHubLink[];
  topics: HelpHubLink[];
}) {
  return (
    <section className="not-prose my-8 space-y-5">
      <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="max-w-2xl">
          <p className="text-sm leading-6 text-muted-foreground">
            Choose the fastest path for product questions, service health, and
            community support.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <a
              className="group flex min-h-[11.5rem] flex-col rounded-[22px] border border-border bg-background px-4 py-4 transition-colors hover:border-primary/35 hover:bg-accent/35"
              href={card.href}
              key={card.title}
              rel={
                isExternalHref(card.href) ? 'noreferrer noopener' : undefined
              }
              target={isExternalHref(card.href) ? '_blank' : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
                  <HelpHubIcon kind={card.icon} />
                </span>
                <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <h4 className="mt-4 text-base font-semibold tracking-[-0.02em] text-foreground">
                {card.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {card.description}
              </p>
              <span className="mt-auto pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                {card.cta}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]">
        <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Popular Knowledge Base
            </h4>
            <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              Quick answers
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {knowledgeBase.map((item) => (
              <li key={item.label}>
                <a
                  className="group flex items-center justify-between gap-4 rounded-[16px] px-3 py-3 text-sm text-foreground transition-colors hover:bg-accent/45 hover:text-primary"
                  href={item.href}
                  rel={
                    isExternalHref(item.href)
                      ? 'noreferrer noopener'
                      : undefined
                  }
                  target={isExternalHref(item.href) ? '_blank' : undefined}
                >
                  <span className="leading-6">{item.label}</span>
                  <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:text-foreground group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Browse By Topic
          </h4>
          <div className="mt-4 space-y-2">
            {topics.map((item) => (
              <a
                className="group flex items-center justify-between gap-4 rounded-[16px] border border-border bg-background px-4 py-3.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent/35 hover:text-primary"
                href={item.href}
                key={item.label}
                rel={
                  isExternalHref(item.href) ? 'noreferrer noopener' : undefined
                }
                target={isExternalHref(item.href) ? '_blank' : undefined}
              >
                <span>{item.label}</span>
                <ArrowRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function HelpHubIcon({ kind }: { kind: HelpHubCard['icon'] }) {
  if (kind === 'ticket') {
    return <TicketIcon className="size-4" />;
  }

  if (kind === 'stack-overflow') {
    return <Code2Icon className="size-4" />;
  }

  if (kind === 'discord') {
    return <MessagesSquareIcon className="size-4" />;
  }

  return <ActivityIcon className="size-4" />;
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

type CapabilityMatrixRow = {
  description: string;
  items: string[];
  title: string;
};

function CapabilityMatrix({ rows }: { rows: CapabilityMatrixRow[] }) {
  return (
    <section className="not-prose my-8 overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
      <div className="grid grid-cols-1 border-b border-border bg-muted/30 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:grid-cols-[220px_minmax(0,1fr)_260px] sm:gap-6 sm:px-6">
        <span>Capability area</span>
        <span>What it covers</span>
        <span>Includes</span>
      </div>
      {rows.map((row, index) => (
        <div
          className={cn(
            'grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[220px_minmax(0,1fr)_260px] sm:items-start sm:gap-6 sm:px-6',
            index > 0 && 'border-t border-border',
          )}
          key={row.title}
        >
          <h3 className="m-0 text-base font-semibold text-foreground">
            {row.title}
          </h3>
          <p className="m-0 text-sm leading-6 text-muted-foreground">
            {row.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {row.items.map((item) => (
              <span
                className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function OverviewImageCardGrid({
  children,
  columns = 'three',
}: {
  children: ReactNode;
  columns?: 'three' | 'two';
}) {
  return (
    <section
      className={cn(
        'not-prose my-8 grid gap-4',
        columns === 'two'
          ? 'md:grid-cols-2 xl:grid-cols-2'
          : 'md:grid-cols-2 xl:grid-cols-3',
      )}
    >
      {children}
    </section>
  );
}

function OverviewImageCard({
  compact = false,
  description,
  href,
  imageAlt,
  imageSrc,
  title,
}: {
  compact?: boolean;
  description: string;
  href?: string;
  imageAlt: string;
  imageSrc: string;
  title: string;
}) {
  const content = (
    <>
      <div
        className={cn(
          'overflow-hidden border-b border-border bg-muted/40',
          compact ? 'aspect-[16/8]' : 'aspect-[16/10]',
        )}
      >
        <img
          alt={imageAlt}
          className={cn(
            'size-full object-cover',
            href &&
              'transition-transform duration-300 group-hover:scale-[1.02]',
          )}
          loading="lazy"
          src={imageSrc}
        />
      </div>
      <div className={cn(compact ? 'p-4' : 'p-5')}>
        <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
        <p
          className={cn(
            'mt-2 text-sm text-muted-foreground',
            compact ? 'leading-5' : 'leading-6',
          )}
        >
          {description}
        </p>
      </div>
    </>
  );

  if (!href) {
    return (
      <section className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
        {content}
      </section>
    );
  }

  return (
    <a
      className="group overflow-hidden rounded-[24px] border border-border bg-card shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35"
      href={href}
    >
      {content}
    </a>
  );
}

function OverviewLinkBanner({
  description,
  href,
  title,
}: {
  description: string;
  href: string;
  title: string;
}) {
  return (
    <a
      className="group not-prose my-6 flex items-center justify-between gap-4 rounded-[24px] border border-border bg-card px-6 py-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35"
      href={href}
    >
      <div className="min-w-0">
        <h3 className="m-0 text-lg font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <ArrowRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </a>
  );
}

function OverviewToolkits({ children }: { children: ReactNode }) {
  return (
    <section className="not-prose my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </section>
  );
}

function ToolkitGroup({
  title,
  children,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="m-0 text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

type ToolkitIconKind =
  | 'android'
  | 'cli'
  | 'go'
  | 'ios'
  | 'mcp'
  | 'messaging'
  | 'python'
  | 'rest'
  | 'rtc'
  | 'server'
  | 'skills'
  | 'stt'
  | 'studio'
  | 'typescript'
  | 'web';

function ToolkitItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ToolkitIconKind;
  label: string;
}) {
  return (
    <a
      className="group flex min-h-10 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      href={href}
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground transition-colors group-hover:bg-background">
        <ToolkitIcon kind={icon} />
      </span>
      <span>{label}</span>
    </a>
  );
}

function ToolkitIcon({ kind }: { kind: ToolkitIconKind }) {
  if (kind === 'python') {
    return <BotIcon className="size-4" />;
  }

  if (kind === 'typescript' || kind === 'rest' || kind === 'go') {
    return <Code2Icon className="size-4" />;
  }

  if (kind === 'cli') {
    return <TerminalSquareIcon className="size-4" />;
  }

  if (kind === 'studio' || kind === 'web') {
    return <AppWindowIcon className="size-4" />;
  }

  if (kind === 'mcp') {
    return <CuboidIcon className="size-4" />;
  }

  if (kind === 'skills' || kind === 'messaging') {
    return <BlocksIcon className="size-4" />;
  }

  if (kind === 'android') {
    return <SmartphoneChargingIcon className="size-4" />;
  }

  if (kind === 'ios') {
    return <MonitorSmartphoneIcon className="size-4" />;
  }

  if (kind === 'rtc') {
    return <AudioLinesIcon className="size-4" />;
  }

  if (kind === 'stt') {
    return <ZapIcon className="size-4" />;
  }

  if (kind === 'server') {
    return <ServerCogIcon className="size-4" />;
  }

  return <Code2Icon className="size-4" />;
}

function SolutionCardGrid({
  children,
  size = 'large',
}: {
  children: ReactNode;
  size?: 'large' | 'small';
}) {
  return (
    <section
      className={cn(
        'not-prose my-8 grid gap-4',
        size === 'small'
          ? 'grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))]'
          : 'grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]',
      )}
    >
      {children}
    </section>
  );
}

type SolutionCardIconKind =
  | 'ai'
  | 'analytics'
  | 'broadcast'
  | 'chat'
  | 'classroom'
  | 'cloud-recording'
  | 'device'
  | 'iot'
  | 'live-streaming'
  | 'media-pull'
  | 'media-push'
  | 'meeting'
  | 'messaging'
  | 'on-premise-recording'
  | 'rtc'
  | 'rtmp-gateway'
  | 'server-sdk'
  | 'signaling'
  | 'tools'
  | 'transcoding'
  | 'transcription'
  | 'video-calling'
  | 'voice-calling'
  | 'whiteboard';

type SolutionCardTone = 'blue' | 'green' | 'pink' | 'purple' | 'sand';

export type RecipeCatalogItemLink = {
  href: string;
  label: string;
};

export type RecipeCatalogGroupMeta = {
  description?: string;
  icon?: SolutionCardIconKind;
  title?: string;
};

export type RecipeCatalogItem = {
  category: string;
  description: string;
  href?: string;
  links?: RecipeCatalogItemLink[];
  product: string;
  stack?: string;
  tags?: string[];
  title: string;
  tone?: SolutionCardTone;
};

function SolutionCard({
  actions = [],
  description,
  href,
  icon,
  size = 'large',
  showDescription = true,
  tags = [],
  title,
  tone = 'blue',
}: {
  actions?: RecipeCatalogItemLink[];
  description: string;
  href?: string;
  icon?: SolutionCardIconKind;
  size?: 'large' | 'small';
  showDescription?: boolean;
  tags?: string[];
  title: string;
  tone?: SolutionCardTone;
}) {
  const cardClasses = cn(
    'group flex min-h-40 flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35',
    size === 'small' && 'min-h-32 p-4',
  );

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        {icon ? (
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-lg',
              getSolutionToneClasses(tone),
              size === 'small' && 'size-9',
            )}
          >
            <SolutionCardIcon kind={icon} />
          </span>
        ) : (
          <span />
        )}
        {href ? (
          <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        ) : null}
      </div>
      <div className="mt-4 flex-1">
        <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
        {showDescription && description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => (
            <a
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              href={action.href}
              key={action.href}
              rel={
                action.href.startsWith('http')
                  ? 'noreferrer noopener'
                  : undefined
              }
              target={action.href.startsWith('http') ? '_blank' : undefined}
            >
              <span>{action.label}</span>
              <ArrowRightIcon className="size-3.5" />
            </a>
          ))}
        </div>
      ) : null}
      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );

  if (!href || actions.length > 0) {
    return <section className={cardClasses}>{content}</section>;
  }

  return (
    <a className={cardClasses} href={href}>
      {content}
    </a>
  );
}

export function RecipesCatalog({
  allCategoriesLabel,
  allProductsLabel,
  allStacksLabel,
  categoryFilterLabel,
  clearFiltersLabel,
  emptyMessage,
  groupByProduct = false,
  items,
  productGroups,
  productFilterLabel,
  searchPlaceholder,
  showCategoryFilter = true,
  showDescription = true,
  showTags = true,
  stackFilterLabel,
  stackQueryParam,
}: {
  allCategoriesLabel: string;
  allProductsLabel: string;
  allStacksLabel: string;
  categoryFilterLabel: string;
  clearFiltersLabel: string;
  emptyMessage: string;
  groupByProduct?: boolean;
  items: RecipeCatalogItem[];
  productGroups?: Record<string, RecipeCatalogGroupMeta>;
  productFilterLabel: string;
  searchPlaceholder: string;
  showCategoryFilter?: boolean;
  showDescription?: boolean;
  showTags?: boolean;
  stackFilterLabel: string;
  stackQueryParam?: string;
}) {
  const [query, setQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState(allProductsLabel);
  const [activeCategory, setActiveCategory] = useState(allCategoriesLabel);
  const initialStack = useMemo(
    () => getInitialRecipeStack(items, allStacksLabel, stackQueryParam),
    [allStacksLabel, items, stackQueryParam],
  );
  const [activeStack, setActiveStack] = useState(initialStack);
  const deferredQuery = useDeferredValue(query);

  const products = useMemo(
    () => [
      allProductsLabel,
      ...getUniqueValues(items.map((item) => item.product)),
    ],
    [allProductsLabel, items],
  );
  const categories = useMemo(
    () => [
      allCategoriesLabel,
      ...getUniqueValues(items.map((item) => item.category)),
    ],
    [allCategoriesLabel, items],
  );
  const stacks = useMemo(
    () => [
      allStacksLabel,
      ...getUniqueValues(items.map((item) => item.stack).filter(Boolean)),
    ],
    [allStacksLabel, items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeRecipeFilterValue(deferredQuery);

    return items.filter((item) => {
      if (
        activeProduct !== allProductsLabel &&
        item.product !== activeProduct
      ) {
        return false;
      }

      if (
        activeCategory !== allCategoriesLabel &&
        item.category !== activeCategory
      ) {
        return false;
      }

      if (
        activeStack !== allStacksLabel &&
        (item.stack ?? '') !== activeStack
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeRecipeFilterValue(
        [
          item.title,
          item.description,
          item.product,
          item.category,
          item.stack,
          ...(item.tags ?? []),
          ...(item.links?.map((link) => link.label) ?? []),
        ]
          .filter(Boolean)
          .join(' '),
      );

      return haystack.includes(normalizedQuery);
    });
  }, [
    activeCategory,
    activeProduct,
    activeStack,
    allCategoriesLabel,
    allProductsLabel,
    allStacksLabel,
    deferredQuery,
    items,
  ]);
  const hasActiveFilters =
    query.length > 0 ||
    activeProduct !== allProductsLabel ||
    activeCategory !== allCategoriesLabel ||
    activeStack !== allStacksLabel;
  const groupedItems = useMemo(() => {
    const groups = new Map<string, RecipeCatalogItem[]>();

    for (const item of filteredItems) {
      const entries = groups.get(item.product);

      if (entries) {
        entries.push(item);
      } else {
        groups.set(item.product, [item]);
      }
    }

    return [...groups.entries()].map(([product, items]) => ({
      items,
      product,
    }));
  }, [filteredItems]);

  return (
    <section className="not-prose my-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={query}
          />
        </label>
        {hasActiveFilters ? (
          <button
            className="h-10 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setQuery('');
              setActiveProduct(allProductsLabel);
              setActiveCategory(allCategoriesLabel);
              setActiveStack(allStacksLabel);
            }}
            type="button"
          >
            {clearFiltersLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-5 grid gap-4">
        <RecipesCatalogFilterGroup
          activeValue={activeProduct}
          label={productFilterLabel}
          onSelect={setActiveProduct}
          values={products}
        />
        {showCategoryFilter ? (
          <RecipesCatalogFilterGroup
            activeValue={activeCategory}
            label={categoryFilterLabel}
            onSelect={setActiveCategory}
            values={categories}
          />
        ) : null}
        <RecipesCatalogFilterGroup
          activeValue={activeStack}
          label={stackFilterLabel}
          onSelect={setActiveStack}
          values={stacks}
        />
      </div>
      {filteredItems.length > 0 ? (
        groupByProduct ? (
          <div className="mt-8 space-y-8">
            {groupedItems.map((group) => (
              <section className="space-y-4" key={group.product}>
                <div className="flex items-start gap-3">
                  {(() => {
                    const productGroup = productGroups?.[group.product];

                    return productGroup?.icon ? (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                        <SolutionCardIcon kind={productGroup.icon} />
                      </span>
                    ) : null;
                  })()}
                  <div className="min-w-0">
                    <h3 className="m-0 text-lg font-semibold text-foreground">
                      {productGroups?.[group.product]?.title ?? group.product}
                    </h3>
                    {productGroups?.[group.product]?.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {productGroups[group.product].description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <SolutionCard
                      actions={item.links}
                      description={item.description}
                      href={item.href}
                      key={
                        item.href ??
                        `${item.product}-${item.stack ?? item.title}`
                      }
                      size="small"
                      showDescription={showDescription}
                      tags={
                        showTags
                          ? [
                              item.product,
                              item.category,
                              ...(item.stack ? [item.stack] : []),
                              ...(item.tags ?? []),
                              ...(item.links?.map((link) => link.label) ?? []),
                            ]
                          : []
                      }
                      title={item.title}
                      tone={item.tone ?? 'blue'}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <SolutionCardGrid size="small">
            {filteredItems.map((item) => (
              <SolutionCard
                actions={item.links}
                description={item.description}
                href={item.href}
                key={item.href ?? `${item.product}-${item.stack ?? item.title}`}
                size="small"
                showDescription={showDescription}
                tags={
                  showTags
                    ? [
                        item.product,
                        item.category,
                        ...(item.stack ? [item.stack] : []),
                        ...(item.tags ?? []),
                        ...(item.links?.map((link) => link.label) ?? []),
                      ]
                    : []
                }
                title={item.title}
                tone={item.tone ?? 'blue'}
              />
            ))}
          </SolutionCardGrid>
        )
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

function RecipesCatalogFilterGroup({
  activeValue,
  label,
  onSelect,
  values,
}: {
  activeValue: string;
  label: string;
  onSelect: (value: string) => void;
  values: string[];
}) {
  return (
    <fieldset className="m-0 grid min-w-0 border-0 p-0">
      <legend className="mb-2 p-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            aria-pressed={value === activeValue}
            className={cn(
              'rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
              value === activeValue
                ? 'border-primary/30 bg-primary/10 text-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            key={value}
            onClick={() => onSelect(value)}
            type="button"
          >
            {value}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function getUniqueValues(values: Array<string | undefined>) {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

function getInitialRecipeStack(
  items: RecipeCatalogItem[],
  fallback: string,
  queryParam?: string,
) {
  if (typeof window === 'undefined' || !queryParam) {
    return fallback;
  }

  const queryValue = new URLSearchParams(window.location.search).get(
    queryParam,
  );

  if (!queryValue) {
    return fallback;
  }

  const normalizedQueryValue = normalizeRecipeFilterValue(
    queryValue.replace(/-/g, ' '),
  );
  const matchingStack = getUniqueValues(
    items.map((item) => item.stack).filter(Boolean),
  ).find((stack) => {
    const normalizedStack = normalizeRecipeFilterValue(stack);

    return (
      normalizedStack === normalizedQueryValue ||
      normalizedStack.replace(/\s+/g, '-') ===
        normalizeRecipeFilterValue(queryValue)
    );
  });

  return matchingStack ?? fallback;
}

function normalizeRecipeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

function getSolutionToneClasses(_tone: SolutionCardTone) {
  // Icon chips use a single theme-driven neutral surface so cards stay visually
  // consistent across the overview pages. Only the icon glyph varies by product.
  return 'bg-muted text-foreground';
}

function SolutionCardIcon({ kind }: { kind: SolutionCardIconKind }) {
  const iconMap: Record<SolutionCardIconKind, ReactNode> = {
    ai: <BotIcon className="size-5" />,
    analytics: <BarChart3Icon className="size-5" />,
    broadcast: <TvIcon className="size-5" />,
    chat: <MessagesSquareIcon className="size-5" />,
    classroom: <GraduationCapIcon className="size-5" />,
    'cloud-recording': <CloudIcon className="size-5" />,
    device: <CuboidIcon className="size-5" />,
    iot: <CpuIcon className="size-5" />,
    'live-streaming': <RadioIcon className="size-5" />,
    'media-pull': <ArrowDownToLineIcon className="size-5" />,
    'media-push': <ArrowUpFromLineIcon className="size-5" />,
    meeting: <AppWindowIcon className="size-5" />,
    messaging: <BlocksIcon className="size-5" />,
    'on-premise-recording': <HardDriveIcon className="size-5" />,
    rtc: <AudioLinesIcon className="size-5" />,
    'rtmp-gateway': <RadioTowerIcon className="size-5" />,
    'server-sdk': <ServerCogIcon className="size-5" />,
    signaling: <NetworkIcon className="size-5" />,
    tools: <TerminalSquareIcon className="size-5" />,
    transcoding: <FilmIcon className="size-5" />,
    transcription: <CaptionsIcon className="size-5" />,
    'video-calling': <VideoIcon className="size-5" />,
    'voice-calling': <PhoneIcon className="size-5" />,
    whiteboard: <PresentationIcon className="size-5" />,
  };

  return iconMap[kind] ?? <AudioLinesIcon className="size-5" />;
}

type OverviewSpotlightSize = 'large' | 'small';

function OverviewSpotlightGrid({
  children,
  size = 'large',
}: {
  children: ReactNode;
  size?: OverviewSpotlightSize;
}) {
  return (
    <section
      className={cn(
        'not-prose my-8 grid gap-4',
        size === 'small' ? 'sm:grid-cols-3' : 'md:grid-cols-3',
      )}
    >
      {children}
    </section>
  );
}

type OverviewSpotlightVariant = 'checklist' | 'code' | 'platform';

function OverviewSpotlightCard({
  description,
  href,
  size = 'large',
  title,
  variant = 'platform',
}: {
  description?: string;
  href: string;
  size?: OverviewSpotlightSize;
  title: string;
  variant?: OverviewSpotlightVariant;
}) {
  return (
    <a
      className={cn(
        'group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35',
        size === 'small' && 'text-sm',
      )}
      href={href}
    >
      <div
        aria-hidden="true"
        className={cn(
          'border-b border-border bg-muted/45 p-4',
          size === 'small' && 'p-3',
        )}
      >
        <div className="mb-3 flex gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/35" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="size-2 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="min-h-24">
          {variant === 'platform' ? <OverviewSpotlightPlatformVisual /> : null}
          {variant === 'code' ? <OverviewSpotlightCodeVisual /> : null}
          {variant === 'checklist' ? (
            <OverviewSpotlightChecklistVisual />
          ) : null}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="m-0 text-base font-semibold text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </a>
  );
}

function OverviewSpotlightPlatformVisual() {
  return (
    <div className="grid gap-2">
      <div className="h-8 rounded-md bg-background shadow-sm" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 rounded-md bg-background shadow-sm" />
        <div className="h-12 rounded-md bg-background shadow-sm" />
      </div>
      <div className="h-3 w-2/3 rounded-full bg-primary/25" />
    </div>
  );
}

function OverviewSpotlightCodeVisual() {
  return (
    <div className="rounded-md bg-foreground p-3 font-mono text-[11px] leading-5 text-background">
      <div>session = AgentSession(</div>
      <div className="pl-3 opacity-80">rtc=&quot;voice&quot;,</div>
      <div className="pl-3 opacity-80">llm=&quot;realtime&quot;,</div>
      <div>)</div>
    </div>
  );
}

function OverviewSpotlightChecklistVisual() {
  return (
    <div className="grid gap-2">
      <div className="rounded-md bg-foreground px-3 py-2 font-mono text-[11px] text-background">
        &gt; create project
      </div>
      {['Project name', 'App ID', 'Certificate'].map((label) => (
        <div
          className="flex items-center gap-2 rounded-md bg-background px-3 py-2 text-xs text-muted-foreground shadow-sm"
          key={label}
        >
          <span className="size-2 rounded-full bg-primary/55" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
