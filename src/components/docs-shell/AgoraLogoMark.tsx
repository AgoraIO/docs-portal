import { cn } from '@/lib/cn';

export function AgoraLogoMark({
  className,
  alt = 'Agora',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      alt={alt}
      className={cn('h-8 w-auto', className)}
      src="/agora-logo.png"
      {...props}
    />
  );
}
