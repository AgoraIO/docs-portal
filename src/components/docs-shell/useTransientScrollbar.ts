'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLLBAR_VISIBLE_MS = 800;

export function useTransientScrollbar<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    let timeoutId: number | undefined;

    const handleScroll = () => {
      setIsScrollbarVisible(true);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        setIsScrollbarVisible(false);
      }, SCROLLBAR_VISIBLE_MS);
    };

    node.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      node.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const scrollToTop = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTop = 0;
    }
  }, []);

  return { isScrollbarVisible, scrollContainerRef: ref, scrollToTop };
}
