import { PackageIcon } from 'lucide-react';
import { useState } from 'react';

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
          className="size-7 object-contain"
          loading="lazy"
          onError={() => setFailedSrc(src)}
          src={src}
        />
      ) : (
        <PackageIcon className="size-6" />
      )}
    </span>
  );
}
