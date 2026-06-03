import {
  AppWindowIcon,
  ArrowRightIcon,
  AudioLinesIcon,
  BlocksIcon,
  BotIcon,
  Code2Icon,
  CuboidIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  SmartphoneChargingIcon,
  TerminalSquareIcon,
  ZapIcon,
} from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function getOverviewMDXComponents(): MDXComponents {
  return {
    CardGrid,
    FeatureCard,
    OverviewSpotlightCard,
    OverviewSpotlightGrid,
    OverviewToolkits,
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
          ? 'sm:grid-cols-2 xl:grid-cols-3'
          : 'sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
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

type SolutionCardTone = 'blue' | 'green' | 'pink' | 'purple' | 'sand';

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
      className={cn(
        'group flex min-h-40 flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35',
        size === 'small' && 'min-h-32 p-4',
      )}
      href={href}
    >
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
        <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      <div className="mt-4 flex-1">
        <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
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
    </a>
  );
}

function getSolutionToneClasses(tone: SolutionCardTone) {
  if (tone === 'green') {
    return 'bg-emerald-500/10 text-emerald-700';
  }

  if (tone === 'pink') {
    return 'bg-rose-500/10 text-rose-700';
  }

  if (tone === 'purple') {
    return 'bg-violet-500/10 text-violet-700';
  }

  if (tone === 'sand') {
    return 'bg-amber-500/10 text-amber-700';
  }

  return 'bg-blue-500/10 text-blue-700';
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
      <div className="flex items-center justify-between gap-3 p-4">
        <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
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
