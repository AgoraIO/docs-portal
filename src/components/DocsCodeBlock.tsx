import {
  CodeBlock,
  type CodeBlockProps,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { WrapText } from 'lucide-react';
import { type CSSProperties, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

export function DocsCodeBlock({
  className,
  Actions,
  copyButton,
  locale,
  ...props
}: CodeBlockProps & { copyButton?: ReactNode; locale?: string }) {
  const [wrapped, setWrapped] = useState(false);
  const { t } = useTranslation('common', { lng: locale });
  const wrapLabel = wrapped
    ? t('docs.unwrapCode', 'Unwrap code')
    : t('docs.wrapCode', 'Wrap code');

  return (
    <CodeBlock
      {...props}
      data-line-numbers
      data-code-wrap={wrapped}
      className={cn('bg-fd-card shadow-none', className)}
      viewportProps={{
        ...props.viewportProps,
        className: cn('overflow-auto', props.viewportProps?.className),
        style: {
          // Untitled blocks overlay the actions; reserve room for both controls.
          ...(!props.title &&
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
      <Pre
        className={cn(
          wrapped && 'w-full min-w-0 whitespace-pre-wrap wrap-anywhere',
        )}
      >
        {props.children}
      </Pre>
    </CodeBlock>
  );
}
