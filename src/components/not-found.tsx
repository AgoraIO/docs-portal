import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">
      <div aria-hidden className="home-grid absolute inset-0 opacity-70" />
      <div className="relative z-10 flex w-full max-w-xl flex-col gap-6 rounded-[2rem] border border-border bg-card/88 p-8 text-center shadow-[0_24px_80px_-44px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary">
          404
        </p>
        <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground">
          The page left the map.
        </h1>
        <p className="text-base leading-8 text-muted-foreground">
          The route still resolves inside the docs system, but this specific
          page is not available.
        </p>
        <div className="flex justify-center">
          <Link
            className={buttonVariants({ className: 'pl-4 pr-3' })}
            params={{}}
            search={{}}
            to="/"
          >
            <ArrowLeft />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
