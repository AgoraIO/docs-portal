import type { CalloutType } from 'fumadocs-ui/components/callout';

export const directiveCalloutTypes = {
  caution: 'warning',
  danger: 'error',
  error: 'error',
  info: 'info',
  note: 'info',
  ok: 'success',
  success: 'success',
  tip: 'success',
  warn: 'warning',
  warning: 'warning',
} satisfies Record<string, CalloutType>;
