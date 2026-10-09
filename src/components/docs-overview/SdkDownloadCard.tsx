import { DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import type { SdkDownloadVersion } from './sdk-downloads-data';

export function SdkDownloadCard({
  iconSrc,
  onDownload,
  title,
  version,
  versionSuffix,
}: {
  iconSrc: string;
  onDownload?: () => void;
  title: string;
  version: SdkDownloadVersion;
  versionSuffix?: string;
}) {
  const download = version.downloadLink ?? version.packageManager;
  const number =
    version.label.match(/^(?:版本|Version)\s+([^\s（(]+)/i)?.[1] ??
    version.id.split('-')[0];

  return (
    <article
      aria-label={title}
      className="flex min-w-0 flex-col rounded-md border border-border bg-background"
    >
      <div className="flex-1 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="m-0 text-base font-semibold text-foreground">
            {title}
          </h3>
          {download ? (
            <a
              aria-label={
                version.downloadLink ? `下载 ${title}` : `获取 ${title}`
              }
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={download}
              onClick={version.downloadLink ? onDownload : undefined}
              rel="noopener noreferrer"
              target="_blank"
              title={version.downloadLink ? `下载 ${title}` : `获取 ${title}`}
            >
              {version.downloadLink ? (
                <DownloadIcon aria-hidden="true" className="size-5" />
              ) : (
                <ExternalLinkIcon aria-hidden="true" className="size-5" />
              )}
            </a>
          ) : null}
        </div>
        <dl className="mt-4 grid gap-2 text-sm text-muted-foreground">
          {version.packageName ? (
            <div className="break-all">
              <dt className="inline">包名：</dt>
              <dd className="inline">{version.packageName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="inline">最新版本：</dt>
            <dd className="inline">
              v{number}
              {versionSuffix ? `（${versionSuffix}）` : null}
            </dd>
          </div>
          {version.md5 ? (
            <div className="break-all">
              <dt>MD5 值：</dt>
              <dd className="mt-1 font-mono text-xs">{version.md5}</dd>
            </div>
          ) : null}
        </dl>
        {version.packageManager && version.downloadLink ? (
          <a
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            href={version.packageManager}
            rel="noopener noreferrer"
            target="_blank"
          >
            包管理器{' '}
            <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
          </a>
        ) : null}
      </div>
      {version.releaseDate ? (
        <div className="flex items-center gap-2 border-border border-t px-5 py-3 text-sm text-muted-foreground">
          <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md">
            <img
              alt=""
              aria-hidden
              className="size-7"
              loading="lazy"
              src={iconSrc}
            />
          </span>
          <span>发布日期：{version.releaseDate}</span>
        </div>
      ) : null}
    </article>
  );
}
