import {
  CheckCircleIcon,
  InfoIcon,
  type LucideIcon,
  TriangleAlertIcon,
  ZapIcon,
} from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';

export function getMDXComponents(components?: MDXComponents) {
  return {
    Callout,
    CalloutContainer,
    CalloutDescription,
    CalloutTitle,
    CardGrid,
    FeatureCard,
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
