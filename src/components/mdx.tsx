import { createLink } from '@tanstack/react-router';
import {
  type Accordion as FumadocsAccordion,
  Accordions as FumadocsAccordions,
} from 'fumadocs-ui/components/accordion';
import { Card as FumadocsCard } from 'fumadocs-ui/components/card';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import {
  Tab as FumadocsTab,
  Tabs as FumadocsTabs,
  TabsContent as FumadocsTabsContent,
  TabsList as FumadocsTabsList,
  TabsTrigger as FumadocsTabsTrigger,
} from 'fumadocs-ui/components/tabs';
import {
  AccordionContent as FumadocsAccordionContent,
  AccordionHeader as FumadocsAccordionHeader,
  AccordionItem as FumadocsAccordionItem,
  AccordionTrigger as FumadocsAccordionTrigger,
} from 'fumadocs-ui/components/ui/accordion';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { ArrowRightIcon, Check, CopyCheckIcon, LinkIcon } from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import {
  type AnchorHTMLAttributes,
  Children,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  createContext,
  createElement,
  type Dispatch,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useResourceAccountGuidance } from '@/components/account-guidance/AccountGuidance';
import { getChineseAccountGuidanceResource } from '@/components/account-guidance/resource-registry';
import {
  Callout as FumadocsCallout,
  CalloutContainer as FumadocsCalloutContainer,
} from '@/components/Callout';
import { DocsCodeBlock as Pre } from '@/components/DocsCodeBlock';
import { DocsLinkIcon } from '@/components/DocsLinkIcon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/cn';
import {
  DOCS_HASH_TARGET_EVENT,
  findDocsHeadingForHash,
  getActiveDocsScrollContainer,
  getDocsHashHref,
  scrollDocsHashTargetAfterLayout,
} from '@/lib/docs-hash';
import {
  type NormalizedDocsHref,
  normalizeDocsHref,
} from '@/lib/docs-link-normalize';
import { PLATFORM_PREFERENCE_EVENT } from '@/lib/platforms/preference';
import { buildPlatformPathname } from '@/lib/platforms/route';
import {
  ApiReturns,
  ApiReturnType,
  ApiSignature,
  Parameter,
  ParameterList,
  ParameterType,
} from './mdx/ApiReference';
import { DocsHeading } from './mdx/DocsHeading';
import { DocsTable } from './mdx/DocsTable';
import { PlanCards, PricingCards } from './mdx/PlanCards';
import {
  PlatformInline,
  PlatformProcessedMarker,
  PlatformStructured,
} from './mdx/PlatformContent';
import {
  PlatformPanel,
  PlatformTabsGroup,
  usePlatformPageContext,
} from './mdx/PlatformTabsGroup';
import { RepositoryCardTitle } from './mdx/RepositoryCardTitle';
import { RTCMinutesCalculator } from './mdx/RTCMinutesCalculator';
import { getReleaseNoteCategoryIcon } from './mdx/release-note-category';

type MDXContext = {
  contentPath?: string;
  locale?: string;
};

const FumadocsAnchor = defaultMdxComponents.a;
const FumadocsCards = defaultMdxComponents.Cards as ComponentType<
  ComponentProps<'div'>
>;
const FumadocsCodeBlockTab = defaultMdxComponents.CodeBlockTab;
const FumadocsCodeBlockTabs = defaultMdxComponents.CodeBlockTabs;
const FumadocsCodeBlockTabsList = defaultMdxComponents.CodeBlockTabsList;
const FumadocsCalloutTitle = defaultMdxComponents.CalloutTitle;
const FumadocsImage = defaultMdxComponents.img;
const RouterFumadocsAnchor = createLink(FumadocsAnchor);
const RouterFumadocsCard = createLink(FumadocsCard);
const CodeBlockTabsValueContext = createContext<string | undefined>(undefined);
const MdxTabLabelsContext = createContext<Record<string, string>>({});
const MdxTabLabelContext = createContext<string | undefined>(undefined);
const MdxAccordionRootContext = createContext<{
  values: string[];
  reveal: (value: string) => void;
} | null>(null);

type TabsRootProps = ComponentProps<typeof FumadocsTabs> & {
  children?: ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};
type DocsCardProps = ComponentProps<typeof FumadocsCard> &
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'download' | 'rel' | 'target'>;
type DocsCardsProps = ComponentProps<'div'> & {
  columns?: 2 | 3 | 4;
};
type AccordionsRootProps = Omit<
  ComponentProps<typeof FumadocsAccordions>,
  'defaultValue' | 'onValueChange' | 'type' | 'value'
> & {
  children?: ReactNode;
  defaultValue?: string | string[];
  openFirst?: boolean;
  onValueChange?: (value: string | string[]) => void;
  type?: 'single' | 'multiple';
  value?: string | string[];
};
type AccordionHeadingLevel = 2 | 3 | 4;
type AccordionProps = Omit<
  ComponentProps<typeof FumadocsAccordion>,
  'children' | 'id' | 'title' | 'value'
> & {
  children?: ReactNode;
  headingLevel?: AccordionHeadingLevel;
  id?: string;
  title: ReactNode;
  value?: string;
};
type CodeBlockTabsRootProps = ComponentProps<typeof FumadocsCodeBlockTabs> & {
  children?: ReactNode;
  defaultValue?: string;
  groupId?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};
type CalloutProps = ComponentProps<typeof FumadocsCallout>;
type CalloutContainerProps = ComponentProps<typeof FumadocsCalloutContainer>;
type PreProps = ComponentProps<typeof Pre>;
type TabValueElement = ReactElement<{
  children?: ReactNode;
  value?: unknown;
}>;

const ControlledFumadocsTabs = FumadocsTabs as ComponentType<TabsRootProps>;
const ControlledFumadocsAccordions =
  FumadocsAccordions as ComponentType<AccordionsRootProps>;

type ActiveAccordion = {
  rootId: string;
  value: string;
};

