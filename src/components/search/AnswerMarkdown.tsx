import type { RootContent } from 'mdast';
import { Fragment, type ReactNode, useMemo } from 'react';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

// Deliberately exclude HTML, image fetching, MDX and model-provided navigation.
function renderNode(node: RootContent): ReactNode {
  const children =
    'children' in node
      ? node.children.map((child) => (
          <Fragment key={`${child.type}:${child.position?.start.offset}`}>
            {renderNode(child as RootContent)}
          </Fragment>
        ))
      : null;
  switch (node.type) {
    case 'text':
      return node.value;
    case 'paragraph':
      return <p>{children}</p>;
    case 'heading':
      return <p className="font-semibold">{children}</p>;
    case 'strong':
      return <strong>{children}</strong>;
    case 'emphasis':
      return <em>{children}</em>;
    case 'inlineCode':
      return <code>{node.value}</code>;
    case 'code':
      return (
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
          <code>{node.value}</code>
        </pre>
      );
    case 'list':
      return node.ordered ? (
        <ol className="list-decimal pl-5">{children}</ol>
      ) : (
        <ul className="list-disc pl-5">{children}</ul>
      );
    case 'listItem':
      return <li>{children}</li>;
    case 'blockquote':
      return <blockquote className="border-l-2 pl-3">{children}</blockquote>;
    case 'break':
      return <br />;
    case 'thematicBreak':
      return <hr />;
    case 'link':
    case 'linkReference':
      return children;
    default:
      return null;
  }
}
export function AnswerMarkdown({ text }: { text: string }) {
  const tree = useMemo(() => unified().use(remarkParse).parse(text), [text]);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {tree.children.map((node) => (
        <Fragment key={`${node.type}:${node.position?.start.offset}`}>
          {renderNode(node)}
        </Fragment>
      ))}
    </div>
  );
}
