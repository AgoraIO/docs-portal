import { Tabs, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
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

export function PlatformTabsGroup({
  canonicalPlatform,
  children,
  groupMode,
  locale = DEFAULT_LOCALE,
  platforms,
  showTabs = 'true',
}: {
  canonicalPlatform: PlatformKey;
  children?: ReactNode;
  groupMode: 'inline' | 'structured';
  locale?: AppLocale;
  platforms: string;
  showTabs?: string;
}) {
  const parsedPlatforms = useMemo(() => {
    const parsed = JSON.parse(platforms) as string[];
    return parsed.filter(isKnownPlatform);
  }, [platforms]);
  const shouldShowTabs = showTabs !== 'false' && parsedPlatforms.length > 1;
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
        {shouldShowTabs ? (
          <TabsList>
            {parsedPlatforms.map((platform) => (
              <TabsTrigger
                key={platform}
                onClick={() => handlePlatformChange(platform)}
                value={platform}
              >
                {getPlatformLabel(platform, locale)}
              </TabsTrigger>
            ))}
          </TabsList>
        ) : null}
      </ControlledTabs>
      {panelChildren}
    </div>
  );

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
