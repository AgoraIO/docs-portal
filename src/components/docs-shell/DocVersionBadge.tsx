import { Badge } from '@/components/ui/badge';
import type { DocVersion } from '@/lib/doc-versions';

export function getDocVersionLabel(version: DocVersion) {
  return `${version.label}${version.status === 'preview' && version.label !== 'Preview' ? ' · Preview' : ''}`;
}

export function DocVersionBadge({ version }: { version: DocVersion }) {
  const isPreview = version.status === 'preview';
  return (
    <Badge
      className={`border text-xs ${isPreview ? 'border-[color:color-mix(in_srgb,var(--docs-info)_25%,transparent)]' : 'text-foreground'}`}
      size="sm"
      variant={isPreview ? 'preview' : 'outline'}
    >
      {getDocVersionLabel(version)}
    </Badge>
  );
}
