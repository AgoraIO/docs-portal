/** Only explicit, same-page groups with the same options may share a preference. */
export function codeTabGroupKey(
  scope: string,
  groupId: string | undefined,
  values: readonly string[],
  kind = 'code-tabs',
) {
  return groupId
    ? `docs:${kind}:v1:${scope}:${groupId}:${JSON.stringify([...new Set(values)].sort())}`
    : undefined;
}
