import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
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
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import {
  type AnchorHTMLAttributes,
  Children,
  type ComponentProps,
  type ComponentType,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import { normalizeDocsHref } from '@/lib/docs-link-normalize';
import {
  PlatformInline,
  PlatformProcessedMarker,
  PlatformStructured,
} from './mdx/PlatformContent';
import { PlatformPanel, PlatformTabsGroup } from './mdx/PlatformTabsGroup';

type MDXContext = {
  contentPath?: string;
  staticRender?: boolean;
};

const FumadocsPre = defaultMdxComponents.pre;
const FumadocsAnchor = defaultMdxComponents.a;
const FumadocsCodeBlockTab = defaultMdxComponents.CodeBlockTab;
const FumadocsCodeBlockTabs = defaultMdxComponents.CodeBlockTabs;
const FumadocsCodeBlockTabsList = defaultMdxComponents.CodeBlockTabsList;
const CodeBlockTabsValueContext = createContext<string | undefined>(undefined);
const TabsValueContext = createContext<string | undefined>(undefined);
const TabsStaticPruneContext = createContext(false);
const StaticRenderContext = createContext(false);

type TabsRootProps = ComponentProps<typeof FumadocsTabs> & {
  children?: ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};
type DocsCardProps = ComponentProps<typeof FumadocsCard>;
type CodeBlockTabsRootProps = ComponentProps<typeof FumadocsCodeBlockTabs> & {
  children?: ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};
type HeadingProps = ComponentProps<'h1'> & {
  children?: ReactNode;
  id?: string;
};
type PreProps = ComponentProps<typeof FumadocsPre>;
type TabValueElement = ReactElement<{
  children?: ReactNode;
  value?: unknown;
}>;

const ControlledFumadocsTabs = FumadocsTabs as ComponentType<TabsRootProps>;

function escapeTabValue(value: string) {
  return value.toLowerCase().replace(/\s/, '-');
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

function useSafeTabValue({
  children,
  defaultValue,
  items,
  onValueChange,
  value,
}: {
  children?: ReactNode;
  defaultValue?: string;
  items?: string[];
  onValueChange?: (value: string) => void;
  value?: string;
}) {
  const values = useMemo(() => {
    if (items?.length) {
      return items.map(escapeTabValue);
    }

    return collectTabValues(children);
  }, [children, items]);
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
  groupId,
  items,
  onValueChange,
  persist,
  value,
  ...props
}: TabsRootProps) {
  const isStaticRender = useContext(StaticRenderContext);
  const { safeValue, setSafeValue } = useSafeTabValue({
    children,
    defaultValue,
    items,
    onValueChange,
    value,
  });

  return (
    <ControlledFumadocsTabs
      {...props}
      className={cn('bg-fd-card', className)}
      defaultValue={defaultValue}
      groupId={groupId}
      items={items}
      onValueChange={setSafeValue}
      persist={persist}
      value={safeValue}
    >
      <TabsStaticPruneContext value={isStaticRender && !groupId && !persist}>
        <TabsValueContext value={safeValue}>{children}</TabsValueContext>
      </TabsStaticPruneContext>
    </ControlledFumadocsTabs>
  );
}

function CodeBlockTabs({
  children,
  className,
  defaultValue,
  onValueChange,
  value,
  ...props
}: CodeBlockTabsRootProps) {
  const { safeValue, setSafeValue } = useSafeTabValue({
    children,
    defaultValue,
    onValueChange,
    value,
  });

  return (
    <FumadocsCodeBlockTabs
      {...props}
      className={cn('bg-fd-card', className)}
      defaultValue={defaultValue}
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
  const isStaticRender = useContext(StaticRenderContext);

  if (isStaticRender) {
    return (
      <pre className={cn('shiki', className)}>
        <code>{extractStaticCodeText(props.children)}</code>
      </pre>
    );
  }

  return (
    <FumadocsPre
      className={cn('bg-fd-card shadow-none', className)}
      {...props}
    />
  );
}

function extractStaticCodeText(children: ReactNode) {
  return extractTextNode(children)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trimEnd();
}

function extractTextNode(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractTextNode).join('');
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    const text = extractTextNode(element.props.children);

    if (element.props.className === 'line') {
      return `${text}\n`;
    }

    return text;
  }

  return '';
}

