import {
  type CodeBlockProps,
  CodeBlock as FumadocsCodeBlock,
  Pre as FumadocsCodeBlockPre,
} from 'fumadocs-ui/components/codeblock';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { WrapText } from 'lucide-react';
import {
  type CSSProperties,
  type ReactNode,
  useContext,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { isSameCodeLanguage } from '@/lib/code/label';
import { CodeBlockTabContext } from './DocsCodeBlockTabs';
export type DocsCodeBlockProps = CodeBlockProps & {
  'data-language-label'?: string;
  copyButton?: ReactNode;
  defaultWrapped?: boolean;
  locale?: string;
};

export function DocsCodeBlock({
  className,
  title,
  'data-language-label': languageLabel,
  Actions,
  copyButton,
  defaultWrapped = false,
  locale,
  ...props
}: DocsCodeBlockProps) {
  const tab = useContext(CodeBlockTabContext);
  const sharedFrame = tab?.sharedFrame === true;
  const [wrapped, setWrapped] = useState(defaultWrapped);
  const { t } = useTranslation('common', { lng: locale });
  const wrapLabel = wrapped
    ? t('docs.unwrapCode', 'Unwrap code')
    : t('docs.wrapCode', 'Wrap code');

  const repeatsTabLanguage =
    tab &&
    typeof tab.label === 'string' &&
    languageLabel &&
    isSameCodeLanguage(tab.label, languageLabel);
  const blockTitle = repeatsTabLanguage ? undefined : languageLabel ? (
    <span className="docs-code-language">{languageLabel}</span>
  ) : (
    title
  );

  return (
    <FumadocsCodeBlock
      {...props}
      title={blockTitle}
      data-line-numbers={
        props['data-line-numbers'] === false ? undefined : true
      }
      data-code-wrap={wrapped}
      data-code-tabbed={sharedFrame ? '' : undefined}
      className={cn('bg-fd-card shadow-none', className)}
      viewportProps={{
        ...props.viewportProps,
        className: cn('overflow-auto', props.viewportProps?.className),
        style: {
          // Untitled blocks overlay the actions; reserve room for both controls.
          ...(!blockTitle &&
            !sharedFrame &&
            ({
              '--padding-right': 'calc(var(--spacing) * 16)',
            } as CSSProperties)),
          ...(sharedFrame &&
            ({
              '--padding-right': 'calc(var(--spacing) * 4)',
            } as CSSProperties)),
          ...props.viewportProps?.style,
        },
      }}
      Actions={({ className, children }) => {
        const controls = (
          <>
            <button
              type="button"
              aria-label={wrapLabel}
              aria-pressed={wrapped}
              title={wrapLabel}
              className={cn(
                buttonVariants({ size: 'icon-xs' }),
                'hover:text-fd-accent-foreground aria-pressed:text-fd-primary',
              )}
              onClick={() => setWrapped((value) => !value)}
            >
              <WrapText aria-hidden="true" />
            </button>
            {children && (copyButton ?? children)}
          </>
        );
        return Actions ? (
          Actions({
            className: cn(
              'flex items-center gap-1',
              className,
              sharedFrame && 'docs-code-tab-actions',
            ),
            children: controls,
          })
        ) : (
          <div
            className={cn(
              'flex items-center gap-1',
              className,
              sharedFrame && 'docs-code-tab-actions',
            )}
          >
            {controls}
          </div>
        );
      }}
    >
      <FumadocsCodeBlockPre
        className={cn(
          wrapped && 'w-full min-w-0 whitespace-pre-wrap wrap-anywhere',
        )}
      >
        {props.children}
      </FumadocsCodeBlockPre>
    </FumadocsCodeBlock>
  );
}
