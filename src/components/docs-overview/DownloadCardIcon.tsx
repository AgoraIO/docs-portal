import { PackageIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { isMonochromePlatformIcon } from './platform-icon-src';

export function DownloadCardIcon({ src }: { src?: string }) {
  const [failedSrc, setFailedSrc] = useState<string>();

  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
    >
      {src && src !== failedSrc ? (
        <img
          alt=""
          className={cn(
            'size-7 object-contain',
            isMonochromePlatformIcon(src) && 'dark:invert',
          )}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
          src={src}
        />
      ) : (
        <PackageIcon className="size-6" />
      )}
    </span>
  );
}