type AccordionPageState = {
  accordionResetKey: number;
  activeAccordion?: ActiveAccordion;
  codeBlockTabValues: Record<string, string>;
  setActiveAccordion: Dispatch<SetStateAction<ActiveAccordion | undefined>>;
  setCodeBlockTabValues: Dispatch<SetStateAction<Record<string, string>>>;
};

const AccordionPageStateContext = createContext<AccordionPageState | undefined>(
  undefined,
);

function Accordion({
  children,
  headingLevel,
  id,
  title,
  value = String(title),
  ...props
}: AccordionProps) {
  const accordionRoot = useContext(MdxAccordionRootContext);
  const [standaloneValue, setStandaloneValue] = useState(value);
  const contentRef = useRef<HTMLElement>(null);
  const expanded = accordionRoot
    ? accordionRoot.values.includes(value)
    : standaloneValue === value;
  const reveal = useEffectEvent(() => {
    if (accordionRoot) accordionRoot.reveal(value);
    else setStandaloneValue(value);
  });
  useLayoutEffect(() => {
    const element = contentRef.current;
    if (headingLevel === undefined || !element) return;
    const supportsBeforeMatch = Reflect.has(element, 'onbeforematch');
    if (expanded) {
      element.removeAttribute('hidden');
      element.style.removeProperty('display');
    } else {
      element.setAttribute('hidden', supportsBeforeMatch ? 'until-found' : '');
      // display:block overrides the ordinary hidden attribute in older Safari.
      // Keep SSR and unsupported browsers collapsed until the reader opens it.
      if (supportsBeforeMatch) element.style.removeProperty('display');
      else element.style.display = 'none';
    }
    if (!supportsBeforeMatch) return;
    const handleBeforeMatch = () => reveal();
    element.addEventListener('beforematch', handleBeforeMatch);
    return () => element.removeEventListener('beforematch', handleBeforeMatch);
  }, [expanded, headingLevel]);
  const titleContent = (
    <FumadocsAccordionTrigger>{title}</FumadocsAccordionTrigger>
  );
  const headingTag = headingLevel
    ? (`h${headingLevel}` as 'h2' | 'h3' | 'h4')
    : undefined;
  const headingTitle = headingTag
    ? createElement(
        headingTag,
        {
          className: 'm-0 flex flex-1 text-base font-medium',
          'data-accordion-value': value,
          id,
        },
        titleContent,
      )
    : null;
  const header = headingTitle ? (
    <div className="not-prose flex flex-row items-center text-fd-card-foreground font-medium has-focus-visible:bg-fd-accent">
      {headingTitle}
      {id ? <AccordionCopyButton id={id} /> : null}
    </div>
  ) : (
    <FumadocsAccordionHeader id={id} data-accordion-value={value}>
      {titleContent}
      {id ? <AccordionCopyButton id={id} /> : null}
    </FumadocsAccordionHeader>
  );

  const body = (
    <div className="px-4 pb-2 text-[0.9375rem] prose-no-margin">{children}</div>
  );
  const accordionItem = (
    <FumadocsAccordionItem value={value} {...props}>
      {header}
      <FumadocsAccordionContent
        data-toc-hidden={headingLevel !== undefined ? 'true' : undefined}
        forceMount={headingLevel !== undefined ? true : undefined}
      >
        {headingLevel === undefined
          ? body
          : // A custom element preserves the until-found string when enhanced
            // after hydration; SSR stays collapsed without browser assumptions.
            createElement(
              'docs-accordion-body',
              {
                className: 'block',
                hidden: expanded ? undefined : '',
                style: expanded ? undefined : { display: 'none' },
                ref: contentRef,
              },
              body,
            )}
      </FumadocsAccordionContent>
    </FumadocsAccordionItem>
  );

  if (!accordionRoot) {
    return (
      <ControlledFumadocsAccordions
        onValueChange={(next) =>
          setStandaloneValue(typeof next === 'string' ? next : '')
        }
        type="single"
        value={standaloneValue}
      >
        {accordionItem}
      </ControlledFumadocsAccordions>
    );
  }

  return accordionItem;
}

function AccordionCopyButton({ id }: { id: string }) {
  const { t } = useTranslation('common');
  const platform = usePlatformPageContext()?.activePlatform;
  const [checked, onClick] = useCopyButton(() => {
    const url = new URL(getDocsHashHref(`#${id}`), window.location.href);
    if (platform) {
      url.pathname = buildPlatformPathname(url.pathname, platform);
      url.searchParams.delete('platform');
    }
    return navigator.clipboard.writeText(url.toString());
  });

  return (
    <button
      type="button"
      aria-label={t('docs.copyLink')}
      className={cn(
        buttonVariants({
          color: 'ghost',
          className: 'text-fd-muted-foreground me-2',
        }),
      )}
      onClick={onClick}
    >
      {checked ? (
        <Check className="size-3.5" />
      ) : (
        <LinkIcon className="size-3.5" />
      )}
    </button>
  );
}

function firstVersionValue(children: ReactNode): string | undefined {
  let first: string | undefined;

  Children.forEach(children, (child) => {
    if (first || !isValidElement<{ children?: ReactNode }>(child)) {
      return;
    }

    if (child.type === Accordion) {
      const { headingLevel, title, value } = child.props as AccordionProps;
      if (headingLevel) {
        first = value ?? String(title);
      }
    } else {
      first = firstVersionValue(child.props.children);
    }
  });

  return first;
}

export function MDXAccordionProvider({ children }: { children: ReactNode }) {
  const [activeAccordion, setActiveAccordion] = useState<ActiveAccordion>();
  const [accordionResetKey, setAccordionResetKey] = useState(0);
  const [codeBlockTabValues, setCodeBlockTabValues] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const resetActiveAccordion = () => {
      setActiveAccordion(undefined);
      setAccordionResetKey((current) => current + 1);
    };

    window.addEventListener(PLATFORM_PREFERENCE_EVENT, resetActiveAccordion);

    return () => {
      window.removeEventListener(
        PLATFORM_PREFERENCE_EVENT,
        resetActiveAccordion,
      );
    };
  }, []);

  const value = useMemo(
    () => ({
      accordionResetKey,
      activeAccordion,
      codeBlockTabValues,
      setActiveAccordion,
      setCodeBlockTabValues,
    }),
    [accordionResetKey, activeAccordion, codeBlockTabValues],
  );

  return (
    <AccordionPageStateContext value={value}>
      {children}
    </AccordionPageStateContext>
  );
}

