import { Heading } from 'fumadocs-ui/components/heading';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const OPENAPI_SECTION_HEADING_CLASS =
  'openapi-section-heading font-semibold text-2xl leading-7';

export const OPENAPI_SECTION_HEADING_IDS = new Set([
  'parameters-path',
  'parameters-query',
  'parameters-header',
  'parameters-cookie',
  'request-body',
  'response-body',
]);

export function renderOpenApiHeading(
  props: ComponentProps<'h1'>,
  depth: number,
) {
  const as = `h${depth}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const className = OPENAPI_SECTION_HEADING_IDS.has(props.id ?? '')
    ? cn(props.className, OPENAPI_SECTION_HEADING_CLASS)
    : props.className;

  return <Heading {...props} as={as} className={className} />;
}

export function OpenApiSectionHeading({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id: string;
}) {
  return (
    <Heading
      as="h2"
      className={cn(OPENAPI_SECTION_HEADING_CLASS, className)}
      id={id}
    >
      {children}
    </Heading>
  );
}
