import type { GoldenReplayGateMode } from '../src/lib/search/golden-search-replay';

export type ReplayArguments = {
  gateMode: GoldenReplayGateMode;
  outputPath?: string;
};

export function parseReplayArguments(arguments_: readonly string[]) {
  const gateArgument = arguments_.find((argument) =>
    argument.startsWith('--gate='),
  );
  const gateMode = gateArgument?.slice('--gate='.length) ?? 'all';
  if (gateMode !== 'all' && gateMode !== 'preview-blockers') {
    throw new Error(`Unsupported replay gate mode: ${gateMode}`);
  }

  const outputPath = arguments_
    .find((argument) => argument.startsWith('--out='))
    ?.slice('--out='.length);

  return {
    gateMode,
    ...(outputPath ? { outputPath } : {}),
  } satisfies ReplayArguments;
}
