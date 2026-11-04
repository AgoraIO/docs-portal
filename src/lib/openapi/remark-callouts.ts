import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

const quoteCallouts = {
  NOTE: { type: 'info', title: 'Note' },
  INFO: { type: 'info', title: 'Info' },
  TIP: { type: 'success', title: 'Tip' },
  SUCCESS: { type: 'success', title: 'Success' },
  IMPORTANT: { type: 'warning', title: 'Important' },
  WARNING: { type: 'warning', title: 'Warning' },
  CAUTION: { type: 'warning', title: 'Caution' },
  DANGER: { type: 'error', title: 'Danger' },
  ERROR: { type: 'error', title: 'Error' },
} as const;

export function getOpenApiQuoteCallout(marker: unknown) {
  return typeof marker === 'string' && Object.hasOwn(quoteCallouts, marker)
    ? quoteCallouts[marker as keyof typeof quoteCallouts]
    : undefined;
}

/** Honor explicit GitHub-style alert markers; never infer severity from prose. */
export function remarkOpenApiCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node) => {
      const paragraph = node.children[0];
      if (paragraph?.type !== 'paragraph') return;
      const first = paragraph.children[0];
      if (first?.type !== 'text') return;
      const marker = /^\[!([A-Z]+)\](?:[ \t]*\r?\n|[ \t]*$)/.exec(first.value);
      if (!marker || !getOpenApiQuoteCallout(marker[1])) return;

      first.value = first.value.slice(marker[0].length);
      if (!first.value) paragraph.children.shift();
      if (!paragraph.children.length) node.children.shift();
      node.data = {
        ...node.data,
        hProperties: {
          ...node.data?.hProperties,
          'data-callout': marker[1],
        },
      };
    });
  };
}