function escapeTabValue(value: string) {
  return value.toLowerCase().replace(/\s/, '-');
}

function DocsCallout(props: CalloutProps) {
  const isSdkCompliance = props.title === 'SDK 合规信息公示';

  if (!isSdkCompliance) {
    return <FumadocsCallout {...props} />;
  }

  return (
    <div data-sdk-compliance="true">
      <FumadocsCallout {...props} />
    </div>
  );
}

function DocsCalloutContainer(props: CalloutContainerProps) {
  const isSdkCompliance = hasSdkComplianceCalloutTitle(props.children);

  if (!isSdkCompliance) {
    return <FumadocsCalloutContainer {...props} />;
  }

  return (
    <div data-sdk-compliance="true">
      <FumadocsCalloutContainer {...props} />
    </div>
  );
}

export function createDocsTableComponent(locale?: string) {
  return function LocalizedDocsTable(props: ComponentProps<typeof DocsTable>) {
    return <DocsTable {...props} locale={locale} />;
  };
}

function hasSdkComplianceCalloutTitle(children: ReactNode): boolean {
  let found = false;

  Children.forEach(children, (child) => {
    if (found || !isValidElement(child)) {
      return;
    }

    const element = child as ReactElement<{ children?: ReactNode }>;

    if (
      element.type === FumadocsCalloutTitle &&
      getPlainText(element.props.children) === 'SDK 合规信息公示'
    ) {
      found = true;
      return;
    }

    if (hasSdkComplianceCalloutTitle(element.props.children)) {
      found = true;
    }
  });

  return found;
}

function getPlainText(value: ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(getPlainText).join('');
  }

  if (isValidElement(value)) {
    const element = value as ReactElement<{ children?: ReactNode }>;

    return getPlainText(element.props.children);
  }

  return '';
}

function collectTabValues(children: ReactNode, values: string[] = []) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    const element = child as TabValueElement;

    if (element.type === Tabs) {
      return;
    }

    const value = element.props.value;

    if (typeof value === 'string' && !values.includes(value)) {
      values.push(value);
    }

    collectTabValues(element.props.children, values);
  });

  return values;
}

function collectTabLabels(
  children: ReactNode,
  labels: Record<string, string> = {},
) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    const element = child as TabValueElement;

    if (element.type === Tabs) {
      return;
    }

    const value = element.props.value;
    const label = getStaticTabLabel(element.props.children);

    if (
      element.type === FumadocsTabsTrigger &&
      typeof value === 'string' &&
      label
    ) {
      labels[value] = label;
    }

    collectTabLabels(element.props.children, labels);
  });

  return labels;
}

function getStaticTabLabel(children: ReactNode): string | undefined {
  const label = Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }

      if (isValidElement(child)) {
        return (
          getStaticTabLabel((child as TabValueElement).props.children) ?? ''
        );
      }

      return '';
    })
    .join('')
    .trim();

  return label || undefined;
}

function useTabValues({
  children,
  items,
}: {
  children?: ReactNode;
  items?: string[];
}) {
  return useMemo(() => {
    if (items?.length) {
      return items.map(escapeTabValue);
    }

    return collectTabValues(children);
  }, [children, items]);
}

function useSafeTabValue({
  defaultValue,
  onValueChange,
  value,
  values,
}: {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
  values: string[];
}) {
  const validValues = useMemo(() => new Set(values), [values]);
  const fallbackValue = defaultValue ?? values.at(0);
  const initialValue =
    value ??
    (defaultValue && validValues.has(defaultValue)
      ? defaultValue
      : fallbackValue);
  const [internalValue, setInternalValue] = useState(initialValue);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;
  const safeValue =
    selectedValue && (validValues.size === 0 || validValues.has(selectedValue))
      ? selectedValue
      : fallbackValue;

  useEffect(() => {
    if (!isControlled && safeValue !== internalValue) {
      setInternalValue(safeValue);
    }
  }, [internalValue, isControlled, safeValue]);

  function setSafeValue(nextValue: string) {
    const next =
      validValues.size === 0 || validValues.has(nextValue)
        ? nextValue
        : fallbackValue;

    if (!next) {
      return;
    }

    if (!isControlled) {
      setInternalValue(next);
    }

    onValueChange?.(next);
  }

  return {
    safeValue,
    setSafeValue,
  };
}

