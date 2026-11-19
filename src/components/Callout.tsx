import {
  Callout as FumadocsCallout,
  CalloutContainer as FumadocsCalloutContainer,
} from 'fumadocs-ui/components/callout';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export function Callout({
  className,
  ...props
}: ComponentProps<typeof FumadocsCallout>) {
  return (
    <FumadocsCallout className={cn('docs-callout', className)} {...props} />
  );
}

export function CalloutContainer({
  className,
  ...props
}: ComponentProps<typeof FumadocsCalloutContainer>) {
  return (
    <FumadocsCalloutContainer
      className={cn('docs-callout', className)}
      {...props}
    />
  );
}
