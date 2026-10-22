import {
  CodeBlock,
  type CodeBlockProps,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  FileCode2,
  Terminal,
  TriangleAlert,
} from 'lucide-react';
import {
  Children,
  type CSSProperties,
  Fragment,
  isValidElement,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import {
  prepareCodeSource,
  readCodeText,
  splitCodeLines,
} from '@/lib/code/source';
import {
  DOCS_HASH_TARGET_EVENT,
  findDocsHeadingForHash,
  scrollDocsHashTargetAfterLayout,
} from '@/lib/docs-hash';

export type DocsCodeBlockProps = CodeBlockProps & {
  source?: string;
  language?: string;
  'data-language'?: string;
  'data-no-line-numbers'?: boolean | 'true';
  locale?: string;
  variant?: 'code' | 'terminal' | 'output';
  lineNumbers?: boolean;
  collapseAfter?: number;
};

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number')
        return String(child);
      if (isValidElement<{ children?: ReactNode; className?: string }>(child)) {
        if (child.props.className?.split(' ').includes('nd-copy-ignore'))
          return '';
        return textOf(child.props.children);
      }
      return '';
    })
    .join('');
}

const LANGUAGE_LABELS: Record<string, string> = {
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  curl: 'cURL',
  javascript: 'JavaScript',
  js: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  json: 'JSON',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  objc: 'Objective-C',
  swift: 'Swift',
  python: 'Python',
  go: 'Go',
  dart: 'Dart',
  rust: 'Rust',
  html: 'HTML',
  css: 'CSS',
  yaml: 'YAML',
};