function Tabs({
  children,
  className,
  defaultValue,
  items,
  onValueChange,
  onMouseDownCapture,
  onKeyDownCapture,
  onFocusCapture,
  ref,
  value,
  ...props
}: TabsRootProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<{
    list: HTMLElement;
    top: number;
    owner: HTMLElement | null;
    expiry: number;
    value: string | undefined;
  } | null>(null);
  const setRootRef = useCallback(
    (element: HTMLDivElement | null) => {
      rootRef.current = element;
      assignRef(ref, element);
    },
    [ref],
  );
  const values = useTabValues({ children, items });
  const labels = useMemo(() => {
    const collected = collectTabLabels(children);

    for (const item of items ?? []) {
      collected[escapeTabValue(item)] ??= item;
    }

    return collected;
  }, [children, items]);
  const { safeValue, setSafeValue } = useSafeTabValue({
    defaultValue,
    onValueChange,
    value,
    values,
  });

  function captureScrollAnchor(target: EventTarget | null) {
    const root = rootRef.current;
    const tab =
      target instanceof Element
        ? target.closest<HTMLElement>('[role="tab"]')
        : null;
    if (
      !props.groupId ||
      !root ||
      !tab ||
      tab.closest('[data-mdx-tabs-root]') !== root ||
      tab.getAttribute('aria-selected') === 'true' ||
      scrollAnchorRef.current
    )
      return;
    const list = tab.closest<HTMLElement>('[role="tablist"]');
    if (!list) return;
    let owner = list.parentElement;
    while (
      owner &&
      owner !== document.body &&
      owner !== document.documentElement
    ) {
      const style = window.getComputedStyle(owner);
      if (
        /(auto|scroll|overlay)/.test(style.overflowY || style.overflow) &&
        owner.scrollHeight > owner.clientHeight
      )
        break;
      owner = owner.parentElement;
    }
    const anchor = {
      list,
      top: list.getBoundingClientRect().top,
      owner:
        owner === document.body || owner === document.documentElement
          ? null
          : owner,
      expiry: 0,
      value: safeValue,
    };
    scrollAnchorRef.current = anchor;
    // Only the initiating input's commit may compensate. A later task, storage
    // update or hash activation must not inherit a stale reading position.
    anchor.expiry = window.setTimeout(() => {
      if (scrollAnchorRef.current === anchor) scrollAnchorRef.current = null;
    }, 0);
  }

  useLayoutEffect(() => {
    const anchor = scrollAnchorRef.current;
    scrollAnchorRef.current = null;
    if (!anchor) return;
    window.clearTimeout(anchor.expiry);
    if (anchor.value === safeValue || !anchor.list.isConnected) return;
    // Reading layout also lets native scroll anchoring settle. Correct only
    // the residual displacement, so already-anchored browsers do not jump twice.
    const delta = anchor.list.getBoundingClientRect().top - anchor.top;
    if (Math.abs(delta) < 1) return;
    if (anchor.owner) {
      anchor.owner.scrollTo({
        top: anchor.owner.scrollTop + delta,
        behavior: 'instant',
      });
    } else {
      window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' });
    }
  }, [safeValue]);

  useLayoutEffect(
    () => () => {
      if (scrollAnchorRef.current)
        window.clearTimeout(scrollAnchorRef.current.expiry);
      scrollAnchorRef.current = null;
    },
    [],
  );

  const revealHashTab = useEffectEvent((url: string) => {
    const root = rootRef.current;
    const target = findDocsHeadingForHash(url);
    if (!root || !target || !root.contains(target)) return;

    // Fumadocs' literal fragment lookup misses percent-encoded Chinese IDs.
    // Activate this root's ancestor panel, including when tabs are nested.
    for (
      let panel: HTMLElement | null = target;
      panel && panel !== root;
      panel = panel.parentElement
    ) {
      const tabValue = panel.getAttribute('data-mdx-tab-value');
      if (tabValue && panel.closest('[data-mdx-tabs-root]') === root) {
        if (props.groupId) {
          sessionStorage.setItem(props.groupId, tabValue);
          if (props.persist) localStorage.setItem(props.groupId, tabValue);
        }
        setSafeValue(tabValue);
        return;
      }
    }
  });

  useEffect(() => {
    const applyCurrentHash = () => revealHashTab(window.location.hash);
    const handleHashTarget = (event: Event) => {
      const url = (event as CustomEvent<string>).detail;
      revealHashTab(typeof url === 'string' ? url : window.location.hash);
    };
    applyCurrentHash();
    window.addEventListener('hashchange', applyCurrentHash);
    window.addEventListener(DOCS_HASH_TARGET_EVENT, handleHashTarget);
    return () => {
      window.removeEventListener('hashchange', applyCurrentHash);
      window.removeEventListener(DOCS_HASH_TARGET_EVENT, handleHashTarget);
    };
  }, []);

  return (
    <MdxTabLabelsContext value={labels}>
      <ControlledFumadocsTabs
        {...props}
        data-mdx-tabs-root=""
        ref={setRootRef}
        className={cn('bg-fd-card', className)}
        defaultValue={defaultValue}
        items={items}
        onValueChange={setSafeValue}
        onMouseDownCapture={(event) => {
          onMouseDownCapture?.(event);
          if (!event.defaultPrevented && event.button === 0 && !event.ctrlKey)
            captureScrollAnchor(event.target);
        }}
        onKeyDownCapture={(event) => {
          onKeyDownCapture?.(event);
          if (
            !event.defaultPrevented &&
            (event.key === 'Enter' || event.key === ' ')
          )
            captureScrollAnchor(event.target);
        }}
        onFocusCapture={(event) => {
          onFocusCapture?.(event);
          if (!event.defaultPrevented) captureScrollAnchor(event.target);
        }}
        value={safeValue}
      >
        {children}
      </ControlledFumadocsTabs>
    </MdxTabLabelsContext>
  );
}

function getCodeBlockTabsStateKey({
  groupId,
  values,
}: {
  groupId?: string;
  values: string[];
}) {
  if (groupId) {
    return `group:${groupId}`;
  }

  if (values.length === 0) {
    return undefined;
  }

  return `values:${[...values].sort().join('\u001f')}`;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    (ref as { current: T | null }).current = value;
  }
}

const VERSION_HEADING_SELECTOR =
  'h2[data-accordion-value], h3[data-accordion-value], h4[data-accordion-value]';

