import { cn } from '@/lib/cn';
import { getOpenApiMethodBadgeClassName } from '@/lib/openapi/method-badge';

export function DocsSidebarEndpointLabel({
  method,
  title,
}: {
  method: string;
  title: string;
}) {
  return (
    <span className="flow-root min-w-0 flex-1 break-words leading-5 whitespace-normal">
      <span
        aria-hidden="true"
        className={cn(
          'float-right mt-0.5 ml-2 rounded border border-current/20 px-1.5 py-0.5 font-mono text-[10px] leading-none whitespace-nowrap',
          getOpenApiMethodBadgeClassName(method),
        )}
        data-openapi-method={method}
      >
        {method}
      </span>
      <span className="[overflow-wrap:anywhere]" title={title}>
        {title}
      </span>
      <span className="sr-only"> {method}</span>
    </span>
  );
}
