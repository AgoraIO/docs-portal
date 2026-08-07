import { createLink } from '@tanstack/react-router';
import {
  Accordion,
  Accordions as FumadocsAccordions,
} from 'fumadocs-ui/components/accordion';
import { Card as FumadocsCard } from 'fumadocs-ui/components/card';
import {
  type CodeBlockProps,
  CodeBlock as FumadocsCodeBlock,
  Pre as FumadocsCodeBlockPre,
} from 'fumadocs-ui/components/codeblock';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import {
  Tab as FumadocsTab,
  Tabs as FumadocsTabs,
  TabsContent as FumadocsTabsContent,
  TabsList as FumadocsTabsList,
  TabsTrigger as FumadocsTabsTrigger,
} from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import {
  type AnchorHTMLAttributes,
  Children,
  type ComponentProps,
  type ComponentType,
  createContext,
  type Dispatch,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/cn';
import {
  type NormalizedDocsHref,
  normalizeDocsHref,
} from '@/lib/docs-link-normalize';
import { normalizeLocale } from '@/lib/i18n/i18n-config';
import { resources } from '@/lib/i18n/resources';
import { PlanCards, PricingCards } from './mdx/PlanCards';
import {
  PlatformInline,
  PlatformProcessedMarker,
  PlatformStructured,
} from './mdx/PlatformContent';
import { PlatformPanel, PlatformTabsGroup } from './mdx/PlatformTabsGroup';
import { RTCMinutesCalculator } from './mdx/RTCMinutesCalculator';

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
const FumadocsCallout = defaultMdxComponents.Callout;
const FumadocsCalloutContainer = defaultMdxComponents.CalloutContainer;
const FumadocsCalloutTitle = defaultMdxComponents.CalloutTitle;
const FumadocsImage = defaultMdxComponents.img;
const RouterFumadocsAnchor = createLink(FumadocsAnchor);
const RouterFumadocsCard = createLink(FumadocsCard);
const CodeBlockTabsValueContext = createContext<string | undefined>(undefined);
const MdxTabLabelsContext = createContext<Record<string, string>>({});
const MdxTabLabelContext = createContext<string | undefined>(undefined);

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
  onValueChange?: (value: string | string[]) => void;
  type?: 'single' | 'multiple';
  value?: string | string[];
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
type PreProps = CodeBlockProps;
type ParameterListVariant = 'cards' | 'table';
type ParameterListProps = ComponentProps<'div'> & {
  nullable?: boolean;
  optional?: boolean;
  required?: boolean;
  title?: ReactNode;
  variant?: ParameterListVariant;
};
type ParameterProps = ComponentProps<'div'> & {
  children?: ReactNode;
  defaultValue?: ReactNode;
  direction?: ReactNode;
  name?: ReactNode;
  nullable?: boolean;
  optional?: boolean;
  possibleValues?: ReactNode;
  required?: boolean;
  type?: ReactNode;
};
type ParameterTypeProps = ComponentProps<'div'> & {
  children?: ReactNode;
};
type ApiSignatureProps = ComponentProps<'div'> & {
  children?: ReactNode;
  labels?: string;
};
type ApiReturnsProps = ComponentProps<'section'> & {
  children?: ReactNode;
  title?: ReactNode;
};
type ApiReturnTypeProps = ComponentProps<'div'> & {
  children?: ReactNode;
};
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
  activeAccordion?: ActiveAccordion;
  codeBlockTabValues: Record<string, string>;
  setActiveAccordion: Dispatch<SetStateAction<ActiveAccordion | undefined>>;
  setCodeBlockTabValues: Dispatch<SetStateAction<Record<string, string>>>;
};

const AccordionPageStateContext = createContext<AccordionPageState | undefined>(
  undefined,
);
const ParameterListVariantContext =
  createContext<ParameterListVariant>('cards');
const ParameterNestingContext = createContext(0);
const TableParameterDescriptionContext = createContext(false);

