import { Tabs, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import { type AppLocale, DEFAULT_LOCALE } from '@/lib/i18n/i18n-config';
import {
  getStoredPlatformPreference,
  PLATFORM_PREFERENCE_EVENT,
  setStoredPlatformPreference,
  syncPlatformDataset,
} from '@/lib/platforms/preference';
import {
  getPlatformLabel,
  isKnownPlatform,
  type PlatformKey,
} from '@/lib/platforms/registry';

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
const PlatformTabsPlacementContext = createContext<'header' | 'inline'>(
  'inline',
);

export function PlatformTabsPlacementProvider({
  children,
  value,
}: {
  children?: ReactNode;
  value: 'header' | 'inline';
}) {
  return (
    <PlatformTabsPlacementContext value={value}>
      {children}
    </PlatformTabsPlacementContext>
  );
}

export function PlatformTabsGroup({
  canonicalPlatform,
  children,
  groupMode,
  locale = DEFAULT_LOCALE,
  platforms,
  showTabs = 'true',
  tabsPlacement,
}: {
  canonicalPlatform: PlatformKey;
  children?: ReactNode;
  groupMode: 'inline' | 'structured';
  locale?: AppLocale;
  platforms: string;
  showTabs?: string;
  tabsPlacement?: 'header' | 'inline';
}) {
  const parsedPlatforms = usePlatformList(platforms);
  const contextTabsPlacement = useContext(PlatformTabsPlacementContext);
  const resolvedTabsPlacement = tabsPlacement ?? contextTabsPlacement;
  const shouldShowTabs = showTabs !== 'false' && parsedPlatforms.length > 1;
  const shouldRenderInlineTabs =
    shouldShowTabs && resolvedTabsPlacement === 'inline';
  const { activePlatform, handlePlatformChange } = usePlatformSelection({
    canonicalPlatform,
    parsedPlatforms,
  });

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
          ? 'flex flex-col gap-4'
          : 'flex flex-col gap-3',
      )}
      data-platform-group={groupMode}
      data-platforms={parsedPlatforms.join(' ')}
    >
      {shouldRenderInlineTabs ? (
        <div className={cn(groupMode === 'structured' && 'not-prose')}>
          <PlatformTabs
            activePlatform={activePlatform}
            locale={locale}
            onValueChange={handlePlatformChange}
            platforms={parsedPlatforms}
          />
        </div>
      ) : null}
      {panelChildren}
    </div>
  );
}

export function PlatformHeaderTabs({
  canonicalPlatform,
  className,
  locale = DEFAULT_LOCALE,
  platforms,
}: {
  canonicalPlatform: PlatformKey;
  className?: string;
  locale?: AppLocale;
  platforms: string;
}) {
  const parsedPlatforms = usePlatformList(platforms);
  const { activePlatform, handlePlatformChange } = usePlatformSelection({
    canonicalPlatform,
    parsedPlatforms,
  });

  if (parsedPlatforms.length <= 1) {
    return null;
  }

  return (
    <div className={cn('not-prose max-w-full', className)}>
      <PlatformTabs
        activePlatform={activePlatform}
        locale={locale}
        onValueChange={handlePlatformChange}
        platforms={parsedPlatforms}
      />
    </div>
  );
}

function PlatformTabs({
  activePlatform,
  locale,
  onValueChange,
  platforms,
}: {
  activePlatform: PlatformKey;
  locale: AppLocale;
  onValueChange: (value: string) => void;
  platforms: PlatformKey[];
}) {
  return (
    <ControlledTabs onValueChange={onValueChange} value={activePlatform}>
      <TabsList>
        {platforms.map((platform) => (
          <TabsTrigger
            key={platform}
            onClick={() => onValueChange(platform)}
            value={platform}
          >
            {getPlatformLabel(platform, locale)}
          </TabsTrigger>
        ))}
      </TabsList>
    </ControlledTabs>
  );
}

function usePlatformList(platforms: string) {
  return useMemo(() => {
    const parsed = JSON.parse(platforms) as string[];
    return parsed.filter(isKnownPlatform);
  }, [platforms]);
}

function usePlatformSelection({
  canonicalPlatform,
  parsedPlatforms,
}: {
  canonicalPlatform: PlatformKey;
  parsedPlatforms: PlatformKey[];
}) {
  const storedPlatformPreferenceRef = useRef<PlatformKey | null | undefined>(
    undefined,
  );

  if (storedPlatformPreferenceRef.current === undefined) {
    const stored = getStoredPlatformPreference();
    storedPlatformPreferenceRef.current =
      stored && isKnownPlatform(stored) ? stored : null;
  }

  const [activePlatform, setActivePlatform] = useState<PlatformKey>(() => {
    const stored = storedPlatformPreferenceRef.current;

    if (stored && parsedPlatforms.includes(stored)) {
      return stored;
    }

    return parsedPlatforms.includes(canonicalPlatform)
      ? canonicalPlatform
      : (parsedPlatforms[0] ?? canonicalPlatform);
  });
  const activePlatformRef = useRef(activePlatform);

  useEffect(() => {
    const stored = getStoredPlatformPreference();

    if (
      stored &&
      isKnownPlatform(stored) &&
      parsedPlatforms.includes(stored) &&
      stored !== activePlatform
    ) {
      activePlatformRef.current = stored;
      setActivePlatform(stored);
      return;
    }

    if (!parsedPlatforms.includes(activePlatform)) {
      activePlatformRef.current = canonicalPlatform;
      setActivePlatform(canonicalPlatform);
    }
  }, [activePlatform, canonicalPlatform, parsedPlatforms]);

  useEffect(() => {
    activePlatformRef.current = activePlatform;
    syncPlatformDataset(activePlatform);
  }, [activePlatform]);

  useEffect(() => {
    function handlePreferenceChange(event: Event) {
      const nextPlatform =
        event instanceof CustomEvent
          ? event.detail
          : getStoredPlatformPreference();

      if (typeof nextPlatform === 'string' && isKnownPlatform(nextPlatform)) {
        storedPlatformPreferenceRef.current = nextPlatform;

        if (parsedPlatforms.includes(nextPlatform)) {
          activePlatformRef.current = nextPlatform;
          setActivePlatform(nextPlatform);
        }
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== 'docs-portal:platform:v1') {
        return;
      }

      if (
        typeof event.newValue === 'string' &&
        isKnownPlatform(event.newValue)
      ) {
        storedPlatformPreferenceRef.current = event.newValue;

        if (parsedPlatforms.includes(event.newValue)) {
          activePlatformRef.current = event.newValue;
          setActivePlatform(event.newValue);
        }
      }
    }

    window.addEventListener(PLATFORM_PREFERENCE_EVENT, handlePreferenceChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(
        PLATFORM_PREFERENCE_EVENT,
        handlePreferenceChange,
      );
      window.removeEventListener('storage', handleStorage);
    };
  }, [parsedPlatforms]);

  function handlePlatformChange(value: string) {
    if (!isKnownPlatform(value) || !parsedPlatforms.includes(value)) {
      return;
    }

    if (activePlatformRef.current !== value) {
      activePlatformRef.current = value;
      setActivePlatform(value);
    }

    if (storedPlatformPreferenceRef.current !== value) {
      storedPlatformPreferenceRef.current = value;
      setStoredPlatformPreference(value);
    }
  }

  return {
    activePlatform,
    handlePlatformChange,
  };
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
