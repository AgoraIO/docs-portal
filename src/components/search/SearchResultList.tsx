'use client';

import { ArrowUpRightIcon, HashIcon } from 'lucide-react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'motion/react';
import { useId, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getPlatformLabel, isKnownPlatform } from '@/lib/platforms/registry';
import type { SearchPageGroup } from '@/lib/search/cn-search-page';
import type { HighlightSegment } from '@/lib/search/meilisearch-client';

export function SearchHighlight({
  segments,
}: {
  segments: HighlightSegment[];
}) {
  let offset = 0;
  return segments.map((segment) => {
    const key = offset;
    offset += segment.text.length;
    return segment.highlighted ? (
      <mark className="search-page-mark" key={key}>
        {segment.text}
      </mark>
    ) : (
      segment.text
    );
  });
}

// The moving surface follows Aceternity Card Hover Effect, adapted to document
// rows. Focus gets the same feedback; navigation remains a normal anchor.
export function SearchResultList({
  groups,
  productLabel,
}: {
  groups: SearchPageGroup[];
  productLabel: (product?: string) => string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const id = useId();
  const reduceMotion = useReducedMotion();
  return (
    <LayoutGroup id={id}>
      <ul className="search-page-results">
        {groups.map((group) => {
          const first = group.sections[0];
          const ancestors = first.headingPath
            .slice(0, -1)
            .filter((heading) => heading !== group.title)
            .slice(-2);
          return (
            <li
              className="search-page-result"
              key={group.pageUrl}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setActive(null);
              }}
              onFocus={() => setActive(group.pageUrl)}
              onMouseEnter={() => setActive(group.pageUrl)}
              onMouseLeave={() => setActive(null)}
            >
              <AnimatePresence>
                {active === group.pageUrl && (
                  <motion.div
                    aria-hidden="true"
                    animate={{ opacity: 1 }}
                    className="search-page-result-hover"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    layoutId="result-hover"
                    transition={{ duration: reduceMotion ? 0 : 0.15 }}
                  />
                )}
              </AnimatePresence>
              <div className="relative min-w-0">
                <div className="search-page-result-context">
                  <div className="search-page-result-path">
                    {group.product && (
                      <span>{productLabel(group.product)}</span>
                    )}
                    {ancestors.length > 0 && (
                      <>
                        {group.product && <span aria-hidden="true">/</span>}
                        <span>{ancestors.join(' / ')}</span>
                      </>
                    )}
                  </div>
                  <div className="search-page-result-meta">
                    {group.docType === 'openapi' && (
                      <Badge variant="secondary">REST API</Badge>
                    )}
                    {group.platform.map((platform) => (
                      <span key={platform}>
                        {isKnownPlatform(platform)
                          ? getPlatformLabel(platform, 'zh-CN')
                          : platform}
                      </span>
                    ))}
                    {group.version && <span>{group.version}</span>}
                  </div>
                </div>
                <div className="search-page-result-heading">
                  <a className="search-page-result-title" href={first.url}>
                    <h2>{group.title}</h2>
                    <ArrowUpRightIcon
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  </a>
                  {first.sectionTitle !== group.title && (
                    <a className="search-page-section" href={first.url}>
                      <HashIcon
                        aria-hidden="true"
                        className="size-3.5 shrink-0"
                      />
                      <span>
                        <SearchHighlight
                          segments={first.highlights.sectionTitle}
                        />
                      </span>
                    </a>
                  )}
                </div>
                <p className="search-page-snippet">
                  <SearchHighlight segments={first.highlights.content} />
                </p>
                {group.sections.length > 1 && (
                  <details className="search-page-more-sections">
                    <summary>另 {group.sections.length - 1} 个命中章节</summary>
                    <ul>
                      {group.sections.slice(1).map((section) => (
                        <li key={section.url}>
                          <a className="search-page-section" href={section.url}>
                            <HashIcon
                              aria-hidden="true"
                              className="size-3.5 shrink-0"
                            />
                            <span>
                              <SearchHighlight
                                segments={section.highlights.sectionTitle}
                              />
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </LayoutGroup>
  );
}
