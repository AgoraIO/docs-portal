'use client';

import { ArrowRightIcon, SearchIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

// Adapted from Aceternity's Placeholders And Vanish Input. Search queries stay
// visible after submission; only the empty, unfocused hint rotates.
const hints = [
  '搜索文档、API 或错误码',
  '例如：Token 过期后如何处理',
  '例如：manualSOS、云端录制',
];

export function SearchInput({
  value,
  onChange,
  onClear,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [hint, setHint] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (value || focused || reduceMotion) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible')
        setHint((current) => (current + 1) % hints.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [value, focused, reduceMotion]);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);

  return (
    <search>
      <form
        className="search-page-input"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <SearchIcon aria-hidden="true" className="search-page-input-icon" />
        <div className="relative min-w-0 flex-1">
          <label className="sr-only" htmlFor="full-docs-search">
            搜索文档、API 或错误码
          </label>
          <input
            autoComplete="off"
            className="search-page-query"
            id="full-docs-search"
            maxLength={500}
            onBlur={() => setFocused(false)}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && event.nativeEvent.isComposing)
                event.preventDefault();
            }}
            placeholder="搜索文档、API 或错误码"
            ref={inputRef}
            type="search"
            value={value}
          />
          <div aria-hidden="true" className="search-page-placeholder">
            <AnimatePresence initial={false} mode="wait">
              {!value && (
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  className="block truncate"
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                  key={focused || reduceMotion ? 'static' : hint}
                  transition={{ duration: reduceMotion ? 0 : 0.18 }}
                >
                  {hints[focused || reduceMotion ? 0 : hint]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        {value && (
          <Button
            aria-label="清空关键词"
            className="search-page-input-action"
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            size="icon"
            type="button"
            variant="ghost"
          >
            <XIcon />
          </Button>
        )}
        {!value && (
          <kbd className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
            ⌘ K
          </kbd>
        )}
        <Button
          aria-label="搜索"
          className="search-page-input-action"
          disabled={!value.trim()}
          size="icon"
          type="submit"
        >
          <ArrowRightIcon />
        </Button>
      </form>
    </search>
  );
}
