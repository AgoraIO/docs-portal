import { Heading } from 'fumadocs-ui/components/heading';
import { type ComponentProps, useId } from 'react';

/** Keep the copy button's live announcement out of the heading's name. */
export function DocsHeading({
  children,
  ...props
}: ComponentProps<typeof Heading>) {
  const labelId = useId();
  return (
    <Heading aria-labelledby={labelId} {...props}>
      <span id={labelId}>{children}</span>
    </Heading>
  );
}
