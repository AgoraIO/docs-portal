import type { ClientApiPageProps } from 'fumadocs-openapi/ui/create-client';
import { createClientAPIPage } from 'fumadocs-openapi/ui/create-client';
import { cn } from '@/lib/cn';

const ClientAPIPage = createClientAPIPage({
  playground: {
    enabled: false,
  },
});

export function FumadocsOpenApiContent({
  className,
  pageProps,
}: {
  className?: string;
  pageProps: ClientApiPageProps;
}) {
  return (
    <div className={cn('not-prose openapi-operation', className)}>
      <ClientAPIPage {...pageProps} />
    </div>
  );
}
