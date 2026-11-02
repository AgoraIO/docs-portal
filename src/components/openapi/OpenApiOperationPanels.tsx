import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DOCS_HASH_TARGET_EVENT,
  findDocsHeadingForHash,
} from '@/lib/docs-hash';

export function OpenApiOperationPanels({
  documentation,
  examples,
  locale,
}: {
  documentation: ReactNode;
  examples: ReactNode;
  locale?: string;
}) {
  const [view, setView] = useState('documentation');
  const rootRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const chinese = locale?.startsWith('zh');

  const changeView = (value: string) => {
    setView(value);
    const navigation = navigationRef.current;
    if (navigation && getComputedStyle(navigation).display !== 'none') {
      requestAnimationFrame(() => {
        rootRef.current?.scrollIntoView?.({ block: 'start' });
      });
    }
  };

  useEffect(() => {
    const revealHash = (hash: string) => {
      const target = findDocsHeadingForHash(hash);
      const panel = target?.closest('[data-openapi-operation-panel]');
      if (panel && rootRef.current?.contains(panel)) {
        setView(
          panel.getAttribute('data-openapi-operation-panel') ?? 'documentation',
        );
      }
    };
    const applyHash = () => revealHash(window.location.hash);
    const handleHashTarget = (event: Event) => {
      const hash = (event as CustomEvent<string>).detail;
      revealHash(typeof hash === 'string' ? hash : window.location.hash);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    window.addEventListener(DOCS_HASH_TARGET_EVENT, handleHashTarget);
    return () => {
      window.removeEventListener('hashchange', applyHash);
      window.removeEventListener(DOCS_HASH_TARGET_EVENT, handleHashTarget);
    };
  }, []);

  return (
    <Tabs
      className="openapi-operation-layout grid scroll-mt-[calc(var(--docs-shell-header-offset,48px)+1rem)] grid-cols-1 gap-6 @min-[40rem]:grid-cols-2 @min-[40rem]:items-start @min-[56rem]:grid-cols-[minmax(0,1fr)_400px]"
      onValueChange={changeView}
      ref={rootRef}
      value={view}
    >
      <TabsList
        aria-label={chinese ? 'API 文档视图' : 'API documentation view'}
        className="sticky top-[var(--docs-shell-header-offset,48px)] z-10 grid w-full grid-cols-2 group-data-[orientation=horizontal]/tabs:h-auto @min-[40rem]:hidden"
        ref={navigationRef}
      >
        <TabsTrigger className="min-h-11" value="documentation">
          {chinese ? '接口文档' : 'Documentation'}
        </TabsTrigger>
        <TabsTrigger className="min-h-11" value="examples">
          {chinese ? '请求与响应示例' : 'Request & response examples'}
        </TabsTrigger>
      </TabsList>
      <TabsContent
        className="min-w-0 @max-[40rem]:data-[state=inactive]:hidden"
        data-openapi-operation-panel="documentation"
        forceMount
        value="documentation"
      >
        {documentation}
      </TabsContent>
      <TabsContent
        className="min-w-0 @max-[40rem]:data-[state=inactive]:hidden [&>.openapi-examples-rail-anchor]:h-full"
        data-openapi-operation-panel="examples"
        forceMount
        value="examples"
      >
        {examples}
      </TabsContent>
    </Tabs>
  );
}
