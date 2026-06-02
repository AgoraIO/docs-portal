import {
  ArrowRightIcon,
  AppWindowIcon,
  AudioLinesIcon,
  BlocksIcon,
  BotIcon,
  CheckCircleIcon,
  CheckIcon,
  Code2Icon,
  CopyIcon,
  CuboidIcon,
  InfoIcon,
  type LucideIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  SmartphoneChargingIcon,
  TerminalSquareIcon,
  TriangleAlertIcon,
  ZapIcon,
} from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import {
  type AnchorHTMLAttributes,
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList as UiTabsList,
  TabsTrigger as UiTabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
import { scrollDocsHashTarget } from '@/lib/docs-hash';
import { normalizeDocsHref } from '@/lib/docs-link-normalize';

function Tabs(props: React.ComponentProps<typeof UiTabs>) {
  const defaultValue =
    props.defaultValue ??
    props.value ??
    getFirstTabsTriggerValue(props.children);

  return (
    <UiTabs
      className={cn('docs-mdx-tabs my-6', props.className)}
      {...props}
      defaultValue={props.value ? props.defaultValue : defaultValue}
    />
  );
}

function TabsList(props: React.ComponentProps<typeof UiTabsList>) {
  return (
    <UiTabsList
      className={cn(
        'mb-4 flex-wrap rounded-t-2xl border border-b-0 border-[color:var(--line)] bg-[color:var(--bg-elev)] px-3 pt-2 shadow-[0_10px_28px_rgba(15,23,42,0.05)]',
        props.className,
      )}
      variant="line"
      {...props}
    />
  );
}

function TabsTrigger(props: React.ComponentProps<typeof UiTabsTrigger>) {
  return (
    <UiTabsTrigger
      className={cn(
        'min-h-12 rounded-none px-3 pt-2 pb-2 text-[0.98rem] font-semibold text-[color:var(--ink-3)] md:px-4 group-data-[variant=line]/tabs-list:data-[state=active]:text-[color:var(--ink-1)]',
        props.className,
      )}
      {...props}
    />
  );
}

function TabsContent(props: React.ComponentProps<typeof UiTabsContent>) {
  return (
    <UiTabsContent className={cn('mt-0 min-w-0', props.className)} {...props} />
  );
}

function CodeBlockTabs(props: React.ComponentProps<typeof UiTabs>) {
  const defaultValue =
    props.defaultValue ??
    props.value ??
    getFirstTabsTriggerValue(props.children);

  return (
    <UiTabs
      className={cn('docs-code-tabs my-6', props.className)}
      {...props}
      defaultValue={props.value ? props.defaultValue : defaultValue}
    />
  );
}

function CodeBlockTabsList(props: React.ComponentProps<typeof UiTabsList>) {
  return (
    <UiTabsList
      className={cn('docs-code-tabs-list', props.className)}
      variant="line"
      {...props}
    />
  );
}

function CodeBlockTabsTrigger(
  props: React.ComponentProps<typeof UiTabsTrigger>,
) {
  return (
    <UiTabsTrigger
      className={cn('docs-code-tabs-trigger', props.className)}
      {...props}
    />
  );
}

function CodeBlockTab(props: React.ComponentProps<typeof UiTabsContent>) {
  return (
    <UiTabsContent
      className={cn('docs-code-tabs-content', props.className)}
      {...props}
    />
  );
}

function getFirstTabsTriggerValue(children: ReactNode): string | undefined {
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }

    const childProps = (
      child as ReactElement<{
        children?: ReactNode;
        value?: unknown;
      }>
    ).props;

    if (
      (child.type === TabsTrigger || child.type === CodeBlockTabsTrigger) &&
      typeof childProps.value === 'string'
    ) {
      return childProps.value;
    }

    const nestedValue = getFirstTabsTriggerValue(childProps.children);

    if (nestedValue) {
      return nestedValue;
    }
  }
}

type MDXContext = {
  contentPath?: string;
};

type CodeBlockPreProps = React.ComponentProps<'pre'> & {
  icon?: string;
  title?: string;
  'data-line-numbers'?: boolean | string;
  'data-line-numbers-start'?: number | string;
};

