import { icons } from 'lucide-react';

export function hasConfiguredIcon(icon?: string) {
  return Boolean(icon && icon in icons);
}

export function DocsConfiguredIcon({
  className,
  icon,
}: {
  className?: string;
  icon?: string;
}) {
  if (!hasConfiguredIcon(icon)) {
    return null;
  }

  const Icon = icons[icon as keyof typeof icons];

  return <Icon aria-hidden="true" className={className} />;
}
