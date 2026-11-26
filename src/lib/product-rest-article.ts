import type { DocsSidebarNode, DocsSidebarPageNode } from './docs-tree';

// These references publish operations as headings in an article. Use the
// article's own TOC fragments so renaming a heading doesn't leave dead links.
const articleOutlines: Record<string, { headings: RegExp; grouped?: boolean }> =
  {
    'media-pull': { headings: /^(Create|Delete|List|Update) API$/ },
    'media-push': { headings: /^(Create|Delete|Update|Get|List):/ },
    'flexible-classroom/classroom-rest-api': {
      headings: /-related$/,
      grouped: true,
    },
    'agora-analytics/analytics-rest-api': {
      headings: /^(Call Inspector|Data Insights|Real-time Monitoring)$/,
      grouped: true,
    },
  };

export function getRestArticleOutline(url: string) {
  return articleOutlines[url.slice('/en/api-reference/api-ref/'.length)];
}

export function articleSidebarItems(
  page: DocsSidebarPageNode,
  outline: { headings: RegExp; grouped?: boolean },
  toc: { depth: number; title: string; url: string }[],
): DocsSidebarNode[] {
  const items: DocsSidebarNode[] = [page];
  let group: DocsSidebarNode[] | undefined;
  for (const item of toc) {
    const url = page.url + item.url;
    if (item.depth === 2) {
      group = undefined;
      if (!outline.headings.test(item.title)) continue;
      if (outline.grouped) {
        group = [];
        items.push({
          id: url,
          title: item.title,
          type: 'section',
          collapsible: true,
          children: group,
        });
        continue;
      }
    } else if (item.depth !== 3 || !group) continue;
    (group ?? items).push({ ...page, id: url, title: item.title, url });
  }
  return items;
}
