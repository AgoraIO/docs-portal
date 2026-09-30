import { DownloadIcon, ExternalLinkIcon, QrCodeIcon } from 'lucide-react';
import { useState } from 'react';
import { getPlatformIconSrc } from './platform-icon-src';

type DownloadResource = {
  coverSrc?: string;
  demoLinks?: readonly { href: string; label: string }[];
  description?: string;
  href?: string;
  platform?: string;
  qrAlt?: string;
  qrCodes?: readonly { alt: string; src: string }[];
  qrExpanded?: boolean;
  qrSrc?: string;
  title: string;
  version?: string;
};

export function DownloadResourceCards({
  items,
}: {
  items: readonly DownloadResource[];
}) {
  return (
    <section aria-label="下载资源" className="not-prose my-6">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          if (item.coverSrc) {
            return (
              <DemoResourceCard
                item={item}
                key={`${item.title}-${item.platform ?? ''}-${item.href ?? ''}`}
                wide={items.length === 1}
              />
            );
          }

          const isDownload = Boolean(
            item.href && /\.(?:zip|tgz|apk)(?:[?#]|$)/i.test(item.href),
          );
          const isExternal = /^https?:\/\//.test(item.href ?? '');
          const action = isDownload ? '下载' : '获取';
          return (
            <article
              aria-label={item.title}
              className="flex min-w-0 flex-col rounded-md border border-border bg-background"
              key={`${item.title}-${item.platform ?? ''}-${item.href ?? ''}`}
            >
              <div className="flex-1 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="m-0 min-w-0 break-words text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  {item.href ? (
                    <a
                      aria-label={`${action} ${item.title}`}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      href={item.href}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      target={isExternal ? '_blank' : undefined}
                      title={`${action} ${item.title}`}
                    >
                      {isDownload ? (
                        <DownloadIcon aria-hidden="true" className="size-5" />
                      ) : (
                        <ExternalLinkIcon
                          aria-hidden="true"
                          className="size-5"
                        />
                      )}
                    </a>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="mb-0 mt-4 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
                {item.version ? (
                  <dl className="mb-0 mt-4 text-sm text-muted-foreground">
                    <dt className="inline">版本：</dt>
                    <dd className="inline">v{item.version}</dd>
                  </dl>
                ) : null}
              </div>
              {item.qrSrc ? (
                <div className="border-border border-t px-5 py-3">
                  <DownloadQrCode
                    alt={item.qrAlt ?? `${item.title} 下载二维码`}
                    src={item.qrSrc}
                  />
                </div>
              ) : item.platform ? (
                <div className="flex items-center gap-2 border-border border-t px-5 py-3 text-sm text-muted-foreground">
                  <img
                    alt=""
                    aria-hidden
                    className="size-7"
                    loading="lazy"
                    src={getPlatformIconSrc(item.platform)}
                  />
                  <span>
                    {item.platform === 'ios'
                      ? 'iOS'
                      : item.platform === 'android'
                        ? 'Android'
                        : item.platform}
                  </span>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DemoResourceCard({
  item,
  wide,
}: {
  item: DownloadResource;
  wide: boolean;
}) {
  const links =
    item.demoLinks ??
    (item.href ? [{ href: item.href, label: 'Demo 体验' }] : []);
  const qrCodes =
    item.qrCodes ??
    (item.qrSrc
      ? [{ alt: item.qrAlt ?? `${item.title} 下载二维码`, src: item.qrSrc }]
      : []);

  return (
    <article
      aria-label={item.title}
      className={`flex min-w-0 gap-3 rounded-md border border-border bg-background p-3 ${wide ? 'md:col-span-2' : ''}`}
    >
      <img
        alt={`${item.title} Demo 封面`}
        className="aspect-[4/3] w-24 shrink-0 self-start rounded-md object-cover sm:w-28"
        loading="lazy"
        referrerPolicy="no-referrer"
        src={item.coverSrc}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-1">
            <h3 className="m-0 min-w-0 break-words text-base font-semibold text-foreground">
              {item.title}
            </h3>
            {qrCodes.length > 0 && links.length > 0 && !item.qrExpanded ? (
              <details className="relative shrink-0">
                <summary
                  aria-label={`查看${item.title}二维码`}
                  className="flex size-8 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden"
                  title={`查看${item.title}二维码`}
                >
                  <QrCodeIcon aria-hidden="true" className="size-5" />
                </summary>
                <div className="absolute top-9 right-0 z-20 flex w-36 flex-wrap gap-2 rounded-md border border-border bg-background p-3 shadow-md">
                  {qrCodes.map((code) => (
                    <DownloadQrCode
                      alt={code.alt}
                      key={code.src}
                      src={code.src}
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
          {item.description ? (
            <p className="mb-0 mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          ) : null}
          {links.length > 0 ? (
            <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3">
              {links.map((link) => {
                const isExternal = /^https?:\/\//.test(link.href);
                return (
                  <a
                    className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
                    href={link.href}
                    key={link.href}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    target={isExternal ? '_blank' : undefined}
                  >
                    {link.label}
                    <ExternalLinkIcon aria-hidden="true" className="size-4" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
        {qrCodes.length > 0 && (item.qrExpanded || links.length === 0) ? (
          <div className="flex flex-wrap gap-3">
            {qrCodes.map((code) => (
              <DownloadQrCode alt={code.alt} key={code.src} src={code.src} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function DownloadQrCode({ alt, src }: { alt: string; src: string }) {
  const [failed, setFailed] = useState(false);

  return failed ? (
    <a
      className="text-sm text-primary hover:underline"
      href={src}
      rel="noopener noreferrer"
      target="_blank"
    >
      查看下载二维码
    </a>
  ) : (
    <img
      alt={alt}
      className="size-28 object-contain"
      loading="lazy"
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      src={src}
    />
  );
}
