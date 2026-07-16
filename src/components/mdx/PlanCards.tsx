import { createLink } from '@tanstack/react-router';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Children, isValidElement, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import {
  type NormalizedDocsHref,
  normalizeDocsHref,
} from '@/lib/docs-link-normalize';

export type PlanCardAccent = 'blue' | 'green' | 'purple' | 'orange';
const FumadocsAnchor = defaultMdxComponents.a;
const RouterFumadocsAnchor = createLink(FumadocsAnchor);

export type PlanCardItem = {
  accent?: PlanCardAccent;
  badge?: string;
  cta?: {
    href: string;
    label: string;
  };
  description?: ReactNode;
  features: ReactNode[];
  id?: string;
  name: ReactNode;
};

export type PlanCardsProps = {
  className?: string;
  columns?: 2 | 3 | 4;
  contentPath?: string;
  plans: PlanCardItem[];
};

const accentClasses: Record<PlanCardAccent, string> = {
  blue: 'border-sky-200/90 bg-sky-50/55 [--plan-accent:theme(colors.sky.500)] dark:border-sky-400/30 dark:bg-sky-950/22 dark:[--plan-accent:theme(colors.sky.300)]',
  green:
    'border-emerald-200/90 bg-emerald-50/55 [--plan-accent:theme(colors.emerald.500)] dark:border-emerald-400/30 dark:bg-emerald-950/22 dark:[--plan-accent:theme(colors.emerald.300)]',
  orange:
    'border-orange-200/90 bg-orange-50/55 [--plan-accent:theme(colors.orange.500)] dark:border-orange-400/30 dark:bg-orange-950/22 dark:[--plan-accent:theme(colors.orange.300)]',
  purple:
    'border-violet-200/90 bg-violet-50/55 [--plan-accent:theme(colors.violet.500)] dark:border-violet-400/30 dark:bg-violet-950/22 dark:[--plan-accent:theme(colors.violet.300)]',
};

const gridColumns: Record<NonNullable<PlanCardsProps['columns']>, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
};

function normalizeColumns(
  count: number,
  requested?: PlanCardsProps['columns'],
) {
  if (requested) {
    return requested;
  }

  if (count <= 2) {
    return 2;
  }

  return count >= 4 ? 4 : 3;
}

function getNodeKeyPart(value: ReactNode): string {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    typeof value === 'symbol'
  ) {
    return '';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(getNodeKeyPart).filter(Boolean).join('|');
  }

  if (isValidElement<{ children?: ReactNode }>(value)) {
    if (value.key !== null) {
      return String(value.key);
    }

    return getNodeKeyPart(value.props.children);
  }

  return Children.toArray(value).map(getNodeKeyPart).filter(Boolean).join('|');
}

function dedupeKeys(parts: string[], fallback: string) {
  const seen = new Map<string, number>();

  return parts.map((part) => {
    const base = part || fallback;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    return count === 0 ? base : `${base}-${count + 1}`;
  });
}

function getPlanKeyPart(plan: PlanCardItem) {
  return [
    plan.id,
    getNodeKeyPart(plan.name),
    plan.cta?.href,
    plan.badge,
    plan.accent,
  ]
    .filter(Boolean)
    .join('|');
}

export function PlanCards({
  className,
  columns,
  contentPath,
  plans,
}: PlanCardsProps) {
  const normalizedColumns = normalizeColumns(plans.length, columns);
  const planKeys = dedupeKeys(plans.map(getPlanKeyPart), 'plan-card');

  return (
    <div
      className={cn(
        'not-prose my-6 grid w-full max-w-full grid-cols-1 gap-4',
        gridColumns[normalizedColumns],
        className,
      )}
      data-plan-card-count={plans.length}
    >
      {plans.map((plan, planIndex) => {
        const featureKeys = dedupeKeys(
          plan.features.map(getNodeKeyPart),
          `${planKeys[planIndex]}-feature`,
        );

        return (
          <article
            className={cn(
              'relative flex min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border bg-card/85 p-5 text-card-foreground shadow-[0_18px_60px_-44px_rgba(15,23,42,0.32)] ring-1 ring-transparent transition-colors dark:bg-card/70',
              accentClasses[plan.accent ?? 'blue'],
            )}
            key={planKeys[planIndex]}
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-[var(--plan-accent)]"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-4 pt-1">
              <header className="space-y-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="min-w-0 text-balance text-lg font-semibold tracking-[-0.015em] [overflow-wrap:anywhere]">
                    {plan.name}
                  </h3>
                  {plan.badge ? (
                    <span className="rounded-full bg-[var(--plan-accent)]/12 px-2.5 py-0.5 text-xs font-medium text-[var(--plan-accent)] ring-1 ring-[var(--plan-accent)]/25">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                {plan.description ? (
                  <p className="text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
                    {plan.description}
                  </p>
                ) : null}
              </header>

              <ul className="flex flex-1 flex-col gap-3 text-sm leading-6">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    className="flex min-w-0 gap-2.5"
                    key={featureKeys[featureIndex]}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--plan-accent)]/12 text-xs font-bold text-[var(--plan-accent)] ring-1 ring-[var(--plan-accent)]/25"
                    >
                      ✓
                    </span>
                    <span className="min-w-0 flex-1 break-words text-muted-foreground [overflow-wrap:anywhere]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.cta ? (
                <PlanCardCtaLink contentPath={contentPath} href={plan.cta.href}>
                  {plan.cta.label}
                </PlanCardCtaLink>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export const PricingCards = PlanCards;

function PlanCardCtaLink({
  children,
  contentPath,
  href,
}: {
  children: ReactNode;
  contentPath?: string;
  href: string;
}) {
  const normalized = normalizeDocsHref(href, { contentPath });
  const className =
    'mt-auto inline-flex w-fit max-w-full items-center justify-center rounded-full border border-[var(--plan-accent)]/35 px-3 py-1.5 text-center text-sm font-medium text-[var(--plan-accent)] transition-colors hover:bg-[var(--plan-accent)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--plan-accent)]/40 [overflow-wrap:anywhere]';
  const normalizedHref = normalized.href;

  if (shouldUseRouterLink(normalized)) {
    return (
      <RouterFumadocsAnchor className={className} to={normalizedHref}>
        {children}
      </RouterFumadocsAnchor>
    );
  }

  return (
    <FumadocsAnchor className={className} href={normalizedHref}>
      {children}
    </FumadocsAnchor>
  );
}

function shouldUseRouterLink(normalized: NormalizedDocsHref) {
  if (normalized.kind === 'internal-doc') {
    return true;
  }

  return normalized.kind === 'root' && isDocsRouteHref(normalized.href);
}

function isDocsRouteHref(href: string) {
  const [path] = href.split(/[?#]/, 1);

  return (
    path === '/en' ||
    path.startsWith('/en/') ||
    path === '/zh-CN' ||
    path.startsWith('/zh-CN/')
  );
}