export function DocsCodeBlock({
  source,
  language,
  locale,
  variant,
  lineNumbers,
  collapseAfter = 30,
  title,
  children,
  className,
  allowCopy = true,
  viewportProps,
  ...props
}: DocsCodeBlockProps) {
  const { i18n } = useTranslation();
  const chinese = (locale ?? i18n.language ?? 'en').startsWith('zh');
  const copyLabel = chinese ? '复制代码' : 'Copy code';
  const root = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const viewportId = useId();
  const prepared = useMemo(
    () => prepareCodeSource(source ?? textOf(children)),
    [source, children],
  );
  const feedbackSource = useRef(prepared.source);
  const count = prepared.source.replace(/\n$/, '').split('\n').length;
  const [expandedSource, setExpandedSource] = useState<string>();
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [contextVariant, setContextVariant] = useState<'output' | undefined>();
  const lang =
    language ??
    props['data-language'] ??
    /(?:^|\s)language-([^\s]+)/.exec(className ?? '')?.[1];
  const outputTitle =
    typeof title === 'string' &&
    /^(响应|输出|response|output)(?:\b|\s|示例|结果|$)/i.test(title);
  const resolvedVariant =
    variant ??
    (contextVariant || outputTitle
      ? 'output'
      : /^(bash|shell|sh|curl)$/.test(lang ?? '')
        ? 'terminal'
        : 'code');
  const label =
    title ||
    (resolvedVariant === 'output'
      ? chinese
        ? '响应'
        : 'Response'
      : (LANGUAGE_LABELS[lang ?? ''] ?? lang ?? (chinese ? '代码' : 'Code')));
  const long = collapseAfter > 0 && count > collapseAfter;
  const expanded = !long || expandedSource === prepared.source;
  const stateLabel =
    status === 'copied'
      ? chinese
        ? '已复制'
        : 'Copied'
      : status === 'error'
        ? chinese
          ? '复制失败，请重试'
          : 'Copy failed. Retry'
        : copyLabel;

  useEffect(() => {
    requestId.current += 1;
    if (feedbackSource.current !== prepared.source) {
      feedbackSource.current = prepared.source;
      setStatus('idle');
    }
    return () => {
      requestId.current += 1;
      clearTimeout(resetTimer.current);
    };
  }, [prepared.source]);
  useEffect(() => {
    const element = root.current;
    if (!element || variant) return;
    const article = element.closest('article, .docs-body, .prose');
    const preceding = Array.from(article?.querySelectorAll('h2,h3,h4') ?? [])
      .filter((h) =>
        Boolean(
          h.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      )
      .at(-1);
    const heading = preceding?.textContent
      ?.replace('Copy Anchor Link', '')
      .trim();
    setContextVariant(
      heading &&
        /^(响应|输出|响应示例|输出结果|response(?: example)?|output)$/i.test(
          heading,
        )
        ? 'output'
        : undefined,
    );
  }, [variant]);

  const revealHash = useEffectEvent((event?: Event) => {
    if (expanded) return;
    const detail =
      event instanceof CustomEvent && typeof event.detail === 'string'
        ? event.detail
        : window.location.hash;
    const hash = detail.startsWith('#')
      ? detail
      : new URL(detail, window.location.href).hash;
    const target = findDocsHeadingForHash(hash);
    if (target && root.current?.contains(target)) {
      setExpandedSource(prepared.source);
      requestAnimationFrame(() =>
        scrollDocsHashTargetAfterLayout(hash, {
          behavior: 'auto',
          updateHistory: false,
        }),
      );
    }
  });
  useEffect(() => {
    if (!long) return;
    const reveal = (event?: Event) => revealHash(event);
    reveal();
    window.addEventListener('hashchange', reveal);
    window.addEventListener(DOCS_HASH_TARGET_EVENT, reveal);
    return () => {
      window.removeEventListener('hashchange', reveal);
      window.removeEventListener(DOCS_HASH_TARGET_EVENT, reveal);
    };
  }, [long]);

  async function copy() {
    const currentRequest = ++requestId.current;
    clearTimeout(resetTimer.current);
    try {
      const code =
        source === undefined && root.current
          ? readCodeText(root.current)
          : prepared.source;
      await navigator.clipboard.writeText(code);
      if (currentRequest !== requestId.current) return;
      setStatus('copied');
    } catch {
      if (currentRequest !== requestId.current) return;
      setStatus('error');
    }
    resetTimer.current = setTimeout(() => setStatus('idle'), 1800);
  }

  const Icon = resolvedVariant === 'terminal' ? Terminal : FileCode2;
  return (
    <div
      ref={root}
      className="docs-code-shell"
      data-variant={resolvedVariant}
      data-collapsed={!expanded || undefined}
      style={{ '--code-visible-lines': collapseAfter } as CSSProperties}
    >
      <CodeBlock
        {...props}
        icon={undefined}
        title={
          <span className="docs-code-title">
            <Icon aria-hidden="true" />
            <span>{label}</span>
            {lang && (title || resolvedVariant === 'output') && (
              <span className="docs-code-language">
                {LANGUAGE_LABELS[lang] ?? lang}
              </span>
            )}
          </span>
        }
        allowCopy={false}
        className={cn('docs-code-block', className)}
        data-line-numbers={
          (lineNumbers ??
          (props['data-no-line-numbers']
            ? false
            : (props['data-line-numbers'] ?? count > 1)))
            ? true
            : undefined
        }
        Actions={() =>
          allowCopy !== false && allowCopy !== 'false' ? (
            <Button
              variant="ghost"
              size="sm"
              className="docs-code-copy"
              onClick={copy}
              aria-label={stateLabel}
              data-copy-status={status}
            >
              {status === 'copied' ? (
                <Check data-icon="inline-start" />
              ) : status === 'error' ? (
                <TriangleAlert data-icon="inline-start" />
              ) : (
                <Clipboard data-icon="inline-start" />
              )}
              <span>{stateLabel}</span>
            </Button>
          ) : null
        }
        viewportProps={{
          ...viewportProps,
          id: viewportId,
          'aria-label': `${typeof label === 'string' ? label : (lang ?? 'Code')} · ${count} ${chinese ? '行' : 'lines'}`,
          className: cn('docs-code-viewport', viewportProps?.className),
        }}
      >
        <Pre>
          {children ?? (
            <code>
              {splitCodeLines(prepared.source).map(
                ({ text: line, number, key: lineKey }) => (
                  <Fragment key={lineKey}>
                    <span
                      className={cn(
                        'line',
                        prepared.highlighted.has(number) && 'highlighted',
                        prepared.added.has(number) && 'diff add',
                        prepared.removed.has(number) && 'diff remove',
                      )}
                    >
                      {line}
                    </span>
                    {number < count ? '\n' : null}
                  </Fragment>
                ),
              )}
            </code>
          )}
        </Pre>
      </CodeBlock>
      {long && (
        <div className="docs-code-disclosure">
          <span>
            {count} {chinese ? '行' : 'lines'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-controls={viewportId}
            aria-expanded={expanded}
            onClick={() =>
              setExpandedSource(expanded ? undefined : prepared.source)
            }
          >
            {expanded ? (
              <ChevronUp data-icon="inline-start" />
            ) : (
              <ChevronDown data-icon="inline-start" />
            )}
            {expanded
              ? chinese
                ? '收起代码'
                : 'Collapse code'
              : chinese
                ? `展开全部 ${count} 行`
                : `Expand all ${count} lines`}
          </Button>
        </div>
      )}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status === 'idle' ? '' : stateLabel}
      </span>
    </div>
  );
}
