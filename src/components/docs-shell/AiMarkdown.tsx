import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import type { ReactNode } from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';

type AiMarkdownProps = {
  children: string;
};

let markdownProcessor: ReturnType<typeof createMarkdownProcessor> | undefined;

export function AiMarkdown({ children }: AiMarkdownProps) {
  markdownProcessor ??= createMarkdownProcessor();
  const content = markdownProcessor.processSync({ value: children })
    .result as ReactNode;

  return <div className="ai-markdown prose-no-margin">{content}</div>;
}

function createMarkdownProcessor() {
  function rehypeReact(this: { compiler?: unknown }) {
    this.compiler = (tree: Parameters<typeof toJsxRuntime>[0]) =>
      toJsxRuntime(tree, {
        development: false,
        ...JsxRuntime,
        components: defaultMdxComponents,
      });
  }

  // Do not enable allowDangerousHtml: model output must remain inert markup.
  return remark().use(remarkGfm).use(remarkRehype).use(rehypeReact);
}
