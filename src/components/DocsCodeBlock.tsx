import {
  CodeBlock,
  type CodeBlockProps,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import { cn } from '@/lib/cn';

export function DocsCodeBlock({ className, ...props }: CodeBlockProps) {
  return (
    <CodeBlock
      {...props}
      data-line-numbers
      className={cn('bg-fd-card shadow-none', className)}
      viewportProps={{
        ...props.viewportProps,
        className: cn('overflow-auto', props.viewportProps?.className),
      }}
    >
      <Pre>{props.children}</Pre>
    </CodeBlock>
  );
}
