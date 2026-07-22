'use client';

import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/cn';
import type { DocsSidebarPickerItem } from '@/lib/docs-tree';

export function RtcClientApiSidebarPicker({
  items,
  mode,
  onSelectPath,
  triggerClassName,
}: {
  items: DocsSidebarPickerItem[];
  mode: 'desktop' | 'mobile';
  onSelectPath: () => void;
  triggerClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(
    () => () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    },
    [],
  );

  function openPicker() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }

  function scheduleClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  const triggerContent = (
    <>
      <span className="block min-w-0 flex-1 break-words text-pretty leading-5 whitespace-normal">
        客户端 API
      </span>
      <ChevronRightIcon className="ml-auto size-4 shrink-0 text-[color:var(--ink-4)] transition-transform group-data-[state=open]:rotate-90" />
    </>
  );

  return (
    <Popover
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setContainer(
            triggerRef.current?.closest<HTMLElement>(
              '[data-slot="dialog-content"]',
            ) ?? null,
          );
        }
        setOpen(nextOpen);
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        {mode === 'desktop' ? (
          <SidebarMenuButton
            aria-label="客户端 API，选择平台或语言"
            className={cn(triggerClassName, 'group')}
            onMouseEnter={openPicker}
            onMouseLeave={scheduleClose}
            ref={triggerRef}
            type="button"
          >
            {triggerContent}
          </SidebarMenuButton>
        ) : (
          <button
            aria-label="客户端 API，选择平台或语言"
            className={cn(triggerClassName, 'group')}
            onMouseEnter={openPicker}
            onMouseLeave={scheduleClose}
            ref={triggerRef}
            type="button"
          >
            {triggerContent}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label="选择 RTC 客户端 API 平台或语言"
        className="max-h-[min(36rem,var(--radix-popover-content-available-height))] w-[min(48rem,calc(100vw-2rem))] overflow-y-auto rounded-md p-4"
        collisionPadding={16}
        container={container}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onMouseEnter={openPicker}
        onMouseLeave={scheduleClose}
        onOpenAutoFocus={(event) => event.preventDefault()}
        side={mode === 'desktop' ? 'right' : 'bottom'}
        sideOffset={8}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {rtcClientApiGroups.map((group) => (
            <section key={group.title}>
              <h3 className="mb-2 border-border border-b px-1 pb-2 text-xs font-semibold text-muted-foreground">
                {group.title}
              </h3>
              <div className="flex flex-col gap-0.5">
                {items
                  .filter((item) => group.platformIds.has(item.platformId))
                  .map((item) => (
                    <Link
                      className="flex min-h-9 min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-[color:var(--docs-soft-fill)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                      key={`${item.title}-${item.url}`}
                      onClick={() => {
                        setOpen(false);
                        onSelectPath();
                      }}
                      params={{}}
                      search={{}}
                      to={item.url}
                    >
                      <img
                        alt=""
                        aria-hidden="true"
                        className="size-6 shrink-0"
                        src={getPlatformIconSrc(item.platformId)}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {item.title}
                      </span>
                      <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const rtcClientApiGroups = [
  {
    platformIds: new Set(['android', 'ios', 'harmonyos']),
    title: '移动端',
  },
  {
    platformIds: new Set([
      'cpp',
      'csharp',
      'electron',
      'macos',
      'mini-program',
      'web',
    ]),
    title: '桌面端与 Web',
  },
  {
    platformIds: new Set([
      'flutter',
      'react-native',
      'unity',
      'unreal-blueprint',
      'unreal-cpp',
    ]),
    title: '跨平台与游戏引擎',
  },
] as const;

const platformIconBaseUrl =
  'https://assets-docs.agora.io/images/api-reference/platforms';

const platformIconFiles: Record<string, string> = {
  android: 'android.svg',
  cpp: 'cpp.svg',
  csharp: 'csharp.svg',
  electron: 'electron.svg',
  flutter: 'flutter.svg',
  harmonyos: 'harmonyOS.svg',
  ios: 'ios.svg',
  macos: 'macos.svg',
  'mini-program': 'min-program.svg',
  'react-native': 'react-native.svg',
  unity: 'unity.svg',
  'unreal-blueprint': 'unreal-engine.svg',
  'unreal-cpp': 'unreal-engine.svg',
  web: 'js.svg',
};

function getPlatformIconSrc(platformId: string) {
  return `${platformIconBaseUrl}/${platformIconFiles[platformId] ?? 'all.svg'}`;
}
