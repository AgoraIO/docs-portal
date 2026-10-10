'use client';

import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useId } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { SearchPageState } from '@/lib/search/search-page-state';

const types = [
  { value: 'all', label: '全部文档' },
  { value: 'docs', label: '文档与指南' },
  { value: 'openapi', label: 'REST API' },
] as const;

// Aceternity Animated Tabs' shared-layout indicator, with Radix keyboard behavior.
export function SearchTypeTabs({
  value,
  onChange,
}: {
  value: SearchPageState['type'];
  onChange: (value: SearchPageState['type']) => void;
}) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  return (
    <LayoutGroup id={id}>
      <ToggleGroup
        aria-label="内容类型"
        className="search-page-types"
        onValueChange={(next) => {
          if (next === 'all' || next === 'docs' || next === 'openapi')
            onChange(next);
        }}
        spacing={1}
        type="single"
        value={value}
      >
        {types.map((item) => (
          <ToggleGroupItem
            className="search-page-type"
            key={item.value}
            value={item.value}
          >
            {value === item.value && (
              <motion.span
                aria-hidden="true"
                className="search-page-type-active"
                layoutId="active-type"
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              />
            )}
            <span className="relative">{item.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </LayoutGroup>
  );
}
