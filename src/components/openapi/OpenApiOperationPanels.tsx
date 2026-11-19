import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DOCS_HASH_TARGET_EVENT,
  findDocsHeadingForHash,
} from '@/lib/docs-hash';

export function OpenApiOperationPanels({
  documentation,
  examples,
  locale,
  overview,
}: {
  documentation: ReactNode;
  examples: ReactNode;
  locale?: string;
  overview?: ReactNode;
}) {
  const [view, setView] = useState('documentation');
  const [examplesMinHeight, setExamplesMinHeight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const documentationRef = useRef<HTMLDivElement>(null);
  const chinese = locale?.startsWith('zh');

  const rememberDocumentationHeight = useCallback(() => {
    const height =
      documentationRef.current?.getBoundingClientRect().height ?? 0;
    if (height > 0) {
      setExamplesMinHeight((current) => Math.max(current, Math.ceil(height)));
    }
  }, []);

  useLayoutEffect(() => {
    const documentation = documentationRef.current;
    if (!documentation) return;

    rememberDocumentationHeight();
    const observer = new ResizeObserver(rememberDocumentationHeight);
    observer.observe(documentation);
    return () => observer.disconnect();
  }, [rememberDocumentationHeight]);

  function preserveHeightBeforeResponseSwitch(target: EventTarget | null) {
    if (
      target instanceof Element &&
      target.closest('[data-openapi-responses] [role="tab"]')
    ) {
      rememberDocumentationHeight();
    }
  }

  const changeView = (value: string) => {
    setView(value);
    const navigation = navigationRef.current;
    if (navigation && getComputedStyle(navigation).display !== 'none') {
      requestAnimationFrame(() => {
        navigation.scrollIntoView?.({ block: 'start' });
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
      onMouseDownCapture={(event) =>
        preserveHeightBeforeResponseSwitch(event.target)
      }
      onKeyDownCapture={(event) => {
        if (
          ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(
            event.key,
          )
        )
          preserveHeightBeforeResponseSwitch(event.target);
      }}
      onValueChange={changeView}
      ref={rootRef}
      value={view}
    >
      {overview ? (
        <div
          className="min-w-0 @min-[40rem]:col-span-2"
          data-openapi-operation-overview
        >
          {overview}
        </div>
      ) : null}
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
        ref={documentationRef}
        value="documentation"
      >
        {documentation}
      </TabsContent>
      <TabsContent
        className="min-w-0 @max-[40rem]:data-[state=inactive]:hidden @min-[40rem]:min-h-[var(--openapi-examples-min-height)] [&>.openapi-examples-rail-anchor]:h-full"
        data-openapi-operation-panel="examples"
        forceMount
        style={
          {
            '--openapi-examples-min-height': `${examplesMinHeight}px`,
          } as CSSProperties
        }
        value="examples"
      >
        {examples}
      </TabsContent>
    </Tabs>
  );
}
