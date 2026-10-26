'use client';

import { ArrowUpRightIcon, HashIcon } from 'lucide-react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'motion/react';
import { type MouseEvent, useId, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getPlatformLabel, isKnownPlatform } from '@/lib/platforms/registry';
import { getCnSearchSdkLabel } from '@/lib/search/cn-search-context';
import {
  getSearchPageGroupKey,
  getSearchSectionHref,
  type SearchPageGroup,
} from '@/lib/search/cn-search-page';
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
  onSelectResult,
}: {
  groups: SearchPageGroup[];
  productLabel: (product?: string) => string;
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
  return (
    <LayoutGroup id={id}>
      <ul className="search-page-results">
        {groups.map((group, groupIndex) => {
          const sdkLabel = getCnSearchSdkLabel(group.pageUrl);
          const first = group.sections[0];
          const groupKey = getSearchPageGroupKey(group);
          const firstHref = getSearchSectionHref(group.pageUrl, first.url);
          const ancestors = first.headingPath
            .slice(0, -1)
            .filter((heading) => heading !== group.title)
            .slice(-2);
          return (
            <li
              className="search-page-result"
              key={groupKey}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setActive(null);
              }}
              onFocus={() => setActive(groupKey)}
              onMouseEnter={() => setActive(groupKey)}
              onMouseLeave={() => setActive(null)}
            >
              <AnimatePresence>
                {active === groupKey && (
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
                    {sdkLabel ? (
                      <span>{sdkLabel}</span>
                    ) : (
                      group.platform.map((platform) => (
                        <span key={platform}>
                          {isKnownPlatform(platform)
                            ? getPlatformLabel(platform, 'zh-CN')
                            : platform}
                        </span>
                      ))
                    )}
                    {group.version && <span>{group.version}</span>}
                  </div>
                </div>
                <div className="search-page-result-heading">
                  <a
                    className="search-page-result-title"
                    href={group.pageUrl}
                    onClick={(event) =>
                      onSelectResult?.(event, group.pageUrl, groupIndex + 1)
                    }
                    onAuxClick={(event) =>
                      onSelectResult?.(event, group.pageUrl, groupIndex + 1)
                    }
                  >
                    <h2>{group.title}</h2>
                    <ArrowUpRightIcon
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  </a>
                  {first.sectionTitle !== group.title && (
                    <a
                      className="search-page-section"
                      href={firstHref}
                      onClick={(event) =>
                        onSelectResult?.(event, firstHref, groupIndex + 1, 1)
                      }
                      onAuxClick={(event) =>
                        onSelectResult?.(event, firstHref, groupIndex + 1, 1)
                      }
                    >
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
                      {group.sections.slice(1).map((section, sectionIndex) => (
                        <li key={section.url}>
                          <a
                            onClick={(event) =>
                              onSelectResult?.(
                                event,
                                getSearchSectionHref(
                                  group.pageUrl,
                                  section.url,
                                ),
                                groupIndex + 1,
                                sectionIndex + 2,
                              )
                            }
                            onAuxClick={(event) =>
                              onSelectResult?.(
                                event,
                                getSearchSectionHref(
                                  group.pageUrl,
                                  section.url,
                                ),
                                groupIndex + 1,
                                sectionIndex + 2,
                              )
                            }
                            className="search-page-section"
                            href={getSearchSectionHref(
                              group.pageUrl,
                              section.url,
                            )}
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
              </div>
            </li>
          );
        })}
      </ul>
    </LayoutGroup>
  );
}