function Pre({
  children,
  className,
  icon,
  title,
  'data-line-numbers': lineNumbers,
  'data-line-numbers-start': lineNumbersStart,
  ...props
}: CodeBlockPreProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const childArray = Children.toArray(children);
  const codeChild = childArray.find((child) => isValidElement(child)) as
    | ReactElement<React.ComponentProps<'code'>>
    | undefined;
  const codeText = getTextContent(codeChild?.props.children ?? children);
  const lineCount = countCodeLines(codeChild?.props.children ?? children);
  const isLongSingleLineCode = codeText.length > 72 && lineCount === 1;

  const shouldShowLineNumbers =
    lineNumbers !== undefined &&
    lineNumbers !== false &&
    lineNumbers !== 'false';
  const lineNumberStart =
    typeof lineNumbersStart === 'number'
      ? lineNumbersStart
      : Number.parseInt(String(lineNumbersStart ?? 1), 10) || 1;

  const enhancedChildren =
    codeChild && shouldShowLineNumbers
      ? cloneElement(codeChild, {
          className: cn('docs-code-with-lines', codeChild.props.className),
        })
      : children;

  async function handleCopy() {
    const text = preRef.current?.textContent?.trimEnd();

    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      if (!preRef.current) {
        return;
      }
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(preRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.execCommand('copy');
      selection?.removeAllRanges();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="not-prose docs-code-block-root"
      data-testid="mdx-code-block"
      data-line-numbers={shouldShowLineNumbers ? 'true' : undefined}
      data-line-numbers-start={
        shouldShowLineNumbers ? String(lineNumberStart) : undefined
      }
      data-long-code={isLongSingleLineCode ? 'true' : undefined}
      style={{
        counterReset: shouldShowLineNumbers
          ? `docs-line ${lineNumberStart - 1}`
          : undefined,
      }}
    >
      {title && (
        <div className="docs-code-block-header">
          {icon && (
            <CodeBlockIconMarkup className="docs-code-block-icon" icon={icon} />
          )}
          <figcaption className="docs-code-block-title">{title}</figcaption>
        </div>
      )}
      <button
        aria-label={copied ? 'Code copied' : 'Copy code'}
        className="docs-code-copy-button"
        onClick={() => void handleCopy()}
        type="button"
      >
        {copied ? (
          <CheckIcon className="size-4" />
        ) : (
          <CopyIcon className="size-4" />
        )}
      </button>
      <pre className={cn(className)} ref={preRef} {...props}>
        {enhancedChildren}
      </pre>
    </div>
  );
}

function getTextContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }

  return '';
}

function countCodeLines(node: ReactNode): number {
  if (Array.isArray(node)) {
    const lineElements = node.filter(
      (child) =>
        isValidElement<{ className?: string }>(child) &&
        child.props.className?.split(/\s+/).includes('line'),
    );

    if (lineElements.length > 0) {
      return lineElements.length;
    }

    return getTextContent(node).trim().split(/\r?\n/).length;
  }

  if (
    isValidElement<{ children?: ReactNode; className?: string }>(node) &&
    node.props.className?.split(/\s+/).includes('line')
  ) {
    return 1;
  }

  return getTextContent(node).trim().split(/\r?\n/).length;
}

function CommandBlock({
  code,
  language = 'bash',
}: {
  code: string;
  language?: string;
}) {
  const lines = code
    .replace(/\n$/, '')
    .split('\n')
    .map((line, index) => ({
      id: `${index + 1}`,
      line,
    }));

  return (
    <Pre className={cn('shiki', `language-${language}`)}>
      <code className={cn('language-code', `language-${language}`)}>
        {lines.map(({ id, line }) => (
          <span className="line" key={id}>
            {line}
          </span>
        ))}
      </code>
    </Pre>
  );
}

function CodeBlockIconMarkup({
  className,
  icon,
}: {
  className?: string;
  icon: string;
}) {
  const svg = parseCodeBlockIcon(icon);

  if (!svg) {
    return null;
  }

  return (
    <span aria-hidden="true" className={className} role="img">
      <svg aria-hidden="true" viewBox={svg.viewBox}>
        <path d={svg.pathD} fill={svg.fill} />
      </svg>
    </span>
  );
}

