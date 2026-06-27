import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { FaqCatalog } from './FaqCatalog';
import { faqItems } from './faq-data';

const faqRoot = path.join(process.cwd(), 'content/docs/en/api-reference/faq');

function listFaqPages(dir = faqRoot): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listFaqPages(entryPath);
    }

    if (!entry.name.endsWith('.mdx')) {
      return [];
    }

    return [
      `/en/${path
        .relative(path.join(process.cwd(), 'content/docs/en'), entryPath)
        .replace(/\.mdx$/, '')
        .split(path.sep)
        .join('/')}`,
    ];
  });
}

function listFaqMetaFiles(dir = faqRoot): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listFaqMetaFiles(entryPath);
    }

    return entry.name === 'meta.json' ? [entryPath] : [];
  });
}

function resolvePageEntry(dir: string, page: string) {
  return (
    existsSync(path.join(dir, `${page}.mdx`)) ||
    existsSync(path.join(dir, page))
  );
}

function listFaqLocalImageRefs(dir = faqRoot): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listFaqLocalImageRefs(entryPath);
    }

    if (!entry.name.endsWith('.mdx')) {
      return [];
    }

    const content = readFileSync(entryPath, 'utf8');
    return Array.from(
      content.matchAll(/!\[[^\]]*\]\((\/images\/faq\/[^)]+)\)/g),
    ).map((match) => match[1]);
  });
}

describe('FaqCatalog', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/en/api-reference/faq');
  });

  it('renders the required categories and online Integration Issues links by default', () => {
    render(<FaqCatalog />);

    expect(
      screen.getAllByRole('button', { name: 'Integration Issues' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'Quality Issues' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'General Product Inquiry' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'Account and Billing' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'Other Issues' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole('link', {
        name: /Why can't I get the device ID on Chrome 81\?/,
      }),
    ).toHaveAttribute(
      'href',
      '/en/api-reference/faq/integration/empty_deviceId',
    );
  });

  it('switches categories and filters by platform', () => {
    render(<FaqCatalog />);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Integration Issues' })[0],
    );

    expect(
      screen.getByRole('link', {
        name: /Why can't I get the device ID on Chrome 81\?/,
      }),
    ).toBeVisible();

    fireEvent.click(screen.getAllByRole('button', { name: 'Web' })[0]);

    expect(
      screen.getByRole('link', {
        name: /Why is the camera light still on after I disable my video on the Web\?/,
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', {
        name: /Why don't music files automatically resume playing after hanging up a system call on an Android device\?/,
      }),
    ).not.toBeInTheDocument();
  });

  it('shows migrated online articles from every FAQ category', () => {
    render(<FaqCatalog />);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Quality Issues' })[0],
    );
    expect(
      screen.getByRole('link', {
        name: /How to solve SEI-related issues\?/,
      }),
    ).toHaveAttribute('href', '/en/api-reference/faq/quality/sei');

    fireEvent.click(
      screen.getAllByRole('button', { name: 'General Product Inquiry' })[0],
    );
    expect(
      screen.getByRole('link', {
        name: /What's the difference between on-premise recording and cloud recording\?/,
      }),
    ).toHaveAttribute('href', '/en/api-reference/faq/product/onpremise_cloud');

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Account and Billing' })[0],
    );
    expect(
      screen.getByRole('link', {
        name: /Agora's free-of-charge policy for the first 10,000 minutes\?/,
      }),
    ).toHaveAttribute('href', '/en/api-reference/faq/account/billing_free');

    fireEvent.click(screen.getAllByRole('button', { name: 'Other Issues' })[0]);
    expect(
      screen.getByRole('link', {
        name: /How can I add a privacy manifest to my iOS app\?/,
      }),
    ).toHaveAttribute(
      'href',
      '/en/api-reference/faq/other/ios_privacy_manifest',
    );
  });

  it('filters against multi-value product and platform tags', async () => {
    render(<FaqCatalog />);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'General Product Inquiry' })[0],
    );
    fireEvent.pointerDown(
      screen.getByRole('button', {
        name: /All Products/,
      }),
      { button: 0 },
    );
    fireEvent.click(
      await screen.findByRole('menuitem', { name: /Cloud Recording/ }),
    );

    expect(
      screen.getByRole('link', {
        name: /What's the difference between on-premise recording and cloud recording\?/,
      }),
    ).toBeVisible();

    fireEvent.click(screen.getAllByRole('button', { name: 'Web' })[0]);

    expect(
      screen.queryByRole('link', {
        name: /What's the difference between on-premise recording and cloud recording\?/,
      }),
    ).not.toBeInTheDocument();
  });

  it('keeps generated FAQ links, content pages, navigation, and local assets in sync', () => {
    const faqPages = listFaqPages();
    const faqContentPages = faqPages.filter(
      (page) => page !== '/en/api-reference/faq/index',
    );
    const faqHrefs = faqItems.map((item) => item.href);

    expect(new Set(faqHrefs)).toHaveLength(faqHrefs.length);
    expect([...faqHrefs].sort()).toEqual([...faqContentPages].sort());

    for (const metaFile of listFaqMetaFiles()) {
      const meta = JSON.parse(readFileSync(metaFile, 'utf8')) as {
        pages?: string[];
      };
      const dir = path.dirname(metaFile);

      for (const page of meta.pages ?? []) {
        expect(resolvePageEntry(dir, page), `${metaFile}: ${page}`).toBe(true);
      }
    }

    for (const imageRef of listFaqLocalImageRefs()) {
      expect(
        existsSync(path.join(process.cwd(), 'public', imageRef)),
        imageRef,
      ).toBe(true);
    }
  });
});
