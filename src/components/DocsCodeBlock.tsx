import {
  type CodeBlockProps,
  CodeBlock as FumadocsCodeBlock,
  Pre as FumadocsCodeBlockPre,
} from 'fumadocs-ui/components/codeblock';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { WrapText } from 'lucide-react';
import { type CSSProperties, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
export type DocsCodeBlockProps = CodeBlockProps & {
  'data-language-label'?: string;
  copyButton?: ReactNode;
  locale?: string;
};

export function DocsCodeBlock({
  className,
  title,
  'data-language-label': languageLabel,
  Actions,
  copyButton,
  locale,
  ...props
}: DocsCodeBlockProps) {
  const [wrapped, setWrapped] = useState(false);
  const { t } = useTranslation('common', { lng: locale });
  const wrapLabel = wrapped
    ? t('docs.unwrapCode', 'Unwrap code')
    : t('docs.wrapCode', 'Wrap code');

  const blockTitle = languageLabel ? (
    <span className="docs-code-language">{languageLabel}</span>
  ) : title;

  return (
    <FumadocsCodeBlock
      {...props}
      title={blockTitle}
      data-line-numbers={
        props['data-line-numbers'] === false ? undefined : true
      }
      data-code-wrap={wrapped}
      className={cn('bg-fd-card shadow-none', className)}
      viewportProps={{
        ...props.viewportProps,
        className: cn('overflow-auto', props.viewportProps?.className),
        style: {
          // Untitled blocks overlay the actions; reserve room for both controls.
          ...(!blockTitle &&
            ({
              '--padding-right': 'calc(var(--spacing) * 16)',
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
          <Actions className={cn('flex items-center gap-1', className)}>
            {controls}
          </Actions>
        ) : (
          <div className={cn('flex items-center gap-1', className)}>
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
