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
type ParameterListProps = ComponentProps<'div'> & {
  nullable?: boolean;
  optional?: boolean;
  required?: boolean;
  title?: ReactNode;
};
type ParameterProps = ComponentProps<'div'> & {
  children?: ReactNode;
  defaultValue?: ReactNode;
  name?: ReactNode;
  nullable?: boolean;
  optional?: boolean;
  possibleValues?: ReactNode;
  required?: boolean;
  type?: ReactNode;
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
    const value = element.props.value;

    if (typeof value === 'string' && !values.includes(value)) {
      values.push(value);
    }

    collectTabValues(element.props.children, values);
  });

  return values;
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
  const { safeValue, setSafeValue } = useSafeTabValue({
    defaultValue,
    onValueChange,
    value,
    values,
  });

  return (
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
  className,
  ...props
}: ComponentProps<typeof FumadocsTabsContent>) {
  return (
    <FumadocsTabsContent
      className={cn(
        '[&>figure:only-child]:bg-fd-card [&>figure:only-child]:shadow-none',
        className,
      )}
      {...props}
    />
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
  ...props
}: ParameterListProps) {
  const requiredState = getRequiredState({ optional, required });

  return (
    <section
      className={cn(
        'not-prose my-6 overflow-hidden rounded-lg border border-fd-border bg-fd-card text-sm shadow-sm',
        className,
      )}
      data-parameter-list=""
      {...props}
    >
      {title || requiredState || nullable ? (
        <div className="flex flex-wrap items-center gap-2 border-fd-border border-b bg-fd-muted/35 px-4 py-3 font-semibold text-fd-foreground">
          {title ? <span>{title}</span> : null}
          <ParameterBadges requiredState={requiredState} nullable={nullable} />
        </div>
      ) : null}
      <div className="divide-y divide-fd-border">{children}</div>
    </section>
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

function Parameter({
  children,
  className,
  defaultValue,
  name,
  nullable,
  optional,
  possibleValues,
  required,
  type,
  ...props
}: ParameterProps) {
  const requiredState = getRequiredState({ optional, required });
  const childNodes = Children.toArray(children);
  const descriptionChildren = childNodes.filter(
    (child) => !isNestedParameterBlock(child) && !isBlankTextNode(child),
  );
  const nestedParameters = childNodes.filter(isNestedParameterBlock);
  const parameterLabel = getPlainTextLabel(name);

  return (
    <div
      className={cn('group/parameter', className)}
      data-parameter-item=""
      {...props}
    >
      <div
        className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,16rem)_1fr]"
        data-parameter-main=""
      >
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
            ) : null}
          </div>
          <ParameterBadges requiredState={requiredState} nullable={nullable} />
        </div>
        <div
          className="min-w-0 space-y-3 text-fd-muted-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0"
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
        </div>
      </div>
      {nestedParameters.length > 0 ? (
        <section
          aria-label={
            parameterLabel
              ? `Nested parameters for ${parameterLabel}`
              : 'Nested parameters'
          }
          className="border-fd-border/70 border-t bg-fd-muted/20 px-4 pb-4 pt-3"
          data-parameter-children=""
        >
          <div className="border-fd-border/80 border-l pl-3 sm:ml-4 sm:pl-4">
            <div className="overflow-hidden rounded-md border border-fd-border bg-fd-background/80 shadow-sm">
              <div className="divide-y divide-fd-border">
                {nestedParameters}
              </div>
            </div>
          </div>
        </section>
      ) : null}
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

function isBlankTextNode(child: ReactNode) {
  return typeof child === 'string' && child.trim().length === 0;
}

function getPlainTextLabel(value: ReactNode) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return undefined;
}

export { Parameter, ParameterList };

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
  return {
    ...defaultMdxComponents,
    Callout: DocsCallout,
    CalloutContainer: DocsCalloutContainer,
    img: ZoomableImage,
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
    ParameterList,
    Parameter,
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
