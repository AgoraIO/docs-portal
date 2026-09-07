import type { ReactNode } from 'react';

export function OpenApiExamplesRail({ children }: { children: ReactNode }) {
  return (
    <div className="openapi-examples-rail-anchor">
      <div
        className="openapi-examples-rail min-w-0 max-w-full"
        data-testid="openapi-examples-rail"
      >
        <div
          className="openapi-examples-rail-content min-w-0 max-w-full"
          data-testid="openapi-examples-rail-content"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
