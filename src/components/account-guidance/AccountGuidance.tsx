import { ArrowRightIcon, DownloadIcon } from 'lucide-react';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { zhCNSdkDownloadPlatforms } from '@/components/docs-overview/sdk-downloads-data.zh-cn';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  captureAccountFlow,
  getDocsAnonymousId,
  synchronizeDocsAccount,
} from '@/lib/analytics/posthog';
import type {
  AccountFlow,
  DocsAccount,
  DocsUserInfo,
} from '@/lib/auth/contracts';

export type ResourceAction = Omit<
  AccountFlow,
  'flowId' | 'sourcePath' | 'anonymousId'
>;
const ResourceActionContext = createContext<(action: ResourceAction) => void>(
  () => {},
);
const EXPOSURE_KEY = 'docs-account-guidance-shown';
let exposureWithoutStorage = false;

function hasExposure() {
  try {
    return (
      exposureWithoutStorage || sessionStorage.getItem(EXPOSURE_KEY) === '1'
    );
  } catch {
    return exposureWithoutStorage;
  }
}

function recordExposure() {
  try {
    sessionStorage.setItem(EXPOSURE_KEY, '1');
  } catch {
    exposureWithoutStorage = true;
  }
}

function activeAccount(info: DocsUserInfo): DocsAccount | null {
  return info.status === 'authenticated' &&
    Date.parse(info.expiresAt) > Date.now()
    ? info.user
    : null;
}

function loginUrl(flow: AccountFlow) {
  const params = new URLSearchParams({
    flow_id: flow.flowId,
    target: flow.target,
    resource_type: flow.resourceType,
  });
  const optional = {
    resource_id: flow.resourceId,
    source_path: flow.sourcePath,
    platform: flow.platform,
    version: flow.version,
    anonymous_id: flow.anonymousId,
  };
  for (const [key, value] of Object.entries(optional)) {
    if (value) params.set(key, value);
  }
  return `/api/auth/login?${params}`;
}

