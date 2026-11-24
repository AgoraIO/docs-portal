import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from 'fumadocs-ui/components/codeblock';
import {
  Children,
  type ComponentProps,
  createContext,
  isValidElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';
import { cn } from '@/lib/cn';

const TabLabelsContext = createContext<Record<string, ReactNode>>({});
export const CodeBlockTabContext = createContext<{
  label: ReactNode;
  sharedFrame: boolean;
} | null>(null);

function collectLabels(children: ReactNode, labels: Record<string, ReactNode>) {
  Children.forEach(children, (child) => {
    if (!isValidElement<{ children?: ReactNode; value?: string }>(child))
      return;
    if (child.type === CodeBlockTabsTrigger && child.props.value) {
      labels[child.props.value] = child.props.children;
    } else if (child.props.value === undefined) {
      collectLabels(child.props.children, labels);
    }
  });
  return labels;
}

/** Code-only alternatives share one frame and a toolbar on the tab row. */
export function DocsCodeBlockTabs({
  children,
  className,
  ...props
}: ComponentProps<typeof CodeBlockTabs>) {
  const labels = useMemo(() => collectLabels(children, {}), [children]);
  return (
    <CodeBlockTabs
      {...props}
      className={cn(
        'docs-code-tabs relative overflow-hidden bg-fd-card',
        className,
      )}
    >
      <TabLabelsContext value={labels}>{children}</TabLabelsContext>
    </CodeBlockTabs>
  );
}

export function DocsCodeBlockTabsList({
  className,
  ...props
}: ComponentProps<typeof CodeBlockTabsList>) {
  return (
    <div className="docs-code-tabs-header border-b">
      <CodeBlockTabsList
        {...props}
        className={cn('mr-20 min-h-11 min-w-0 bg-fd-card', className)}
      />
    </div>
  );
}

export function DocsCodeBlockTab({
  children,
  value,
  ...props
}: ComponentProps<typeof CodeBlockTab>) {
  const labels = useContext(TabLabelsContext);
  const context = useMemo(
    () => ({ label: labels[value], sharedFrame: true }),
    [labels, value],
  );
  return (
    <CodeBlockTab {...props} value={value}>
      <CodeBlockTabContext value={context}>{children}</CodeBlockTabContext>
    </CodeBlockTab>
  );
}
