import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';

export type MarkdownCard = {
  body: string;
  href: string;
  icon: string;
  title: string;
};

export type MarkdownLink = {
  href: string;
  label: string;
};

export type MarkdownSection = {
  body: string;
  links?: MarkdownLink[];
  title: string;
};

export type MarkdownPage = {
  cards?: MarkdownCard[];
  description: string;
  eyebrow?: string;
  quickstartBody?: string;
  quickstartTitle?: string;
  sections?: MarkdownSection[];
  title: string;
};

export type HomeMarkdownPages = Record<string, Record<string, MarkdownPage>>;

type RawPage = Omit<MarkdownPage, 'sections'> & {
  sections: MarkdownSection[];
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.resolve(__dirname, '../../content/home');

export function loadHomeMarkdownPages(): HomeMarkdownPages {
  return {
    en: {
      'ai-home': parseMarkdownFile(path.join(contentRoot, 'en/ai-home.md')),
      'overview-home': parseMarkdownFile(
        path.join(contentRoot, 'en/overview-home.md'),
      ),
    },
    'zh-CN': {
      'ai-home': parseMarkdownFile(path.join(contentRoot, 'zh-CN/ai-home.md')),
      'overview-home': parseMarkdownFile(
        path.join(contentRoot, 'zh-CN/overview-home.md'),
      ),
    },
  };
}

function parseMarkdownFile(filePath: string): MarkdownPage {
  const raw = readFileSync(filePath, 'utf8');
  const { body, frontmatter } = splitFrontmatter(raw);
  const data = (parseYaml(frontmatter) ?? {}) as Partial<RawPage>;

  return {
    cards: data.cards ?? [],
    description: data.description ?? '',
    eyebrow: data.eyebrow,
    quickstartBody: data.quickstartBody,
    quickstartTitle: data.quickstartTitle,
    sections: parseSections(body),
    title: data.title ?? 'Untitled',
  };
}

function splitFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return {
      body: raw.trim(),
      frontmatter: '',
    };
  }

  return {
    body: match[2].trim(),
    frontmatter: match[1],
  };
}

function parseSections(markdown: string): MarkdownSection[] {
  if (!markdown.trim()) {
    return [];
  }

  const lines = markdown.split('\n');
  const sections: Array<{
    links: MarkdownLink[];
    paragraphs: string[];
    title: string;
  }> = [];

  let current: (typeof sections)[number] | null = null;
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (!current || paragraphLines.length === 0) {
      return;
    }

    current.paragraphs.push(paragraphLines.join(' ').trim());
    paragraphLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      current = {
        links: [],
        paragraphs: [],
        title: trimmed.slice(3).trim(),
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = {
        links: [],
        paragraphs: [],
        title: '',
      };
      sections.push(current);
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph();
      const link = parseMarkdownLink(trimmed.slice(2).trim());
      if (link) {
        current.links.push(link);
      } else {
        current.paragraphs.push(trimmed.slice(2).trim());
      }
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();

  return sections
    .filter((section) => section.title || section.paragraphs.length > 0)
    .map((section) => ({
      body: section.paragraphs.join('\n\n'),
      links: section.links.length > 0 ? section.links : undefined,
      title: section.title || 'Section',
    }));
}

function parseMarkdownLink(value: string): MarkdownLink | null {
  const match = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!match) {
    return null;
  }

  return {
    href: match[2],
    label: match[1],
  };
}