function Accordions({
  defaultValue,
  openFirst = false,
  onClickCapture,
  onValueChange,
  ref,
  type = 'single',
  value,
  children,
  ...props
}: AccordionsRootProps) {
  const rootId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const appliedDefaultValueRef = useRef(false);
  const pendingScrollAnchorRef = useRef<{
    element: HTMLElement;
    top: number;
  } | null>(null);
  const pageState = useContext(AccordionPageStateContext);
  const setActiveAccordion = pageState?.setActiveAccordion;
  const firstValue = useMemo(
    () => (openFirst ? firstVersionValue(children) : undefined),
    [children, openFirst],
  );
  const defaultSingleValue =
    typeof defaultValue === 'string' ? defaultValue : undefined;
  const defaultMultipleValue = useMemo(
    () =>
      Array.isArray(defaultValue)
        ? defaultValue
        : typeof defaultValue === 'string'
          ? [defaultValue]
          : firstValue
            ? [firstValue]
            : [],
    [defaultValue, firstValue],
  );
  const controlledSingleValue = typeof value === 'string' ? value : undefined;
  const controlledMultipleValue = Array.isArray(value) ? value : undefined;
  const [localValue, setLocalValue] = useState(defaultSingleValue ?? '');
  const [localMultipleValue, setLocalMultipleValue] =
    useState(defaultMultipleValue);
  const appliedDefaultResetKeyRef = useRef(0);
  const setRootRef = useCallback(
    (element: HTMLDivElement | null) => {
      rootRef.current = element;
      assignRef(ref as Ref<HTMLDivElement> | undefined, element);
    },
    [ref],
  );

  const pageControlledValue =
    pageState?.activeAccordion?.rootId === rootId
      ? pageState.activeAccordion.value
      : '';
  const selectedValue =
    controlledSingleValue ?? (pageState ? pageControlledValue : localValue);
  const selectedMultipleValue = controlledMultipleValue ?? localMultipleValue;

  const captureVersionScrollAnchor = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target instanceof Element) {
        const heading = event.target.closest<HTMLElement>(
          VERSION_HEADING_SELECTOR,
        );

        if (heading && rootRef.current?.contains(heading)) {
          pendingScrollAnchorRef.current = {
            element: heading,
            top: heading.getBoundingClientRect().top,
          };
        }
      }

      onClickCapture?.(event);
    },
    [onClickCapture],
  );

  const restoreVersionScrollAnchor = useCallback(() => {
    const anchor = pendingScrollAnchorRef.current;

    if (!anchor?.element.isConnected) {
      pendingScrollAnchorRef.current = null;
      return;
    }

    const delta = anchor.element.getBoundingClientRect().top - anchor.top;

    if (Math.abs(delta) < 0.5) {
      return;
    }

    const scrollContainer = getActiveDocsScrollContainer();

    if (scrollContainer) {
      scrollContainer.scrollTo({
        behavior: 'auto',
        top: scrollContainer.scrollTop + delta,
      });
    } else {
      window.scrollTo({
        behavior: 'auto',
        top: window.scrollY + delta,
      });
    }
  }, []);

  useEffect(() => {
    if (type !== 'single' || !pendingScrollAnchorRef.current) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (selectedValue !== undefined) {
        restoreVersionScrollAnchor();
      }
    });
    const finalCorrection = window.setTimeout(() => {
      if (selectedValue !== undefined) {
        restoreVersionScrollAnchor();
      }
      pendingScrollAnchorRef.current = null;
    }, 300);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(finalCorrection);
    };
  }, [restoreVersionScrollAnchor, selectedValue, type]);

  useEffect(() => {
    if (
      pageState &&
      pageState.accordionResetKey !== appliedDefaultResetKeyRef.current
    ) {
      appliedDefaultValueRef.current = false;
      appliedDefaultResetKeyRef.current = pageState.accordionResetKey;
      if (type === 'multiple' && openFirst && value === undefined) {
        setLocalMultipleValue(defaultMultipleValue);
      }
    }

    if (
      !(
        type === 'single' &&
        pageState &&
        defaultSingleValue &&
        !appliedDefaultValueRef.current &&
        value === undefined
      )
    ) {
      return;
    }

    appliedDefaultValueRef.current = true;
    pageState.setActiveAccordion(
      (current) => current ?? { rootId, value: defaultSingleValue },
    );
  }, [
    defaultMultipleValue,
    defaultSingleValue,
    openFirst,
    pageState,
    rootId,
    type,
    value,
  ]);

  const applyHash = useEffectEvent((url: string) => {
    const id = url.startsWith('#') ? url.substring(1) : url;
    const element = rootRef.current;

    if (!element || id.length === 0) {
      return;
    }

    const selected = findDocsHeadingForHash(`#${id}`);

    if (!selected || !element.contains(selected)) {
      return;
    }

    const accordionContent = selected.closest<HTMLElement>(
      '[role="region"][data-toc-hidden="true"]',
    );
    const accordionHeading =
      accordionContent?.parentElement?.querySelector<HTMLElement>(
        VERSION_HEADING_SELECTOR,
      );
    const sectionHeadings = selected.matches('section')
      ? selected.querySelectorAll<HTMLElement>(VERSION_HEADING_SELECTOR)
      : [];
    const hashValue =
      selected.getAttribute('data-accordion-value') ??
      accordionHeading?.getAttribute('data-accordion-value') ??
      (sectionHeadings.length === 1
        ? sectionHeadings[0].getAttribute('data-accordion-value')
        : null);

    if (!hashValue) {
      return;
    }

    if (type === 'multiple') {
      const nextValues = selectedMultipleValue.includes(hashValue)
        ? selectedMultipleValue
        : [...selectedMultipleValue, hashValue];

      if (value === undefined) {
        setLocalMultipleValue(nextValues);
      }

      onValueChange?.(nextValues);
      return;
    }

    if (value === undefined) {
      if (setActiveAccordion) {
        setActiveAccordion((current) =>
          current?.rootId === rootId && current.value === hashValue
            ? current
            : { rootId, value: hashValue },
        );
      } else {
        setLocalValue(hashValue);
      }
    }

    onValueChange?.(hashValue);
  });

  useEffect(() => {
    if (type !== 'single' && type !== 'multiple') {
      return;
    }

    const applyCurrentHash = () => {
      applyHash(window.location.hash);
    };
    const handleHashTarget = (event: Event) => {
      const url = (event as CustomEvent<string>).detail;
      applyHash(typeof url === 'string' ? url : window.location.hash);
    };

    applyCurrentHash();
    window.addEventListener('hashchange', applyCurrentHash);
    window.addEventListener(DOCS_HASH_TARGET_EVENT, handleHashTarget);

    return () => {
      window.removeEventListener('hashchange', applyCurrentHash);
      window.removeEventListener(DOCS_HASH_TARGET_EVENT, handleHashTarget);
    };
  }, [type]);

  function handleValueChange(nextValue: string | string[]) {
    if (type === 'multiple') {
      const nextMultipleValue = Array.isArray(nextValue) ? nextValue : [];

      if (value === undefined) {
        setLocalMultipleValue(nextMultipleValue);
      }

      onValueChange?.(nextMultipleValue);
      return;
    }

    const nextSingleValue = typeof nextValue === 'string' ? nextValue : '';

    if (value === undefined) {
      if (pageState) {
        pageState.setActiveAccordion(
          nextSingleValue ? { rootId, value: nextSingleValue } : undefined,
        );
      } else {
        setLocalValue(nextSingleValue);
      }
    }

    onValueChange?.(nextSingleValue);
  }

  const accordionRoot =
    type === 'multiple' ? (
      <ControlledFumadocsAccordions
        {...props}
        defaultValue={defaultMultipleValue}
        onClickCapture={onClickCapture}
        onValueChange={handleValueChange}
        ref={setRootRef}
        type={type}
        value={selectedMultipleValue}
      >
        {children}
      </ControlledFumadocsAccordions>
    ) : (
      <ControlledFumadocsAccordions
        {...props}
        defaultValue={defaultSingleValue}
        onClickCapture={captureVersionScrollAnchor}
        onValueChange={handleValueChange}
        ref={setRootRef}
        type={type}
        value={selectedValue}
      >
        {children}
      </ControlledFumadocsAccordions>
    );

  return (
    <MdxAccordionRootContext
      value={{
        values: type === 'multiple' ? selectedMultipleValue : [selectedValue],
        reveal: (target) =>
          handleValueChange(
            type === 'multiple'
              ? selectedMultipleValue.includes(target)
                ? selectedMultipleValue
                : [...selectedMultipleValue, target]
              : target,
          ),
      }}
    >
      {accordionRoot}
    </MdxAccordionRootContext>
  );
}

