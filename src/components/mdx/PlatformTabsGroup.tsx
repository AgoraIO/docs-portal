import { Tabs, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';
import { ChevronDownIcon } from 'lucide-react';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useId,
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
const HEADER_PRIMARY_PLATFORMS: PlatformKey[] = [
  'android',
  'ios',
  'macos',
  'web',
  'windows',
];
const HEADER_OVERFLOW_PLATFORMS: PlatformKey[] = [
  'flutter',
  'react-native',
  'unity',
  'unreal',
  'javascript',
  'electron',
];

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
      <PlatformHeaderTabsList
        activePlatform={activePlatform}
        locale={locale}
        onValueChange={handlePlatformChange}
        platforms={parsedPlatforms}
      />
    </div>
  );
}

function PlatformHeaderTabsList({
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
  const primaryPlatforms = HEADER_PRIMARY_PLATFORMS.filter((platform) =>
    platforms.includes(platform),
  );
  const unorderedOverflowPlatforms = platforms.filter(
    (platform) => !primaryPlatforms.includes(platform),
  );
  const overflowPlatforms = sortHeaderOverflowPlatforms(
    unorderedOverflowPlatforms,
  );
  const moreActive = overflowPlatforms.includes(activePlatform);
  const moreLabel = moreActive
    ? getPlatformLabel(activePlatform, locale)
    : 'More';
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const menuId = useId();
  const overflowMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMoreOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        overflowMenuRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsMoreOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreOpen]);

  return (
    <div
      className="flex min-w-0 items-stretch"
      data-platform-header-tabs="true"
    >
      <div
        aria-label="Platform"
        className="flex min-w-0 flex-1 items-stretch gap-6 overflow-hidden"
        role="tablist"
      >
        {primaryPlatforms.map((platform) => (
          <button
            aria-selected={activePlatform === platform}
            className={cn(
              'relative flex h-12 shrink-0 items-center px-0 text-[15px] font-medium text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink-1)]',
              'after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[color:var(--ink-1)] after:opacity-0 after:transition-opacity',
              activePlatform === platform &&
                'text-[color:var(--ink-1)] after:opacity-100',
            )}
            key={platform}
            onClick={() => onValueChange(platform)}
            role="tab"
            type="button"
          >
            {getPlatformLabel(platform, locale)}
          </button>
        ))}
      </div>
      {overflowPlatforms.length > 0 ? (
        <div className="relative ml-6 shrink-0" ref={overflowMenuRef}>
          <button
            aria-controls={isMoreOpen ? menuId : undefined}
            aria-expanded={isMoreOpen}
            aria-haspopup="menu"
            aria-label="More platforms"
            className={cn(
              'relative flex h-12 items-center gap-2 border-l border-[color:var(--line-soft)] pl-6 pr-1 text-[15px] font-medium text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink-1)]',
              'after:absolute after:right-1 after:bottom-[-1px] after:left-6 after:h-0.5 after:bg-[color:var(--ink-1)] after:opacity-0 after:transition-opacity',
              moreActive && 'text-[color:var(--ink-1)] after:opacity-100',
            )}
            data-state={moreActive ? 'active' : 'inactive'}
            onClick={() => setIsMoreOpen((isOpen) => !isOpen)}
            type="button"
          >
            {moreLabel}
            <ChevronDownIcon
              aria-hidden="true"
              className={cn(
                'size-4 transition-transform',
                isMoreOpen && 'rotate-180',
              )}
            />
          </button>
          {isMoreOpen ? (
            <div
              className="absolute top-full right-0 z-30 mt-2 min-w-52 rounded-lg border border-[color:var(--line-soft)] bg-card p-2 shadow-xl"
              id={menuId}
              role="menu"
            >
              {overflowPlatforms.map((platform) => (
                <button
                  className={cn(
                    'flex w-full items-center rounded-md px-3 py-2 text-left text-[15px] text-[color:var(--ink-2)] transition-colors hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]',
                    activePlatform === platform &&
                      'bg-[color:var(--docs-soft-fill)] text-[color:var(--ink-1)]',
                  )}
                  key={platform}
                  onClick={() => {
                    onValueChange(platform);
                    setIsMoreOpen(false);
                  }}
                  role="menuitem"
                  type="button"
                >
                  {getPlatformLabel(platform, locale)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function sortHeaderOverflowPlatforms(platforms: PlatformKey[]) {
  const preferred = HEADER_OVERFLOW_PLATFORMS.filter((platform) =>
    platforms.includes(platform),
  );
  const remaining = platforms.filter(
    (platform) => !preferred.includes(platform),
  );

  return [...preferred, ...remaining];
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
