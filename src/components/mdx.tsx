import defaultMdxComponents from 'fumadocs-ui/mdx';
import { CheckIcon, CopyIcon, TerminalSquareIcon } from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import {
  type AnchorHTMLAttributes,
  Children,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList as UiTabsList,
  TabsTrigger as UiTabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
import { normalizeDocsHref } from '@/lib/docs-link-normalize';

type MDXContext = {
  contentPath?: string;
};

type PersistableTabsProps = Omit<
  React.ComponentProps<typeof UiTabs>,
  'onValueChange' | 'value'
> & {
  defaultValue?: string;
  groupId?: string;
  onValueChange?: (value: string) => void;
  persist?: boolean;
  value?: string;
};

function Tabs(props: PersistableTabsProps) {
  const { className, groupId, persist, ...tabsProps } = props;
  const defaultValue =
    props.defaultValue ??
    props.value ??
    getFirstTabsTriggerValue(props.children);
  const tabState = usePersistentTabsValue({
    ...props,
    defaultValue,
    groupId,
    persist,
  });
  const { selectValue, ...rootTabState } = tabState;

  return (
    <PersistentTabsContext.Provider value={{ selectValue }}>
      <UiTabs
        className={cn('my-6 min-w-0 gap-3', className)}
        {...tabsProps}
        {...rootTabState}
        data-tabs-group-id={groupId}
        data-tabs-persist={persist ? 'true' : undefined}
      />
    </PersistentTabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof UiTabsList>) {
  return (
    <UiTabsList
      className={cn(
        'h-auto min-h-10 w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0',
        className,
      )}
      variant="line"
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  onClick,
  ...triggerProps
}: React.ComponentProps<typeof UiTabsTrigger>) {
  const persistentTabs = useContext(PersistentTabsContext);

  return (
    <UiTabsTrigger
      className={cn(
        'h-10 flex-none rounded-none px-3 text-[13px] font-medium',
        className,
      )}
      onClick={(event) => {
        if (typeof triggerProps.value === 'string') {
          persistentTabs?.selectValue(triggerProps.value);
        }
        onClick?.(event);
      }}
      {...triggerProps}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof UiTabsContent>) {
  return (
    <UiTabsContent
      className={cn('mt-0 min-w-0 rounded-md outline-none', className)}
      {...props}
    />
  );
}

const PersistentTabsContext = createContext<{
  selectValue: (value: string) => void;
} | null>(null);

const CodeBlockTabsContext = createContext(false);

function CodeBlockTabs(props: PersistableTabsProps) {
  const { className, children, ...tabsProps } = props;

  return (
    <CodeBlockTabsContext.Provider value>
      <Tabs
        className={cn(
          'not-prose my-6 gap-0 overflow-hidden rounded-md border bg-card shadow-xs',
          className,
        )}
        {...tabsProps}
      >
        {children}
      </Tabs>
    </CodeBlockTabsContext.Provider>
  );
}

function CodeBlockTabsList({
  className,
  ...props
}: React.ComponentProps<typeof UiTabsList>) {
  return (
    <TabsList
      className={cn(
        'min-h-9 border-b bg-muted/40 px-2 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function CodeBlockTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof UiTabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        'h-9 px-2.5 font-mono text-xs data-[state=active]:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function CodeBlockTab({
  className,
  ...props
}: React.ComponentProps<typeof UiTabsContent>) {
  return (
    <TabsContent
      className={cn(
        'm-0 rounded-none border-0 p-0 data-[state=inactive]:hidden',
        className,
      )}
      {...props}
    />
  );
}

type CodeBlockPreProps = React.ComponentProps<'pre'> & {
  icon?: ReactNode;
  title?: ReactNode;
  'data-line-numbers'?: boolean | string;
  'data-line-numbers-start'?: number | string;
};

function Pre({
  children,
  className,
  icon,
  title,
  'data-line-numbers': lineNumbers,
  'data-line-numbers-start': lineNumbersStart,
  ...props
}: CodeBlockPreProps) {
  const inCodeTab = useContext(CodeBlockTabsContext);
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const shouldShowLineNumbers =
    lineNumbers !== undefined &&
    lineNumbers !== false &&
    lineNumbers !== 'false';
  const lineNumberStart =
    typeof lineNumbersStart === 'number'
      ? lineNumbersStart
      : Number.parseInt(String(lineNumbersStart ?? 1), 10) || 1;

  async function handleCopy() {
    const text = preRef.current?.textContent?.trimEnd();

    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      copyWithSelectionFallback(preRef.current);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <figure
      className={cn(
        'not-prose relative overflow-hidden rounded-md border bg-card text-sm shadow-xs',
        inCodeTab
          ? '-mx-px -mb-px rounded-t-none border-x-0 border-b-0'
          : 'my-6',
      )}
      data-testid="mdx-code-block"
      style={{
        counterReset: shouldShowLineNumbers
          ? `line ${lineNumberStart - 1}`
          : undefined,
      }}
    >
      {title ? (
        <figcaption className="flex min-h-9 items-center gap-2 border-b bg-muted/40 px-3 text-xs text-muted-foreground">
          <CodeBlockIcon icon={icon} />
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <CopyCodeButton copied={copied} onClick={() => void handleCopy()} />
        </figcaption>
      ) : (
        <div className="absolute top-2 right-2 z-10 rounded-md bg-card/80 backdrop-blur">
          <CopyCodeButton copied={copied} onClick={() => void handleCopy()} />
        </div>
      )}
      <pre
        className={cn(
          'm-0 max-h-[600px] overflow-auto bg-transparent px-3 py-3 pr-12 font-mono text-[13px] leading-5 text-foreground [tab-size:2]',
          '[&_code]:block [&_code]:min-w-max [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit',
          shouldShowLineNumbers &&
            '[&_code>.line]:grid [&_code>.line]:grid-cols-[2.5rem_1fr] [&_code>.line]:gap-3 [&_code>.line]:before:select-none [&_code>.line]:before:text-right [&_code>.line]:before:text-muted-foreground [&_code>.line]:before:content-[counter(line)] [&_code>.line]:before:[counter-increment:line]',
          className,
        )}
        ref={preRef}
        {...props}
      >
        {children}
      </pre>
    </figure>
  );
}

function CopyCodeButton({
  copied,
  onClick,
}: {
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      aria-label={copied ? 'Code copied' : 'Copy code'}
      className="text-muted-foreground hover:text-foreground"
      onClick={onClick}
      size="icon-xs"
      type="button"
      variant="ghost"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}

function CodeBlockIcon({ icon }: { icon?: ReactNode }) {
  if (!icon) {
    return (
      <TerminalSquareIcon
        aria-hidden="true"
        className="text-muted-foreground"
      />
    );
  }

  if (typeof icon === 'string') {
    const svg = parseCodeBlockIcon(icon);

    if (!svg) {
      return (
        <TerminalSquareIcon
          aria-hidden="true"
          className="text-muted-foreground"
        />
      );
    }

    return (
      <span
        aria-hidden="true"
        className="text-muted-foreground [&_svg]:size-3.5"
        role="img"
      >
        <svg aria-hidden="true" viewBox={svg.viewBox}>
          <path d={svg.pathD} fill={svg.fill} />
        </svg>
      </span>
    );
  }

  return <span className="text-muted-foreground [&_svg]:size-3.5">{icon}</span>;
}

function copyWithSelectionFallback(node: HTMLElement | null) {
  if (!node || typeof window === 'undefined') {
    return;
  }

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(node);
  selection?.removeAllRanges();
  selection?.addRange(range);
  document.execCommand('copy');
  selection?.removeAllRanges();
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

function parseCodeBlockIcon(icon: string) {
  const viewBox = icon.match(/\bviewBox=(["'])(?<value>[^"']+)\1/)?.groups
    ?.value;
  const pathD = icon.match(/\bd=(["'])(?<value>[^"']+)\1/)?.groups?.value;
  const fill = icon.match(/\bfill=(["'])(?<value>[^"']+)\1/)?.groups?.value;

  if (!viewBox || !pathD) {
    return undefined;
  }

  return {
    fill: fill ?? 'currentColor',
    pathD,
    viewBox,
  };
}

function getFirstTabsTriggerValue(children: ReactNode): string | undefined {
  return getTabsTriggerValues(children).at(0);
}

function getTabsTriggerValues(children: ReactNode): string[] {
  const values: string[] = [];

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }

    const childProps = (
      child as ReactElement<{
        children?: ReactNode;
        value?: unknown;
      }>
    ).props;

    if (typeof childProps.value === 'string') {
      values.push(childProps.value);
    }

    values.push(...getTabsTriggerValues(childProps.children));
  }

  return values;
}

function usePersistentTabsValue({
  children,
  defaultValue,
  groupId,
  onValueChange,
  persist,
  value,
}: PersistableTabsProps) {
  const validValues = getTabsTriggerValues(children);
  const fallbackValue = defaultValue ?? value ?? validValues.at(0);
  const storageKey = persist && groupId ? `docs-tabs:${groupId}` : null;
  const isControlled = value !== undefined;
  const [storedValue, setStoredValue] = useState(() => {
    if (!storageKey || isControlled || typeof window === 'undefined') {
      return fallbackValue;
    }

    const saved = window.localStorage.getItem(storageKey);
    return saved && (validValues.length === 0 || validValues.includes(saved))
      ? saved
      : fallbackValue;
  });
  const selectValue = (nextValue: string) => {
    if (
      storageKey &&
      (validValues.length === 0 || validValues.includes(nextValue))
    ) {
      window.localStorage.setItem(storageKey, nextValue);
    }

    if (!isControlled) {
      setStoredValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  return {
    defaultValue: isControlled ? defaultValue : undefined,
    onValueChange: selectValue,
    selectValue,
    value: isControlled ? value : storedValue,
  };
}

function createDocsAnchor(contentPath?: string) {
  function DocsAnchor({
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const normalizedHref =
      typeof href === 'string'
        ? normalizeDocsHref(href, { contentPath }).href
        : href;

    return <a href={normalizedHref} {...props} />;
  }

  return DocsAnchor;
}

export function getMDXComponents(
  components?: MDXComponents,
  context?: MDXContext,
) {
  return {
    ...defaultMdxComponents,
    a: createDocsAnchor(context?.contentPath),
    CommandBlock,
    pre: Pre,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    CodeBlockTab,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
