const METHOD_BADGE_CLASSES = {
  GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  PATCH: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
} as const;

export function getOpenApiMethodBadgeClassName(method: string) {
  return (
    METHOD_BADGE_CLASSES[
      method.trim().toUpperCase() as keyof typeof METHOD_BADGE_CLASSES
    ] ?? 'bg-muted text-muted-foreground'
  );
}