// Resource anchors retain their native action. This context only schedules the
// optional guidance after the click, and never waits for auth or analytics.
export function AccountGuidance({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const [flow, setFlow] = useState<AccountFlow | null>(null);
  const info = useRef<DocsUserInfo>({ status: 'unknown', error: 'pending' });
  const pending = useRef<AccountFlow | null>(null);
  const shown = useRef(false);
  const loginLink = useRef<HTMLAnchorElement>(null);
  const sdkPlatform = zhCNSdkDownloadPlatforms.find(
    (platform) => platform.id === flow?.platform,
  );
  const sdkVersion = sdkPlatform?.core
    .flatMap((product) => product.versions)
    .find((version) => version.id === flow?.version);

  useEffect(() => {
    info.current = { status: 'unknown', error: 'pending' };
    pending.current = null;
    setFlow(null);
    if (!enabled) return;
    let disposed = false;
    let request: AbortController | null = null;
    const refresh = async () => {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch('/api/userinfo', {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal,
        });
        const result: DocsUserInfo = await response.json();
        if (disposed || controller.signal.aborted) return;
        if (response.status === 401 && result.status === 'unauthenticated') {
          info.current = result;
          void synchronizeDocsAccount(null);
        } else if (
          response.ok &&
          result.status === 'authenticated' &&
          typeof result.user?.accountUid === 'string' &&
          (result.user.companyId === null ||
            typeof result.user.companyId === 'string') &&
          typeof result.expiresAt === 'string' &&
          activeAccount(result)
        ) {
          info.current = result;
          void synchronizeDocsAccount(result.user);
          pending.current = null;
          setFlow(null);
        } else {
          info.current = { status: 'unknown', error: 'unavailable' };
        }
      } catch {
        if (!disposed && request === controller) {
          info.current = { status: 'unknown', error: 'unavailable' };
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    void refresh();
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      disposed = true;
      pending.current = null;
      request?.abort();
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled]);

  useEffect(() => {
    if (!flow) return;
    let frame = 0;
    const expose = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState !== 'visible') return;
      frame = requestAnimationFrame(() => {
        if (
          document.visibilityState !== 'visible' ||
          pending.current?.flowId !== flow.flowId
        )
          return;
        if (activeAccount(info.current) || (!shown.current && hasExposure())) {
          pending.current = null;
          setFlow(null);
          return;
        }
        if (!shown.current) {
          shown.current = true;
          recordExposure();
          captureAccountFlow(
            'docs_account_guidance_shown',
            flow,
            activeAccount(info.current),
          );
        }
      });
    };
    expose();
    document.addEventListener('visibilitychange', expose);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', expose);
    };
  }, [flow]);

  const start = (action: ResourceAction) => {
    if (!enabled || window.location.pathname !== '/zh-CN/reference/sdks')
      return;
    const next: AccountFlow = {
      ...action,
      flowId: crypto.randomUUID(),
      sourcePath: window.location.pathname,
    };
    captureAccountFlow(
      'docs_resource_action_started',
      next,
      activeAccount(info.current),
    );
    if (activeAccount(info.current) || pending.current || hasExposure()) return;
    pending.current = next;
    shown.current = false;
    // A macrotask lets the native anchor action run before rendering the dialog.
    window.setTimeout(() => {
      if (
        pending.current?.flowId !== next.flowId ||
        activeAccount(info.current)
      )
        return;
      setFlow(next);
      void getDocsAnonymousId().then((anonymousId) => {
        if (pending.current?.flowId !== next.flowId) return;
        pending.current = { ...next, anonymousId };
        setFlow(pending.current);
      });
    }, 0);
  };

  const close = (
    event: 'docs_account_guidance_dismissed' | 'docs_account_login_clicked',
  ) => {
    if (!flow) return;
    // A click/close in a visible dialog is itself evidence of exposure, even
    // when it arrives before the scheduled first paint callback.
    if (!shown.current && document.visibilityState === 'visible') {
      shown.current = true;
      recordExposure();
      captureAccountFlow(
        'docs_account_guidance_shown',
        flow,
        activeAccount(info.current),
      );
    }
    if (shown.current)
      captureAccountFlow(event, flow, activeAccount(info.current));
    pending.current = null;
    setFlow(null);
  };

  return (
    <ResourceActionContext.Provider value={start}>
      {children}
      <Dialog
        open={Boolean(flow)}
        onOpenChange={(open) => {
          if (!open) close('docs_account_guidance_dismissed');
        }}
      >
        {flow ? (
          <DialogContent
            className="gap-0 overflow-hidden rounded-xl border-0 p-0 sm:max-w-[480px]"
            overlayClassName="bg-(--docs-overlay)"
            showCloseButton={false}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              loginLink.current?.focus();
            }}
            onInteractOutside={(event) => event.preventDefault()}
            onEscapeKeyDown={(event) => event.preventDefault()}
          >
            <div className="flex items-center gap-3 bg-muted/60 px-6 py-4 sm:px-8">
              <DownloadIcon
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-sm font-medium">实时消息 RTM SDK</p>
                {sdkPlatform ? (
                  <p className="text-xs text-muted-foreground">
                    {sdkPlatform.label}
                    {sdkVersion ? ` · ${sdkVersion.label}` : null}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-7 p-6 sm:p-8">
              <DialogHeader className="gap-3 text-left">
                <DialogTitle className="text-2xl leading-snug">
                  下一步，配置 RTM 服务
                </DialogTitle>
                <DialogDescription className="text-pretty leading-7">
                  登录声网控制台，获取 App ID 并开通 RTM 服务。
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-5">
                <p className="text-xs text-muted-foreground">
                  SDK 下载不受影响，控制台将在新标签页打开。
                </p>
                <Separator />
                <DialogFooter className="flex-row items-center justify-between gap-3 sm:justify-between">
                  <Button
                    size="xs"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => close('docs_account_guidance_dismissed')}
                  >
                    稍后再说
                  </Button>
                  <Button asChild size="lg">
                    <a
                      ref={loginLink}
                      href={loginUrl(flow)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => close('docs_account_login_clicked')}
                    >
                      登录并前往控制台
                      <ArrowRightIcon
                        aria-hidden="true"
                        data-icon="inline-end"
                      />
                    </a>
                  </Button>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </ResourceActionContext.Provider>
  );
}

export function useResourceAccountGuidance() {
  return useContext(ResourceActionContext);
}
