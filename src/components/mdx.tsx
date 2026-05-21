import {
  CheckIcon,
  CheckCircleIcon,
  CopyIcon,
  InfoIcon,
  type LucideIcon,
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

    if (child.type === TabsTrigger && typeof childProps.value === 'string') {
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

function Pre({
  children,
  className,
  ...props
}: React.ComponentProps<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const childArray = Children.toArray(children);
  const codeChild = childArray.find((child) =>
    isValidElement(child),
  ) as ReactElement<React.ComponentProps<'code'>> | undefined;

  const shouldShowLineNumbers = true;

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
      data-line-numbers={shouldShowLineNumbers ? 'true' : undefined}
    >
      <button
        aria-label={copied ? 'Code copied' : 'Copy code'}
        className="docs-code-copy-button"
        onClick={() => void handleCopy()}
        type="button"
      >
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </button>
      <pre className={cn(className)} ref={preRef} {...props}>
        {enhancedChildren}
      </pre>
    </div>
  );
}

function CommandBlock({
  code,
  language = 'bash',
}: {
  code: string;
  language?: string;
}) {
  return (
    <Pre className={cn('shiki', `language-${language}`)}>
      <code className={cn('language-code', `language-${language}`)}>
        {code.replace(/\n$/, '').split('\n').map((line, index) => (
          <span className="line" key={`${index + 1}-${line}`}>
            {line}
          </span>
        ))}
      </code>
    </Pre>
  );
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
    Callout,
    CalloutContainer,
    CalloutDescription,
    CalloutTitle,
    CardGrid,
    FeatureCard,
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

    return <a href={normalizedHref} {...props} />;
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

function OverviewSpotlightGrid({ children }: { children: ReactNode }) {
  return <section className="not-prose overview-spotlight-grid">{children}</section>;
}

type OverviewSpotlightVariant = 'platform' | 'code' | 'checklist';

function OverviewSpotlightCard({
  href,
  title,
  variant = 'platform',
}: {
  href: string;
  title: string;
  variant?: OverviewSpotlightVariant;
}) {
  return (
    <a className="overview-spotlight-card" data-variant={variant} href={href}>
      <div aria-hidden="true" className="overview-spotlight-media">
        <div className="overview-spotlight-window">
          <span className="overview-spotlight-window-dot" />
          <span className="overview-spotlight-window-dot" />
          <span className="overview-spotlight-window-dot" />
        </div>
        <div className="overview-spotlight-scene">
          {variant === 'platform' ? <OverviewSpotlightPlatformVisual /> : null}
          {variant === 'code' ? <OverviewSpotlightCodeVisual /> : null}
          {variant === 'checklist' ? <OverviewSpotlightChecklistVisual /> : null}
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
        <span>  rtc="voice",</span>
        <span>  llm="gpt-5.3-chat",</span>
        <span>  tts="cartesia/sonic-3"</span>
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
      <span className="overview-spotlight-checklist-item">
        Project name
      </span>
      <span className="overview-spotlight-checklist-item">
        App ID
      </span>
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