export function MDXAccordionProvider({ children }: { children: ReactNode }) {
  const [activeAccordion, setActiveAccordion] = useState<ActiveAccordion>();
  const [codeBlockTabValues, setCodeBlockTabValues] = useState<
    Record<string, string>
  >({});
  const value = useMemo(
    () => ({
      activeAccordion,
      codeBlockTabValues,
      setActiveAccordion,
      setCodeBlockTabValues,
    }),
    [activeAccordion, codeBlockTabValues],
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

function createDocsTableComponent(locale?: string) {
  const normalizedLocale = normalizeLocale(locale) ?? 'en';
  const copy = resources[normalizedLocale].common.docs;

  return function DocsTable({ className, ...props }: ComponentProps<'table'>) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const descriptionId = useId();
    const [hasOverflow, setHasOverflow] = useState(false);
    const [isAtEnd, setIsAtEnd] = useState(false);

    const updateOverflowState = useCallback(() => {
      const element = scrollRef.current;
      if (!element) {
        return;
      }

      const overflow = element.scrollWidth > element.clientWidth + 1;
      setHasOverflow(overflow);
      setIsAtEnd(
        !overflow ||
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
      );
    }, []);

    useEffect(() => {
      updateOverflowState();
      window.addEventListener('resize', updateOverflowState);
      const resizeObserver =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(updateOverflowState);
      if (scrollRef.current) {
        resizeObserver?.observe(scrollRef.current);
      }

      return () => {
        window.removeEventListener('resize', updateOverflowState);
        resizeObserver?.disconnect();
      };
    }, [updateOverflowState]);

    return (
      <div
        className="docs-table-container relative my-6"
        data-table-overflow={hasOverflow ? 'true' : 'false'}
        data-table-scroll-end={isAtEnd ? 'true' : 'false'}
      >
        <section
          aria-describedby={hasOverflow ? descriptionId : undefined}
          aria-label={copy.tableOverflowLabel}
          className="prose-no-margin overflow-auto"
          onScroll={updateOverflowState}
          ref={scrollRef}
          tabIndex={hasOverflow ? 0 : undefined}
        >
          <table className={className} {...props} />
        </section>
        <span className="sr-only" id={descriptionId}>
          {copy.tableOverflowDescription}
        </span>
      </div>
    );
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
  value,
  ...props
}: TabsRootProps) {
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

  return (
    <MdxTabLabelsContext value={labels}>
      <ControlledFumadocsTabs
        {...props}
        className={cn('bg-fd-card', className)}
        defaultValue={defaultValue}
        items={items}
        onValueChange={setSafeValue}
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

function Accordions({
  defaultValue,
  onValueChange,
  ref,
  type = 'single',
  value,
  ...props
}: AccordionsRootProps) {
  const rootId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const appliedDefaultValueRef = useRef(false);
  const appliedHashRef = useRef(false);
  const pageState = useContext(AccordionPageStateContext);
  const defaultSingleValue =
    typeof defaultValue === 'string' ? defaultValue : undefined;
  const controlledSingleValue = typeof value === 'string' ? value : undefined;
  const [localValue, setLocalValue] = useState(defaultSingleValue ?? '');
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

  useEffect(() => {
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
  }, [defaultSingleValue, pageState, rootId, type, value]);

  useEffect(() => {
    if (type !== 'single' || appliedHashRef.current) {
      return;
    }

    appliedHashRef.current = true;

    const id = window.location.hash.substring(1);
    const element = rootRef.current;

    if (!element || id.length === 0) {
      return;
    }

    const selected = document.getElementById(id);

    if (!selected || !element.contains(selected)) {
      return;
    }

    const hashValue = selected.getAttribute('data-accordion-value');

    if (!hashValue) {
      return;
    }

    if (value === undefined) {
      if (pageState) {
        pageState.setActiveAccordion({ rootId, value: hashValue });
      } else {
        setLocalValue(hashValue);
      }
    }

    onValueChange?.(hashValue);
  }, [onValueChange, pageState, rootId, type, value]);

  function handleValueChange(nextValue: string | string[]) {
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

  if (type === 'multiple') {
    return (
      <ControlledFumadocsAccordions
        {...props}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        ref={setRootRef}
        type={type}
        value={value}
      />
    );
  }

  return (
    <ControlledFumadocsAccordions
      {...props}
      defaultValue={defaultSingleValue}
      onValueChange={handleValueChange}
      ref={setRootRef}
      type={type}
      value={selectedValue}
    />
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
      className={cn('bg-fd-card', className)}
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

function Pre({ className, ...props }: PreProps) {
  return (
    <FumadocsCodeBlock
      {...props}
      data-line-numbers
      className={cn('bg-fd-card shadow-none', className)}
      viewportProps={{
        ...props.viewportProps,
        className: cn(
          'overflow-x-hidden overflow-y-auto',
          props.viewportProps?.className,
        ),
      }}
    >
      <FumadocsCodeBlockPre className="w-full max-w-full min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere] break-words">
        {props.children}
      </FumadocsCodeBlockPre>
    </FumadocsCodeBlock>
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
  ...props
}: ComponentProps<'h2'> & { as: MdxHeadingLevel }) {
  const tabLabel = useContext(MdxTabLabelContext);
  const Heading = (defaultMdxComponents[as] ?? as) as ComponentType<
    ComponentProps<'h2'>
  >;

  return (
    <Heading {...props}>
      {children}
      {tabLabel ? <span className="sr-only"> ({tabLabel})</span> : null}
    </Heading>
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
        '[&>figure]:m-0 [&>figure]:rounded-none [&>figure]:border-0 [&>figure]:bg-fd-card [&>figure]:shadow-none',
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
}: {
  code: string;
  language?: string;
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
    <Pre className={cn('shiki', `language-${language}`)}>
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

function ParameterList({
  children,
  className,
  nullable,
  optional,
  required,
  title,
  variant = 'cards',
  ...props
}: ParameterListProps) {
  const requiredState = getRequiredState({ optional, required });
  const isTable = variant === 'table';
  const nestingDepth = useContext(ParameterNestingContext);

  if (isTable && nestingDepth > 0) {
    return (
      <ParameterListVariantContext value={variant}>
        <div
          className={cn('my-3 space-y-3', className)}
          data-parameter-list=""
          data-parameter-nested="true"
          data-parameter-variant={variant}
          {...props}
        >
          {children}
        </div>
      </ParameterListVariantContext>
    );
  }

  return (
    <ParameterListVariantContext value={variant}>
      <section
        className={cn(
          'not-prose my-6 overflow-hidden rounded-lg border border-fd-border bg-fd-card text-sm shadow-sm',
          className,
        )}
        data-parameter-list=""
        data-parameter-variant={variant}
        {...props}
      >
        {title || requiredState || nullable ? (
          <div className="flex flex-wrap items-center gap-2 border-fd-border border-b bg-fd-muted/35 px-4 py-3 font-semibold text-fd-foreground">
            {title ? <span>{title}</span> : null}
            {!isTable ? (
              <ParameterBadges
                requiredState={requiredState}
                nullable={nullable}
              />
            ) : null}
          </div>
        ) : null}
        {isTable ? (
          <div
            className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] border-fd-border border-b bg-fd-muted/20 font-semibold text-fd-foreground sm:grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)]"
            data-parameter-columns=""
          >
            <span className="border-fd-border border-r px-4 py-2.5">
              参数名
            </span>
            <span className="px-4 py-2.5">描述</span>
          </div>
        ) : null}
        <div className="divide-y divide-fd-border">{children}</div>
      </section>
    </ParameterListVariantContext>
  );
}

function ParameterBadges({
  nullable,
  requiredState,
}: {
  nullable?: boolean;
  requiredState: 'required' | 'optional' | null;
}) {
  if (!requiredState && !nullable) {
    return null;
  }

  return (
    <span className="flex flex-wrap gap-1.5">
      {requiredState ? (
        <span
          className={cn(
            'rounded border px-1.5 py-0.5 text-[0.68rem] font-medium',
            requiredState === 'required'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
              : 'border-fd-border bg-fd-muted/60 text-fd-muted-foreground',
          )}
        >
          {requiredState}
        </span>
      ) : null}
      {nullable ? (
        <span className="rounded border border-fd-border bg-fd-muted/60 px-1.5 py-0.5 text-[0.68rem] font-medium text-fd-muted-foreground">
          nullable
        </span>
      ) : null}
    </span>
  );
}

function ParameterIdentity({
  compact,
  direction,
  name,
  nullable,
  requiredState,
  richType,
  type,
  variant,
}: {
  compact?: boolean;
  direction?: ReactNode;
  name?: ReactNode;
  nullable?: boolean;
  requiredState: 'required' | 'optional' | null;
  richType?: ReactNode;
  type?: ReactNode;
  variant: ParameterListVariant;
}) {
  if (variant === 'table') {
    return (
      <div
        className={cn(
          'min-w-0 break-words font-mono text-[0.8rem] text-fd-foreground leading-6',
          !compact && 'border-fd-border border-r px-4 py-4',
        )}
      >
        {requiredState === 'optional' ? (
          <span className="text-fd-muted-foreground">Optional </span>
        ) : null}
        {direction ? (
          <span className="text-fd-muted-foreground">{direction} </span>
        ) : null}
        {name ? (
          <code className="font-mono">
            {name}
            {requiredState === 'optional' ? '?' : null}
          </code>
        ) : null}
        {type || richType ? (
          <>
            {name ? ': ' : null}
            {type ? <span>{type}</span> : richType}
          </>
        ) : null}
        {nullable ? (
          <span className="text-fd-muted-foreground"> | null</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {name ? (
          <code className="rounded bg-fd-muted px-1.5 py-0.5 font-mono text-[0.82rem] text-fd-foreground">
            {name}
          </code>
        ) : null}
        {type ? (
          <span className="rounded border border-fd-border bg-fd-background px-1.5 py-0.5 font-mono text-[0.75rem] text-fd-muted-foreground">
            {type}
          </span>
        ) : (
          richType
        )}
      </div>
      {direction ? (
        <span className="inline-flex w-fit rounded border border-fd-border bg-fd-muted/60 px-1.5 py-0.5 font-mono text-[0.68rem] text-fd-muted-foreground">
          {direction}
        </span>
      ) : null}
      <ParameterBadges requiredState={requiredState} nullable={nullable} />
    </div>
  );
}

function NestedParameterChildren({
  children,
  parameterLabel,
  variant,
}: {
  children: ReactNode;
  parameterLabel?: string;
  variant: ParameterListVariant;
}) {
  const nestingDepth = useContext(ParameterNestingContext);

  return (
    <section
      aria-label={
        parameterLabel
          ? `Nested parameters for ${parameterLabel}`
          : 'Nested parameters'
      }
      className={cn(
        variant === 'table'
          ? 'mt-3'
          : 'border-fd-border/70 border-t bg-fd-muted/20 px-4 pb-4 pt-3',
      )}
      data-parameter-children=""
    >
      <ParameterNestingContext value={nestingDepth + 1}>
        <div
          className={cn(
            variant === 'table'
              ? 'space-y-3'
              : 'border-fd-border/80 border-l pl-3 sm:ml-4 sm:pl-4',
          )}
        >
          {variant === 'cards' ? (
            <div className="overflow-hidden rounded-md border border-fd-border bg-fd-background/80 shadow-sm">
              <div className="divide-y divide-fd-border">{children}</div>
            </div>
          ) : (
            children
          )}
        </div>
      </ParameterNestingContext>
    </section>
  );
}

function ParameterDescription({
  compact,
  defaultValue,
  descriptionChildren,
  nestedParameters,
  parameterLabel,
  possibleValues,
  variant,
}: {
  compact?: boolean;
  defaultValue?: ReactNode;
  descriptionChildren: ReactNode[];
  nestedParameters: ReactNode[];
  parameterLabel?: string;
  possibleValues?: ReactNode;
  variant: ParameterListVariant;
}) {
  return (
    <TableParameterDescriptionContext value={variant === 'table'}>
      <div
        className={cn(
          'min-w-0 space-y-3 text-fd-muted-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0',
          variant === 'table' && !compact && 'px-4 py-4',
          compact && 'mt-1',
        )}
        data-parameter-description=""
      >
        {defaultValue || possibleValues ? (
          <dl className="space-y-2 text-xs">
            {defaultValue ? (
              <div className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)]">
                <dt className="font-medium text-fd-foreground">
                  Default value
                </dt>
                <dd className="min-w-0 break-words font-mono">
                  {defaultValue}
                </dd>
              </div>
            ) : null}
            {possibleValues ? (
              <div className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)]">
                <dt className="font-medium text-fd-foreground">
                  Possible values
                </dt>
                <dd className="min-w-0">
                  {renderPossibleValues(possibleValues, parameterLabel)}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {descriptionChildren}
        {nestedParameters.length > 0 && variant === 'table' ? (
          <NestedParameterChildren
            parameterLabel={parameterLabel}
            variant={variant}
          >
            {nestedParameters}
          </NestedParameterChildren>
        ) : null}
      </div>
    </TableParameterDescriptionContext>
  );
}

function Parameter({
  children,
  className,
  defaultValue,
  direction,
  name,
  nullable,
  optional,
  possibleValues,
  required,
  type,
  ...props
}: ParameterProps) {
  const requiredState = getRequiredState({ optional, required });
  const variant = useContext(ParameterListVariantContext);
  const childNodes = Children.toArray(children);
  const descriptionChildren = childNodes.filter(
    (child) =>
      !isNestedParameterBlock(child) &&
      !isParameterTypeBlock(child) &&
      !isBlankTextNode(child),
  );
  const nestedParameters = childNodes.filter(isNestedParameterBlock);
  const richType = childNodes.find(isParameterTypeBlock);
  const parameterLabel = getPlainTextLabel(name);
  const nestingDepth = useContext(ParameterNestingContext);
  const isCompactTableParameter = variant === 'table' && nestingDepth > 0;

  if (isCompactTableParameter) {
    return (
      <div
        className={cn(
          'group/parameter relative pl-5 before:absolute before:left-1 before:top-2.5 before:size-1.5 before:rounded-full before:bg-fd-muted-foreground',
          className,
        )}
        data-parameter-item=""
        data-parameter-variant={variant}
        {...props}
      >
        <ParameterIdentity
          compact
          direction={direction}
          name={name}
          nullable={nullable}
          requiredState={requiredState}
          richType={richType}
          type={type}
          variant={variant}
        />
        <ParameterDescription
          compact
          defaultValue={defaultValue}
          descriptionChildren={descriptionChildren}
          nestedParameters={nestedParameters}
          parameterLabel={parameterLabel}
          possibleValues={possibleValues}
          variant={variant}
        />
      </div>
    );
  }

  return (
    <div
      className={cn('group/parameter', className)}
      data-parameter-item=""
      data-parameter-variant={variant}
      {...props}
    >
      <div
        className={cn(
          'grid',
          variant === 'table'
            ? 'grid-cols-[minmax(0,42%)_minmax(0,1fr)] sm:grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)]'
            : 'gap-3 px-4 py-4 sm:grid-cols-[minmax(0,16rem)_1fr]',
        )}
        data-parameter-main=""
      >
        <ParameterIdentity
          direction={direction}
          name={name}
          nullable={nullable}
          requiredState={requiredState}
          richType={richType}
          type={type}
          variant={variant}
        />
        <ParameterDescription
          defaultValue={defaultValue}
          descriptionChildren={descriptionChildren}
          nestedParameters={nestedParameters}
          parameterLabel={parameterLabel}
          possibleValues={possibleValues}
          variant={variant}
        />
      </div>
      {nestedParameters.length > 0 && variant === 'cards' ? (
        <NestedParameterChildren
          parameterLabel={parameterLabel}
          variant={variant}
        >
          {nestedParameters}
        </NestedParameterChildren>
      ) : null}
    </div>
  );
}

function ParameterType({ children, className, ...props }: ParameterTypeProps) {
  const variant = useContext(ParameterListVariantContext);

  return (
    <div
      className={cn(
        variant === 'table'
          ? 'prose-no-margin inline min-w-0 font-mono text-[0.8rem] text-fd-muted-foreground [&_a]:text-fd-primary [&_p]:m-0 [&_p]:inline'
          : 'prose-no-margin min-w-0 rounded border border-fd-border bg-fd-background px-1.5 py-0.5 font-mono text-[0.75rem] text-fd-muted-foreground [&_a]:text-fd-primary [&_p]:m-0',
        className,
      )}
      data-parameter-type=""
      {...props}
    >
      {children}
    </div>
  );
}

function ApiSignature({
  children,
  className,
  labels,
  ...props
}: ApiSignatureProps) {
  const labelItems = labels?.split(/\s+/).filter(Boolean) ?? [];

  return (
    <div
      className={cn(
        'not-prose my-4 overflow-x-auto rounded-lg border border-fd-border bg-fd-muted/35 shadow-sm',
        className,
      )}
      data-api-signature=""
      {...props}
    >
      {labelItems.length > 0 ? (
        <div className="flex flex-wrap justify-end gap-1.5 border-fd-border border-b px-3 py-2">
          {labelItems.map((label) => (
            <span
              className="rounded border border-fd-border bg-fd-background px-1.5 py-0.5 font-medium text-[0.68rem] text-fd-muted-foreground"
              key={label}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="w-max min-w-full whitespace-pre px-4 py-3 font-mono text-[0.82rem] text-fd-foreground leading-6 [&_a]:text-fd-primary [&_a]:underline [&_a]:underline-offset-4 [&_p]:m-0 [&_p]:whitespace-pre">
        {children}
      </div>
    </div>
  );
}

function ApiReturns({
  children,
  className,
  title = 'Returns',
  ...props
}: ApiReturnsProps) {
  const isTableParameterReturn = useContext(TableParameterDescriptionContext);
  const childNodes = Children.toArray(children);
  const returnType = childNodes.find(isApiReturnTypeBlock);
  const description = childNodes.filter(
    (child) => !isApiReturnTypeBlock(child) && !isBlankTextNode(child),
  );

  if (isTableParameterReturn) {
    return null;
  }

  return (
    <section
      className={cn(
        'not-prose my-6 overflow-hidden rounded-lg border border-fd-border bg-fd-card text-sm shadow-sm',
        className,
      )}
      data-api-returns=""
      {...props}
    >
      <div className="border-fd-border border-b bg-fd-muted/35 px-4 py-3 font-semibold text-fd-foreground">
        {title}
      </div>
      <div
        className={cn(
          'grid gap-3 px-4 py-4',
          returnType &&
            description.length > 0 &&
            'sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]',
        )}
      >
        {returnType}
        {description.length > 0 ? (
          <div
            className="prose-no-margin min-w-0 text-fd-muted-foreground [&_a]:font-medium [&_a]:text-fd-primary"
            data-api-return-description=""
          >
            {description}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ApiReturnType({ children, className, ...props }: ApiReturnTypeProps) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-x-auto whitespace-pre rounded-md border border-fd-border bg-fd-background px-3 py-2 font-mono text-[0.78rem] text-fd-foreground leading-5 [&_a]:text-fd-primary [&_a]:underline [&_a]:underline-offset-4 [&_p]:m-0 [&_p]:w-max [&_p]:min-w-full [&_p]:whitespace-pre',
        className,
      )}
      data-api-return-type=""
      {...props}
    >
      {children}
    </div>
  );
}

function renderPossibleValues(
  possibleValues: ReactNode,
  parameterLabel?: string,
) {
  const ariaLabel = parameterLabel
    ? `Possible values for ${parameterLabel}`
    : 'Possible values';

  if (typeof possibleValues === 'string') {
    const values = getPossibleValueItems(possibleValues);

    if (values.length > 0) {
      return (
        <ul
          aria-label={ariaLabel}
          className="m-0 flex min-w-0 list-none flex-wrap gap-1.5 p-0"
          data-parameter-possible-values=""
        >
          {values.map((value) => (
            <li key={value}>
              <code className="rounded border border-fd-border bg-fd-muted/60 px-1.5 py-0.5 font-mono text-[0.72rem] text-fd-foreground">
                {value}
              </code>
            </li>
          ))}
        </ul>
      );
    }
  }

  return (
    <span className="break-words font-mono" data-parameter-possible-values="">
      {possibleValues}
    </span>
  );
}

function getPossibleValueItems(possibleValues: string) {
  const trimmed = possibleValues.trim();

  if (isBracketedPossibleValue(trimmed)) {
    return [trimmed];
  }

  return trimmed
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function isBracketedPossibleValue(value: string) {
  return (
    (value.startsWith('[') && value.endsWith(']')) ||
    (value.startsWith('(') && value.endsWith(')'))
  );
}

function isNestedParameterBlock(
  child: ReactNode,
): child is ReactElement<ParameterProps | ParameterListProps> {
  return (
    isValidElement(child) &&
    (child.type === Parameter || child.type === ParameterList)
  );
}

function isParameterTypeBlock(
  child: ReactNode,
): child is ReactElement<ParameterTypeProps> {
  return isValidElement(child) && child.type === ParameterType;
}

function isApiReturnTypeBlock(
  child: ReactNode,
): child is ReactElement<ApiReturnTypeProps> {
  return isValidElement(child) && child.type === ApiReturnType;
}

function isBlankTextNode(child: ReactNode) {
  return typeof child === 'string' && child.trim().length === 0;
}

function getPlainTextLabel(value: ReactNode) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return undefined;
}

export {
  ApiReturns,
  ApiReturnType,
  ApiSignature,
  Parameter,
  ParameterList,
  ParameterType,
};

function getRequiredState({
  optional,
  required,
}: {
  optional?: boolean;
  required?: boolean;
}) {
  if (required) {
    return 'required';
  }

  if (optional || required === false) {
    return 'optional';
  }

  return null;
}

function createDocsAnchor(contentPath?: string) {
  function DocsAnchor({
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const normalized =
      typeof href === 'string'
        ? normalizeDocsHref(href, { contentPath })
        : null;
    const normalizedHref = normalized?.href ?? href;

    if (normalized && shouldUseRouterLink(normalized, props)) {
      return <RouterFumadocsAnchor {...props} to={normalized.href} />;
    }

    return <FumadocsAnchor href={normalizedHref} {...props} />;
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
  function DocsCard({ className, href, ...props }: DocsCardProps) {
    const normalized =
      typeof href === 'string'
        ? normalizeDocsHref(href, { contentPath })
        : null;
    const normalizedHref = normalized?.href ?? href;
    const cardClassName = cn(href && 'docs-card-link', className);

    if (normalized && shouldUseRouterLink(normalized, props)) {
      return (
        <RouterFumadocsCard
          {...props}
          className={cardClassName}
          to={normalized.href}
        />
      );
    }

    return (
      <FumadocsCard
        {...props}
        className={cardClassName}
        href={normalizedHref}
      />
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

function ZoomableImage({ alt = '', src, ...props }: ComponentProps<'img'>) {
  if (typeof src !== 'string' || src.length === 0) {
    return <FumadocsImage alt={alt} src={src} {...props} />;
  }

  const title = alt || 'Documentation image';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          aria-label={`Zoom image: ${title}`}
          className="block cursor-zoom-in"
          type="button"
        >
          <FumadocsImage alt={alt} src={src} {...props} />
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
        />
      </DialogContent>
    </Dialog>
  );
}

export function getMDXComponents(
  components?: MDXComponents,
  context?: MDXContext,
) {
  const DocsPlanCards = createPlanCardsComponent(context?.contentPath);
  const DocsPricingCards = createPricingCardsComponent(context?.contentPath);

  return {
    ...defaultMdxComponents,
    Callout: DocsCallout,
    CalloutContainer: DocsCalloutContainer,
    table: createDocsTableComponent(context?.locale),
    img: ZoomableImage,
    h2: (props) => <TabAwareHeading as="h2" {...props} />,
    h3: (props) => <TabAwareHeading as="h3" {...props} />,
    h4: (props) => <TabAwareHeading as="h4" {...props} />,
    h5: (props) => <TabAwareHeading as="h5" {...props} />,
    h6: (props) => <TabAwareHeading as="h6" {...props} />,
    a: createDocsAnchor(context?.contentPath),
    Link: createLegacyDocsLink(context?.contentPath),
    Card: createDocsCard(context?.contentPath),
    Cards,
    CommandBlock,
    Tabs,
    Tab: FumadocsTab,
    TabsContent,
    TabsList: FumadocsTabsList,
    TabsTrigger: FumadocsTabsTrigger,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTab,
    pre: Pre,
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