function CodeBlockTabs({
  children,
  className,
  defaultValue,
  groupId,
  onValueChange,
  value,
  ...props
}: CodeBlockTabsRootProps) {
  const pageState = useContext(AccordionPageStateContext);
  const values = useTabValues({ children });
  const stateKey = useMemo(
    () => getCodeBlockTabsStateKey({ groupId, values }),
    [groupId, values],
  );
  const sharedValue =
    value === undefined && stateKey
      ? pageState?.codeBlockTabValues[stateKey]
      : undefined;
  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (value === undefined && stateKey) {
        pageState?.setCodeBlockTabValues((current) => {
          if (current[stateKey] === nextValue) {
            return current;
          }

          return {
            ...current,
            [stateKey]: nextValue,
          };
        });
      }

      onValueChange?.(nextValue);
    },
    [onValueChange, pageState, stateKey, value],
  );
  const { safeValue, setSafeValue } = useSafeTabValue({
    defaultValue,
    onValueChange: handleValueChange,
    value: value ?? sharedValue,
    values,
  });

  useEffect(() => {
    if (!(pageState && stateKey && value === undefined && safeValue)) {
      return;
    }

    pageState.setCodeBlockTabValues((current) => {
      if (current[stateKey] !== undefined) {
        return current;
      }

      return {
        ...current,
        [stateKey]: safeValue,
      };
    });
  }, [pageState, safeValue, stateKey, value]);

  return (
    <FumadocsCodeBlockTabs
      {...props}
      className={cn('overflow-hidden bg-fd-card', className)}
      defaultValue={defaultValue}
      groupId={groupId}
      onValueChange={setSafeValue}
      value={safeValue}
    >
      <CodeBlockTabsValueContext value={safeValue}>
        {children}
      </CodeBlockTabsValueContext>
    </FumadocsCodeBlockTabs>
  );
}

function TabsContent({
  children,
  className,
  ...props
}: ComponentProps<typeof FumadocsTabsContent>) {
  const tabValue = typeof props.value === 'string' ? props.value : undefined;
  const tabLabels = useContext(MdxTabLabelsContext);
  const tabLabel = tabValue ? tabLabels[tabValue] : undefined;

  return (
    <MdxTabLabelContext value={tabLabel}>
      <FumadocsTabsContent
        data-mdx-tab-value={tabValue}
        className={cn(
          '[&>figure:only-child]:bg-fd-card [&>figure:only-child]:shadow-none',
          className,
        )}
        forceMount
        {...props}
      >
        {children}
      </FumadocsTabsContent>
    </MdxTabLabelContext>
  );
}

type MdxHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

function TabAwareHeading({
  as,
  children,
  id,
  className,
  contentPath,
  ...props
}: ComponentProps<'h2'> & { as: MdxHeadingLevel; contentPath?: string }) {
  const { t } = useTranslation('common');
  const tabLabel = useContext(MdxTabLabelContext);
  const activePlatform = usePlatformPageContext()?.activePlatform;
  const hash = id ? `#${id}` : '';
  const [href, setHref] = useState(hash);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Platform changes update the URL while the heading ID stays the same.
  useEffect(() => {
    setHref(getDocsHashHref(hash));
  }, [hash, activePlatform]);
  const [checked, onCopy] = useCopyButton(() => {
    if (!id) return;
    return navigator.clipboard.writeText(
      new URL(getDocsHashHref(hash), window.location.href).href,
    );
  });
  const labelId = useId();
  const icon = getReleaseNoteCategoryIcon(contentPath, headingLabel(children));
  const content = (
    <span id={labelId}>
      {icon && (
        <img
          alt=""
          aria-hidden="true"
          className="not-prose mr-3 inline-block h-8 w-9 align-middle"
          width={36}
          height={32}
          src={icon}
        />
      )}
      {children}
      {tabLabel ? <span className="sr-only"> ({tabLabel})</span> : null}
    </span>
  );
  if (!id || href === hash) {
    return (
      <DocsHeading as={as} {...props} id={id} className={className}>
        {content}
      </DocsHeading>
    );
  }
  // Fumadocs Heading has no href/copy-URL override. Adapt only platform anchors,
  // preserving its heading chrome and leaving ordinary headings untouched.
  const Heading = as;

  return (
    <Heading
      {...props}
      aria-labelledby={labelId}
      id={id}
      className={cn(
        id && 'group/heading flex scroll-m-28 flex-row items-center gap-1',
        className,
      )}
    >
      {id ? (
        <>
          <a
            data-card=""
            href={href}
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              scrollDocsHashTargetAfterLayout(hash, { behavior: 'auto' });
            }}
          >
            {content}
          </a>
          <button
            type="button"
            aria-label={t('docs.copyLink')}
            className={cn(
              buttonVariants({
                variant: 'ghost',
                size: 'icon-xs',
              }),
              'not-prose shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100',
            )}
            onClick={onCopy}
          >
            {checked ? <CopyCheckIcon /> : <LinkIcon />}
          </button>
        </>
      ) : (
        children
      )}
    </Heading>
  );
}

