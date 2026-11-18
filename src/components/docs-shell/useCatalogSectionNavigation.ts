'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type CatalogSectionNavItem = {
  id: string;
  label: string;
};

export function useCatalogSectionNavigation({
  idAttribute,
  items,
  rootSelector,
  sectionSelector,
}: {
  idAttribute: string;
  items: readonly CatalogSectionNavItem[];
  rootSelector: string;
  sectionSelector: string;
}) {
  const [activeId, setActiveId] = useState('');
  const [availableIds, setAvailableIds] = useState<string[] | null>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    let animationFrame = 0;

    const sync = () => {
      animationFrame = 0;
      const sections = readRenderedSections(sectionSelector, idAttribute);

      if (sections.length > 0 || document.querySelector(rootSelector)) {
        setAvailableIds((current) => {
          const next = sections.map((section) => section.id);
          return equalStringArrays(current, next) ? current : next;
        });
      }

      setActiveId(readActiveSectionId(sections));
    };
    const scheduleSync = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(sync);
      }
    };
    const observer = new MutationObserver(scheduleSync);

    sync();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('scroll', scheduleSync, { passive: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('scroll', scheduleSync);
    };
  }, [idAttribute, rootSelector, sectionSelector]);

  useEffect(() => {
    if (!activeId) {
      return;
    }

    linkRefs.current.get(activeId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [activeId]);

  const availableItems = useMemo(() => {
    if (availableIds === null) {
      return items;
    }

    const availableIdSet = new Set(availableIds);
    return items.filter((item) => availableIdSet.has(item.id));
  }, [availableIds, items]);

  return {
    activeId,
    availableItems,
    setLinkRef(id: string, element: HTMLAnchorElement | null) {
      if (element) {
        linkRefs.current.set(id, element);
      } else {
        linkRefs.current.delete(id);
      }
    },
  };
}

type RenderedSection = {
  element: HTMLElement;
  id: string;
  rect: DOMRect;
};

function readRenderedSections(
  sectionSelector: string,
  idAttribute: string,
): RenderedSection[] {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>(sectionSelector),
  ).flatMap((element): RenderedSection[] => {
    const id = element.getAttribute(idAttribute);

    return id ? [{ element, id, rect: element.getBoundingClientRect() }] : [];
  });
  const visiblyRenderedSections = sections.filter(
    ({ rect }) => rect.width > 0 && rect.height > 0,
  );
  const renderedSections =
    visiblyRenderedSections.length > 0 ? visiblyRenderedSections : sections;
  const seenIds = new Set<string>();

  return renderedSections.filter(({ id }) => {
    if (seenIds.has(id)) {
      return false;
    }

    seenIds.add(id);
    return true;
  });
}

function readActiveSectionId(sections: RenderedSection[]) {
  const activationLine = Math.min(window.innerHeight * 0.25, 180);
  let activeId = sections[0]?.id ?? '';

  for (const section of sections) {
    if (section.rect.top > activationLine) {
      break;
    }

    activeId = section.id;
  }

  return activeId;
}

function equalStringArrays(current: string[] | null, next: string[]) {
  return (
    current !== null &&
    current.length === next.length &&
    current.every((value, index) => value === next[index])
  );
}
