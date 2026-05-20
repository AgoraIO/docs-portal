import { icons } from 'lucide-react';

export function DocsConfiguredIcon({
  className,
  icon,
}: {
  className?: string;
  icon?: string;
}) {
  if (!icon || !(icon in icons)) {
    return null;
  }

  const Icon = icons[icon as keyof typeof icons];

  return <Icon aria-hidden="true" className={className} />;
}