function headingLabel(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number')
        return String(child);
      return isValidElement<{ children?: ReactNode }>(child)
        ? headingLabel(child.props.children)
        : '';
    })
    .join('');
}

function createDocsHeading(as: MdxHeadingLevel, contentPath?: string) {
  return (props: ComponentProps<'h2'>) => (
    <TabAwareHeading as={as} contentPath={contentPath} {...props} />
  );
}

function CodeBlockTabsList({
  className,
  ...props
}: ComponentProps<typeof FumadocsCodeBlockTabsList>) {
  return (
    <FumadocsCodeBlockTabsList
      className={cn('bg-fd-card', className)}
      {...props}
    />
  );
}

function CodeBlockTab({
  className,
  value,
  ...props
}: ComponentProps<typeof FumadocsCodeBlockTab>) {
  const selectedValue = useContext(CodeBlockTabsValueContext);
  const isInactive = selectedValue !== undefined && selectedValue !== value;

  return (
    <FumadocsCodeBlockTab
      className={cn(
        'p-4 [&>figure]:m-0 [&>figure]:rounded-xl [&>figure]:border [&>figure]:bg-fd-card [&>figure]:shadow-none',
        className,
      )}
      forceMount
      hidden={isInactive}
      value={value}
      {...props}
    />
  );
}

function CommandBlock({
  code,
  language = 'bash',
  locale,
}: {
  code: string;
  language?: string;
  locale?: string;
}) {
  const lineKeys = new Map<string, number>();
  const lines = code
    .replace(/\n$/, '')
    .split('\n')
    .map((line) => {
      const occurrence = (lineKeys.get(line) ?? 0) + 1;
      lineKeys.set(line, occurrence);

      return {
        id: `${line}:${occurrence}`,
        line,
      };
    });

  return (
    <Pre
      className={cn('shiki', `language-${language}`)}
      locale={locale}
    >
      <code className={cn('language-code', `language-${language}`)}>
        {lines.map(({ id, line }) => (
          <span className="line" key={id}>
            {line}
          </span>
        ))}
      </code>
    </Pre>
  );
}

function createDocsAnchor(contentPath?: string) {
  function DocsAnchor({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const normalized =
      typeof href === 'string'
        ? normalizeDocsHref(href, { contentPath })
        : null;
    const normalizedHref = normalized?.href ?? href;

    if (normalized && shouldUseRouterLink(normalized, props)) {
      return (
        <RouterFumadocsAnchor {...props} to={normalized.href}>
          {children}
        </RouterFumadocsAnchor>
      );
    }

    const target =
      props.target ?? (normalized?.kind === 'external' ? '_blank' : undefined);

    return (
      <FumadocsAnchor href={normalizedHref} {...props}>
        {children}
        {children && <DocsLinkIcon href={normalizedHref} target={target} />}
      </FumadocsAnchor>
    );
  }

  return DocsAnchor;
}

function createLegacyDocsLink(contentPath?: string) {
  const DocsAnchor = createDocsAnchor(contentPath);

  function LegacyDocsLink({
    to,
    ...props
  }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    to?: string;
  }) {
    return <DocsAnchor href={to} {...props} />;
  }

  return LegacyDocsLink;
}

function createDocsCard(contentPath?: string) {
  function DocsCard({
    children,
    className,
    href,
    title,
    ...props
  }: DocsCardProps) {
    const startAccountGuidance = useResourceAccountGuidance();
    const normalized =
      typeof href === 'string'
        ? normalizeDocsHref(href, { contentPath })
        : null;
    const normalizedHref = normalized?.href ?? href;
    const guidanceResource =
      typeof title === 'string' && title === '立即体验'
        ? getChineseAccountGuidanceResource(contentPath, href)
        : null;
    const cardProps = guidanceResource
      ? {
          title,
          ...props,
          rel: 'noopener noreferrer',
          target: '_blank' as const,
          onClick: (event: MouseEvent<HTMLAnchorElement>) => {
            props.onClick?.(event);
            startAccountGuidance({
              resourceType: 'demo',
              resourceId: guidanceResource.resourceId,
              label: guidanceResource.label,
              target: guidanceResource.target,
            });
          },
        }
      : { title, ...props };
    const cardClassName = cn(
      'docs-card-surface docs-mdx-card',
      href && 'docs-card-interactive docs-card-link',
      className,
    );
    const content = (
      <>
        {children}
        {href ? (
          <ArrowRightIcon
            aria-hidden="true"
            className="docs-card-arrow absolute right-4 top-4 size-4 text-muted-foreground"
          />
        ) : null}
      </>
    );

    if (normalized && shouldUseRouterLink(normalized, cardProps)) {
      return (
        <RouterFumadocsCard
          {...cardProps}
          className={cardClassName}
          to={normalized.href}
        >
          {content}
        </RouterFumadocsCard>
      );
    }

    return (
      <FumadocsCard
        {...cardProps}
        className={cardClassName}
        href={normalizedHref}
      >
        {content}
      </FumadocsCard>
    );
  }

  return DocsCard;
}

function Cards({ className, columns, ...props }: DocsCardsProps) {
  if (!columns) {
    return <FumadocsCards className={className} {...props} />;
  }

  return (
    <div
      className={cn(
        'grid gap-3 @container',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
        className,
      )}
      {...props}
    />
  );
}

function createPlanCardsComponent(contentPath?: string) {
  function DocsPlanCards(props: ComponentProps<typeof PlanCards>) {
    return <PlanCards {...props} contentPath={contentPath} />;
  }

  return DocsPlanCards;
}

