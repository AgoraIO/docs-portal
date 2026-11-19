import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';

function shouldShowDocsLinkIcon(href?: string, target?: string) {
  return target === '_blank' || /^(?:https?:)?\/\//i.test(href ?? '');
}

export function DocsLinkIcon({
  href,
  target,
  className,
}: {
  href?: string;
  target?: string;
  className?: string;
}) {
  if (!shouldShowDocsLinkIcon(href, target)) return null;
  return (
    <ExternalLink
      aria-hidden="true"
      data-icon="inline-end"
      className={cn(
        'docs-external-link-icon ms-[0.2em] inline-block size-[0.8em] shrink-0 align-baseline',
        className,
      )}
    />
  );
}
