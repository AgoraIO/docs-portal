import { ArrowDownToLineIcon, ArrowRightIcon, PlayIcon } from 'lucide-react';

const SDK_HREF = '/zh-CN/reference/sdks?product=video';
const DEMO_HREF = '/zh-CN/reference/demo';

export function IntroductionSdkDemoActions() {
  return (
    <nav
      aria-label="SDK 与 Demo 快捷入口"
      className="not-prose flex flex-wrap items-center gap-2.5"
      data-testid="introduction-sdk-demo-actions"
    >
      <a
        className="group inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        href={DEMO_HREF}
      >
        <PlayIcon aria-hidden="true" className="size-4 shrink-0" />
        <span>体验 Demo</span>
        <ArrowRightIcon
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      </a>
      <a
        className="group inline-flex min-h-10 items-center gap-2 rounded-md border border-[color:var(--line-strong)] bg-background px-4 text-sm font-medium text-[color:var(--ink-2)] transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        href={SDK_HREF}
      >
        <ArrowDownToLineIcon aria-hidden="true" className="size-4 shrink-0" />
        <span>下载 SDK</span>
        <ArrowRightIcon
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      </a>
    </nav>
  );
}