function createPricingCardsComponent(contentPath?: string) {
  function DocsPricingCards(props: ComponentProps<typeof PricingCards>) {
    return <PricingCards {...props} contentPath={contentPath} />;
  }

  return DocsPricingCards;
}

function shouldUseRouterLink(
  normalized: NormalizedDocsHref,
  props:
    | AnchorHTMLAttributes<HTMLAnchorElement>
    | (DocsCardProps & { external?: boolean }),
) {
  if (
    props.download !== undefined ||
    props.target !== undefined ||
    ('external' in props && props.external)
  ) {
    return false;
  }

  const hashIndex = normalized.href.indexOf('#');
  if (
    hashIndex !== -1 &&
    normalized.href.slice(hashIndex + 1).startsWith('//')
  ) {
    return false;
  }

  if (normalized.kind === 'internal-doc') {
    return true;
  }

  return normalized.kind === 'root' && isDocsRouteHref(normalized.href);
}

function isDocsRouteHref(href: string) {
  const [path] = href.split(/[?#]/, 1);

  return (
    path === '/en' ||
    path.startsWith('/en/') ||
    path === '/zh-CN' ||
    path.startsWith('/zh-CN/')
  );
}

function InlineImage({
  alt,
  width,
  height,
  style,
  ...props
}: ComponentProps<'img'>) {
  return (
    <img
      referrerPolicy="no-referrer"
      {...props}
      alt={alt}
      width={width}
      height={height}
      style={{ width, height, ...style }}
      className="not-prose m-0 inline-block h-auto max-w-full align-middle"
    />
  );
}

function ZoomableImage({
  alt = '',
  src,
  displayWidth,
  displayHeight,
  style,
  referrerPolicy = 'no-referrer',
  ...props
}: ComponentProps<'img'> & {
  displayWidth?: CSSProperties['width'];
  displayHeight?: CSSProperties['maxHeight'];
}) {
  const thumbnailStyle =
    displayHeight === undefined
      ? style
      : { ...style, maxHeight: displayHeight, width: 'auto', height: 'auto' };
  if (typeof src !== 'string' || src.length === 0) {
    return (
      <FumadocsImage
        alt={alt}
        src={src}
        referrerPolicy={referrerPolicy}
        {...props}
        style={thumbnailStyle}
      />
    );
  }

  const title = alt || 'Documentation image';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          aria-label={`Zoom image: ${title}`}
          className="block cursor-zoom-in"
          style={
            displayWidth === undefined
              ? undefined
              : { width: displayWidth, maxWidth: '100%' }
          }
          type="button"
        >
          <FumadocsImage
            alt={alt}
            src={src}
            referrerPolicy={referrerPolicy}
            {...props}
            style={thumbnailStyle}
          />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] w-fit max-w-[calc(100vw-2rem)] justify-items-center border-0 bg-transparent p-0 shadow-none sm:max-w-[calc(100vw-2rem)]">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          Enlarged documentation image preview.
        </DialogDescription>
        <img
          alt={alt}
          className="max-h-[calc(100vh-4rem)] max-w-[calc(100vw-4rem)] rounded-md object-contain shadow-2xl"
          src={src}
          referrerPolicy={referrerPolicy}
        />
      </DialogContent>
    </Dialog>
  );
}

// Module-level component types keep local wrapping state when the page remeasures.
const localizedCodeComponents = {
  en: {
    pre: (props: PreProps) => <Pre {...props} locale="en" />,
    CommandBlock: (props: ComponentProps<typeof CommandBlock>) => (
      <CommandBlock {...props} locale="en" />
    ),
  },
  'zh-CN': {
    pre: (props: PreProps) => <Pre {...props} locale="zh-CN" />,
    CommandBlock: (props: ComponentProps<typeof CommandBlock>) => (
      <CommandBlock {...props} locale="zh-CN" />
    ),
  },
};

function getCodeComponents(locale?: string) {
  const normalizedLocale = normalizeLocale(locale);
  return normalizedLocale
    ? localizedCodeComponents[normalizedLocale]
    : { pre: Pre, CommandBlock };
}

export function getMDXComponents(
  components?: MDXComponents,
  context?: MDXContext,
) {
  const DocsTable = createDocsTableComponent(context?.locale);
  const codeComponents = getCodeComponents(context?.locale);
  return {
    ...defaultMdxComponents,
    Callout: DocsCallout,
    CalloutContainer: DocsCalloutContainer,
    table: DocsTable,
    DocsTable,
    img: ZoomableImage,
    DocsImage: ZoomableImage,
    InlineImage,
    h2: createDocsHeading('h2', context?.contentPath),
    h3: createDocsHeading('h3', context?.contentPath),
    h4: createDocsHeading('h4', context?.contentPath),
    h5: createDocsHeading('h5', context?.contentPath),
    h6: createDocsHeading('h6', context?.contentPath),
    a: createDocsAnchor(context?.contentPath),
    Link: createLegacyDocsLink(context?.contentPath),
    Card: createDocsCard(context?.contentPath),
    Cards,
    RepositoryCardTitle,
    CommandBlock: codeComponents.CommandBlock,
    Tabs,
    Tab: FumadocsTab,
    TabsContent,
    TabsList: FumadocsTabsList,
    TabsTrigger: FumadocsTabsTrigger,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTab,
    pre: codeComponents.pre,
    ApiReturns,
    ApiReturnType,
    ApiSignature,
    ParameterList,
    Parameter,
    ParameterType,
    Accordion,
    Accordions,
    File,
    Files,
    Folder,
    Step,
    Steps,
    RTCMinutesCalculator,
    PlanCards: createPlanCardsComponent(context?.contentPath),
    PricingCards: createPricingCardsComponent(context?.contentPath),
    PlatformInline,
    _PlatformProcessedMarker: PlatformProcessedMarker,
    PlatformStructured,
    _PlatformTabsGroup: PlatformTabsGroup,
    _PlatformPanel: PlatformPanel,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

export {
  ApiReturns,
  ApiReturnType,
  ApiSignature,
  Parameter,
  ParameterList,
  ParameterType,
};
