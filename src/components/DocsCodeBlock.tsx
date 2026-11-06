import {
  type CodeBlockProps,
  CodeBlock as FumadocsCodeBlock,
  Pre as FumadocsCodeBlockPre,
} from 'fumadocs-ui/components/codeblock';
import { cn } from '@/lib/cn';
export type DocsCodeBlockProps = CodeBlockProps & {
  'data-language-label'?: string;
};

export function DocsCodeBlock({
  className,
  title,
  'data-language-label': languageLabel,
  ...props
}: DocsCodeBlockProps) {
  return (
    <FumadocsCodeBlock
      {...props}
      title={
        languageLabel ? (
          <span className="docs-code-language">{languageLabel}</span>
        ) : (
          title
        )
      }
      data-line-numbers={
        props['data-line-numbers'] === false ? undefined : true
      }
      className={cn('bg-fd-card shadow-none', className)}
      viewportProps={{
        ...props.viewportProps,
        className: cn('overflow-auto', props.viewportProps?.className),
      }}
    >
      <FumadocsCodeBlockPre>{props.children}</FumadocsCodeBlockPre>
    </FumadocsCodeBlock>
  );
}