function parseCodeBlockIcon(icon: string) {
  const viewBox = icon.match(/\bviewBox=(["'])(?<value>[^"']+)\1/)?.groups
    ?.value;
  const pathD = icon.match(/\bd=(["'])(?<value>[^"']+)\1/)?.groups?.value;
  const fill = icon.match(/\bfill=(["'])(?<value>[^"']+)\1/)?.groups?.value;

  if (!viewBox || !pathD) {
    return undefined;
  }

  return {
    fill: fill ?? 'currentColor',
    pathD,
    viewBox,
  };
}

export function getMDXComponents(
  components?: MDXComponents,
  context?: MDXContext,
) {
  return {
    a: createDocsAnchor(context?.contentPath),
    CommandBlock,
    pre: Pre,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    CodeBlockTab,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    Callout,
    CalloutContainer,
    CalloutDescription,
    CalloutTitle,
    CardGrid,
    FeatureCard,
    RecipesCatalog,
    SolutionCard,
    SolutionCardGrid,
    OverviewToolkits,
    ToolkitGroup,
    ToolkitItem,
    OverviewSpotlightGrid,
    OverviewSpotlightCard,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

type CalloutType =
  | 'error'
  | 'info'
  | 'ok'
  | 'success'
  | 'warn'
  | 'warning'
  | 'zap';

function createDocsAnchor(contentPath?: string) {
  function DocsAnchor({
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const normalizedHref =
      typeof href === 'string'
        ? normalizeDocsHref(href, { contentPath }).href
        : href;

    return (
      <a
        href={normalizedHref}
        onClick={(event) => {
          if (
            typeof normalizedHref === 'string' &&
            normalizedHref.startsWith('#')
          ) {
            event.preventDefault();
            scrollDocsHashTarget(normalizedHref);
          }

          props.onClick?.(event);
        }}
        {...props}
      />
    );
  }

  return DocsAnchor;
}

function Callout({
  children,
  title,
  type = 'info',
}: {
  children: ReactNode;
  title: string;
  type?: CalloutType;
}) {
  return (
    <CalloutContainer type={type}>
      <CalloutTitle>{title}</CalloutTitle>
      <CalloutDescription>{children}</CalloutDescription>
    </CalloutContainer>
  );
}

function CalloutContainer({
  children,
  type = 'info',
}: {
  children: ReactNode;
  type?: CalloutType;
}) {
  const normalizedType = normalizeCalloutType(type);
  const Icon = getCalloutIcon(normalizedType);

  return (
    <aside className="not-prose docs-callout" data-type={normalizedType}>
      <span className="docs-callout-icon">
        <Icon className="size-4" />
      </span>
      <div>{children}</div>
    </aside>
  );
}

function CalloutTitle({ children }: { children: ReactNode }) {
  return <p className="docs-callout-title">{children}</p>;
}

function CalloutDescription({ children }: { children: ReactNode }) {
  return <div className="docs-callout-body">{children}</div>;
}

function CardGrid({ children }: { children: ReactNode }) {
  return <div className="not-prose docs-card-grid">{children}</div>;
}

function FeatureCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="docs-card">
      <h3>{title}</h3>
      <div className="docs-card-body">{children}</div>
    </section>
  );
}

function OverviewToolkits({ children }: { children: ReactNode }) {
  return <section className="not-prose overview-toolkits">{children}</section>;
}

function ToolkitGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overview-toolkits-group">
      <h3>{title}</h3>
      <div className="overview-toolkits-items">{children}</div>
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
    <a className="overview-toolkits-item" href={href}>
      <span className="overview-toolkits-icon">
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
    <section className="not-prose solution-card-grid" data-size={size}>
      {children}
    </section>
  );
}

type SolutionCardIconKind =
  | 'ai'
  | 'classroom'
  | 'device'
  | 'meeting'
  | 'messaging'
  | 'rtc';

type SolutionCardTone =
  | 'blue'
  | 'green'
  | 'pink'
  | 'purple'
  | 'sand';

type RecipeCatalogItem = {
  category: string;
  description: string;
  href: string;
  product: string;
  stack?: string;
  tags?: string[];
  title: string;
  tone?: SolutionCardTone;
};

function SolutionCard({
  description,
  href,
  icon,
  size = 'large',
  tags = [],
  title,
  tone = 'blue',
}: {
  description: string;
  href: string;
  icon?: SolutionCardIconKind;
  size?: 'large' | 'small';
  tags?: string[];
  title: string;
  tone?: SolutionCardTone;
}) {
  return (
    <a
      className="solution-card"
      data-size={size}
      data-tone={tone}
      href={href}
    >
      <div className="solution-card-top">
        {icon ? (
          <span className="solution-card-icon">
            <SolutionCardIcon kind={icon} />
          </span>
        ) : null}
        <ArrowRightIcon className="solution-card-arrow" />
      </div>
      <div className="solution-card-body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {tags.length > 0 ? (
        <div className="solution-card-tags">
          {tags.map((tag) => (
            <span className="solution-card-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </a>
  );
}

function RecipesCatalog({
  allCategoriesLabel,
  allProductsLabel,
  allStacksLabel,
  categoryFilterLabel,
  clearFiltersLabel,
  emptyMessage,
  items,
  productFilterLabel,
  searchPlaceholder,
  stackFilterLabel,
}: {
  allCategoriesLabel: string;
  allProductsLabel: string;
  allStacksLabel: string;
  categoryFilterLabel: string;
  clearFiltersLabel: string;
  emptyMessage: string;
  items: RecipeCatalogItem[];
  productFilterLabel: string;
  searchPlaceholder: string;
  stackFilterLabel: string;
}) {
  const [query, setQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState(allProductsLabel);
  const [activeCategory, setActiveCategory] = useState(allCategoriesLabel);
  const [activeStack, setActiveStack] = useState(allStacksLabel);
  const deferredQuery = useDeferredValue(query);

  const products = useMemo(
    () => [allProductsLabel, ...getUniqueValues(items.map((item) => item.product))],
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

  return (
    <section className="not-prose recipes-catalog">
      <div className="recipes-catalog-toolbar">
        <label className="recipes-catalog-search">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            className="recipes-catalog-search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={query}
          />
        </label>
        {hasActiveFilters ? (
          <button
            className="recipes-catalog-clear"
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
      <RecipesCatalogFilterGroup
        activeValue={activeProduct}
        label={productFilterLabel}
        onSelect={setActiveProduct}
        values={products}
      />
      <RecipesCatalogFilterGroup
        activeValue={activeCategory}
        label={categoryFilterLabel}
        onSelect={setActiveCategory}
        values={categories}
      />
      <RecipesCatalogFilterGroup
        activeValue={activeStack}
        label={stackFilterLabel}
        onSelect={setActiveStack}
        values={stacks}
      />
      {filteredItems.length > 0 ? (
        <section
          className="solution-card-grid recipes-catalog-grid"
          data-size="small"
        >
          {filteredItems.map((item) => (
            <SolutionCard
              description={item.description}
              href={item.href}
              key={item.href}
              size="small"
              tags={[
                item.product,
                item.category,
                ...(item.stack ? [item.stack] : []),
                ...(item.tags ?? []),
              ]}
              title={item.title}
              tone={item.tone ?? 'blue'}
            />
          ))}
        </section>
      ) : (
        <div className="recipes-catalog-empty">{emptyMessage}</div>
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
    <div className="recipes-catalog-filter-group">
      <p className="recipes-catalog-filter-label">{label}</p>
      <div className="recipes-catalog-filter-values">
        {values.map((value) => (
          <button
            className="recipes-catalog-filter-chip"
            data-active={value === activeValue}
            key={value}
            onClick={() => onSelect(value)}
            type="button"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function getUniqueValues(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function normalizeRecipeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

function SolutionCardIcon({ kind }: { kind: SolutionCardIconKind }) {
  if (kind === 'ai') {
    return <BotIcon className="size-5" />;
  }

  if (kind === 'messaging') {
    return <BlocksIcon className="size-5" />;
  }

  if (kind === 'meeting') {
    return <AppWindowIcon className="size-5" />;
  }

  if (kind === 'classroom') {
    return <MonitorSmartphoneIcon className="size-5" />;
  }

  if (kind === 'device') {
    return <CuboidIcon className="size-5" />;
  }

  return <AudioLinesIcon className="size-5" />;
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
      className="not-prose overview-spotlight-grid"
      data-size={size}
    >
      {children}
    </section>
  );
}

type OverviewSpotlightVariant = 'platform' | 'code' | 'checklist';

function OverviewSpotlightCard({
  href,
  size = 'large',
  title,
  variant = 'platform',
}: {
  href: string;
  size?: OverviewSpotlightSize;
  title: string;
  variant?: OverviewSpotlightVariant;
}) {
  return (
    <a
      className="overview-spotlight-card"
      data-size={size}
      data-variant={variant}
      href={href}
      onClick={(event) => {
        if (href.startsWith('#')) {
          event.preventDefault();
          scrollDocsHashTarget(href);
        }
      }}
    >
      <div aria-hidden="true" className="overview-spotlight-media">
        <div className="overview-spotlight-window">
          <span className="overview-spotlight-window-dot" />
          <span className="overview-spotlight-window-dot" />
          <span className="overview-spotlight-window-dot" />
        </div>
        <div className="overview-spotlight-scene">
          {variant === 'platform' ? <OverviewSpotlightPlatformVisual /> : null}
          {variant === 'code' ? <OverviewSpotlightCodeVisual /> : null}
          {variant === 'checklist' ? (
            <OverviewSpotlightChecklistVisual />
          ) : null}
        </div>
      </div>
      <div className="overview-spotlight-body">
        <h3>{title}</h3>
      </div>
    </a>
  );
}

function OverviewSpotlightPlatformVisual() {
  return (
    <div className="overview-spotlight-platform">
      <div className="overview-spotlight-platform-hero">
        <span className="overview-spotlight-platform-prompt" />
      </div>
      <div className="overview-spotlight-platform-panel overview-spotlight-platform-panel--primary">
        <span className="overview-spotlight-platform-line overview-spotlight-platform-line--short" />
      </div>
      <div className="overview-spotlight-platform-panel overview-spotlight-platform-panel--secondary">
        <span className="overview-spotlight-platform-chip" />
        <span className="overview-spotlight-platform-chip overview-spotlight-platform-chip--wide" />
      </div>
      <div className="overview-spotlight-platform-pill" />
      <div className="overview-spotlight-platform-pill overview-spotlight-platform-pill--secondary" />
      <div className="overview-spotlight-platform-stack" />
    </div>
  );
}

function OverviewSpotlightCodeVisual() {
  return (
    <div className="overview-spotlight-code">
      <div className="overview-spotlight-code-bar" />
      <div className="overview-spotlight-code-body">
        <span>session = AgentSession(</span>
        <span> rtc="voice",</span>
        <span> llm="gpt-5.3-chat",</span>
        <span> tts="cartesia/sonic-3"</span>
        <span>)</span>
      </div>
      <div className="overview-spotlight-code-waveform" />
    </div>
  );
}

function OverviewSpotlightChecklistVisual() {
  return (
    <div className="overview-spotlight-checklist">
      <span className="overview-spotlight-checklist-command">
        &gt; create project
      </span>
      <span className="overview-spotlight-checklist-item">Project name</span>
      <span className="overview-spotlight-checklist-item">App ID</span>
      <span className="overview-spotlight-checklist-item">
        Primary certificate
      </span>
    </div>
  );
}

function normalizeCalloutType(
  type: CalloutType,
): 'error' | 'info' | 'ok' | 'warn' | 'zap' {
  if (type === 'success') {
    return 'ok';
  }

  if (type === 'warning') {
    return 'warn';
  }

  return type;
}

function getCalloutIcon(
  type: 'error' | 'info' | 'ok' | 'warn' | 'zap',
): LucideIcon {
  if (type === 'ok') {
    return CheckCircleIcon;
  }

  if (type === 'error' || type === 'warn') {
    return TriangleAlertIcon;
  }

  if (type === 'zap') {
    return ZapIcon;
  }

  return InfoIcon;
}
