import {
  Tabs,
  TabsList,
  TabsTrigger,
} from 'fumadocs-ui/components/tabs';
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_LOCALE, type AppLocale } from '@/lib/i18n/i18n-config';
import {
  getStoredPlatformPreference,
  setStoredPlatformPreference,
  syncPlatformDataset,
} from '@/lib/platforms/preference';
import {
  getPlatformLabel,
  isKnownPlatform,
  type PlatformKey,
} from '@/lib/platforms/registry';
import { cn } from '@/lib/cn';

type ControlledTabsProps = React.ComponentProps<typeof Tabs> & {
  onValueChange?: (value: string) => void;
  value?: string;
};

type PlatformPanelProps = {
  children?: ReactNode;
  platform: PlatformKey;
  activePlatform?: PlatformKey;
};

const ControlledTabs = Tabs as React.ComponentType<ControlledTabsProps>;

export function PlatformTabsGroup({
  canonicalPlatform,
  children,
  groupMode,
  locale = DEFAULT_LOCALE,
  platforms,
}: {
  canonicalPlatform: PlatformKey;
  children?: ReactNode;
  groupMode: 'inline' | 'structured';
  locale?: AppLocale;
  platforms: string;
}) {
  const parsedPlatforms = useMemo(() => {
    const parsed = JSON.parse(platforms) as string[];
    return parsed.filter(isKnownPlatform);
  }, [platforms]);
  const [activePlatform, setActivePlatform] = useState<PlatformKey>(
    canonicalPlatform,
  );

  useEffect(() => {
    const stored = getStoredPlatformPreference();

    if (
      stored &&
      isKnownPlatform(stored) &&
      parsedPlatforms.includes(stored) &&
      stored !== activePlatform
    ) {
      setActivePlatform(stored);
      return;
    }

    if (!parsedPlatforms.includes(activePlatform)) {
      setActivePlatform(canonicalPlatform);
    }
  }, [activePlatform, canonicalPlatform, parsedPlatforms]);

  useEffect(() => {
    syncPlatformDataset(activePlatform);
  }, [activePlatform]);

  const panelChildren = Children.map(children, (child) => {
    if (!isValidElement<PlatformPanelProps>(child)) {
      return child;
    }

    return cloneElement(child as ReactElement<PlatformPanelProps>, {
      activePlatform,
    });
  });

  return (
    <div
      className={cn(
        groupMode === 'structured'
          ? 'not-prose flex flex-col gap-4'
          : 'flex flex-col gap-3',
      )}
      data-platform-group={groupMode}
      data-platforms={parsedPlatforms.join(' ')}
    >
      <ControlledTabs
        onValueChange={handlePlatformChange}
        value={activePlatform}
      >
        <TabsList>
          {parsedPlatforms.map((platform) => (
            <TabsTrigger key={platform} value={platform}>
              {getPlatformLabel(platform, locale)}
            </TabsTrigger>
          ))}
        </TabsList>
      </ControlledTabs>
      {panelChildren}
    </div>
  );

  function handlePlatformChange(value: string) {
    if (!isKnownPlatform(value) || !parsedPlatforms.includes(value)) {
      return;
    }

    setActivePlatform(value);
    setStoredPlatformPreference(value);
  }
}

export function PlatformPanel({
  activePlatform,
  children,
  platform,
}: PlatformPanelProps) {
  const isActive = activePlatform === undefined || activePlatform === platform;

  return (
    <section
      aria-hidden={isActive ? 'false' : 'true'}
      data-platform-panel={platform}
      hidden={!isActive}
      inert={isActive ? undefined : true}
    >
      {children}
    </section>
  );
}
