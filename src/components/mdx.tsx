import type { MDXComponents } from 'mdx/types';
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList as UiTabsList,
  TabsTrigger as UiTabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/cn';

function Tabs(props: React.ComponentProps<typeof UiTabs>) {
  return <UiTabs className={cn('my-6', props.className)} {...props} />;
}

function TabsList(props: React.ComponentProps<typeof UiTabsList>) {
  return (
    <UiTabsList
      className={cn('mb-4 flex-wrap', props.className)}
      variant="line"
      {...props}
    />
  );
}

function TabsTrigger(props: React.ComponentProps<typeof UiTabsTrigger>) {
  return (
    <UiTabsTrigger
      className={cn('text-base md:text-lg', props.className)}
      {...props}
    />
  );
}

function TabsContent(props: React.ComponentProps<typeof UiTabsContent>) {
  return <UiTabsContent className={cn('mt-1', props.className)} {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
