'use client';

import { HashIcon } from 'lucide-react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'motion/react';
import { type MouseEvent, useId, useState } from 'react';
import {
  getCnSearchPlatformLabel,
  getCnSearchSdkLabel,
} from '@/lib/search/cn-search-context';
import type { SearchPageGroup } from '@/lib/search/cn-search-page';
import { getCnSearchResultEntries } from '@/lib/search/cn-search-presentation';
import type { HighlightSegment } from '@/lib/search/meilisearch-client';
import { CnSearchResultContent } from './CnSearchResultContent';

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

export function SearchResultList({
  groups,
  productLabel,
  onSelectResult,
  rankOffset = 0,
  query = '',
  platform,
}: {
  groups: SearchPageGroup[];
  productLabel: (product?: string) => string;
  rankOffset?: number;
  query?: string;
  platform?: string;
  onSelectResult?: (
    event: MouseEvent<HTMLAnchorElement>,
    path: string,
    rank: number,
    sectionRank?: number,
  ) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const id = useId();
  const reduceMotion = useReducedMotion();
  const entries = getCnSearchResultEntries(groups, query, platform);
  return (
    <LayoutGroup id={id}>
      <ul className="search-page-results">
        {entries.map(
          ({ key, group, hit, sectionRank, otherSections }, index) => {
            const sdkLabel = getCnSearchSdkLabel(group.pageUrl);
            const context = [
              ...new Set(
                [
                  group.product ? productLabel(group.product) : undefined,
                  ...(sdkLabel
                    ? [sdkLabel]
                    : group.platform.map(getCnSearchPlatformLabel)),
                ].filter((value): value is string => Boolean(value)),
              ),
            ];
            const rank = index + 1 + rankOffset;
            const pageHref = hit.url.split('#', 1)[0];
            const primarySectionRank = hit.url.includes('#')
              ? sectionRank
              : undefined;
            function track(
              event: MouseEvent<HTMLAnchorElement>,
              href: string,
              section?: number,
            ) {
              onSelectResult?.(
                event,
                href,
                rank,
                ...(section ? [section] : []),
              );
            }
            return (
              <li
                className="search-page-result rounded-lg bg-muted/40"
                key={key}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setActive(null);
                }}
                onFocus={() => setActive(key)}
                onMouseEnter={() => setActive(key)}
                onMouseLeave={() => setActive(null)}
              >
                <AnimatePresence>
                  {active === key && (
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
                <CnSearchResultContent
                  title={
                    <a
                      className="search-page-result-title search-page-result-link"
                      href={hit.url}
                      onClick={(event) =>
                        track(event, hit.url, primarySectionRank)
                      }
                      onAuxClick={(event) =>
                        track(event, hit.url, primarySectionRank)
                      }
                    >
                      <SearchHighlight segments={hit.highlights.sectionTitle} />
                    </a>
                  }
                  path={hit.headingPath}
                  context={context.map((label) => ({ key: label, label }))}
                  description={
                    <SearchHighlight segments={hit.highlights.content} />
                  }
                >
                  {hit.url !== pageHref && (
                    <a
                      className="search-page-section search-page-page-entrance"
                      href={pageHref}
                      onClick={(event) => track(event, pageHref)}
                      onAuxClick={(event) => track(event, pageHref)}
                    >
                      查看整页
                    </a>
                  )}
                  {otherSections.length > 0 && (
                    <details className="search-page-more-sections">
                      <summary>另 {otherSections.length} 个命中章节</summary>
                      <ul>
                        {otherSections.map((section) => (
                          <li key={section.id}>
                            <a
                              className="search-page-section"
                              href={section.url}
                              onClick={(event) =>
                                track(
                                  event,
                                  section.url,
                                  group.sections.indexOf(section) + 1,
                                )
                              }
                              onAuxClick={(event) =>
                                track(
                                  event,
                                  section.url,
                                  group.sections.indexOf(section) + 1,
                                )
                              }
                            >
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
                </CnSearchResultContent>
              </li>
            );
          },
        )}
      </ul>
    </LayoutGroup>
  );
}