function TabsContent({
  className,
  value,
  ...props
}: ComponentProps<typeof FumadocsTabsContent>) {
  const selectedValue = useContext(TabsValueContext);
  const shouldPruneStaticPanels = useContext(TabsStaticPruneContext);
  const isInactive =
    selectedValue !== undefined && value !== undefined && selectedValue !== value;

  if (shouldPruneStaticPanels && isInactive) {
    return null;
  }

  return (
    <FumadocsTabsContent
      className={cn(
        '[&>figure:only-child]:bg-fd-card [&>figure:only-child]:shadow-none',
        className,
      )}
      value={value}
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

function createDocsAnchor(contentPath?: string) {
  function DocsAnchor({
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const normalizedHref =
      typeof href === 'string'
        ? normalizeDocsHref(href, { contentPath }).href
        : href;

    return <FumadocsAnchor href={normalizedHref} {...props} />;
  }

  return DocsAnchor;
}

function createDocsCard(contentPath?: string) {
  function DocsCard({ className, href, ...props }: DocsCardProps) {
    const normalizedHref =
      typeof href === 'string'
        ? normalizeDocsHref(href, { contentPath }).href
        : href;

    return (
      <FumadocsCard
        {...props}
        className={cn(href && 'docs-card-link', className)}
        href={normalizedHref}
      />
    );
  }

  return DocsCard;
}

function createStaticHeading(
  Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
): ComponentType<HeadingProps> {
  function StaticHeading({
    children,
    className,
    id,
    ...props
  }: HeadingProps) {
    const headingClassName = cn(
      'group/heading flex scroll-m-28 flex-row items-center gap-1',
      className,
    );

    if (!id) {
      return (
        <Tag className={headingClassName} {...props}>
          {children}
        </Tag>
      );
    }

    return (
      <Tag className={headingClassName} id={id} {...props}>
        <a data-card="" href={`#${id}`}>
          {children}
        </a>
      </Tag>
    );
  }

  return StaticHeading;
}

export function getMDXComponents(
  components?: MDXComponents,
  context?: MDXContext,
) {
  const isStaticRender = Boolean(context?.staticRender);
  const defaultHeadingComponents = defaultMdxComponents as MDXComponents & {
    h1?: ComponentType<HeadingProps>;
    h2?: ComponentType<HeadingProps>;
    h3?: ComponentType<HeadingProps>;
    h4?: ComponentType<HeadingProps>;
    h5?: ComponentType<HeadingProps>;
    h6?: ComponentType<HeadingProps>;
  };
  const TabsWithContext = (props: TabsRootProps) => (
    <StaticRenderContext value={isStaticRender}>
      <Tabs {...props} />
    </StaticRenderContext>
  );
  const PreWithContext = (props: PreProps) => (
    <StaticRenderContext value={isStaticRender}>
      <Pre {...props} />
    </StaticRenderContext>
  );
  const H1 = isStaticRender
    ? createStaticHeading('h1')
    : defaultHeadingComponents.h1;
  const H2 = isStaticRender
    ? createStaticHeading('h2')
    : defaultHeadingComponents.h2;
  const H3 = isStaticRender
    ? createStaticHeading('h3')
    : defaultHeadingComponents.h3;
  const H4 = isStaticRender
    ? createStaticHeading('h4')
    : defaultHeadingComponents.h4;
  const H5 = isStaticRender
    ? createStaticHeading('h5')
    : defaultHeadingComponents.h5;
  const H6 = isStaticRender
    ? createStaticHeading('h6')
    : defaultHeadingComponents.h6;

  return {
    ...defaultMdxComponents,
    a: createDocsAnchor(context?.contentPath),
    Card: createDocsCard(context?.contentPath),
    CommandBlock,
    Tabs: TabsWithContext,
    Tab: FumadocsTab,
    TabsContent,
    TabsList: FumadocsTabsList,
    TabsTrigger: FumadocsTabsTrigger,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTab,
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    pre: PreWithContext,
    Accordion,
    Accordions,
    File,
    Files,
    Folder,
    Step,
    Steps,
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
