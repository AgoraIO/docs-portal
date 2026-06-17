import {
  BookOpenIcon,
  BotIcon,
  CpuIcon,
  ShieldCheckIcon,
  ZapIcon,
} from 'lucide-react';

const configuredIcons = {
  BookOpen: BookOpenIcon,
  Bot: BotIcon,
  Cpu: CpuIcon,
  ShieldCheck: ShieldCheckIcon,
  Zap: ZapIcon,
} as const;

export function hasConfiguredIcon(icon?: string) {
  return Boolean(icon && icon in configuredIcons);
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

  const Icon = configuredIcons[icon as keyof typeof configuredIcons];

  return <Icon aria-hidden="true" className={className} />;
}
