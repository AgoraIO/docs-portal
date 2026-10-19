import { randomUUID } from 'node:crypto';
import {
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { requireText } from '../../src/lib/ai-kb/corpus';
export const readJson = async (file: string): Promise<unknown> =>
  JSON.parse(await readFile(file, 'utf8'));
export function requiredArg(value: string | undefined, name: string): string {
  return requireText(value, `--${name}`);
}
export async function atomicWriteJson(
  output: string,
  value: unknown,
  inputs: string[],
  forbiddenRoots: string[] = [],
) {
  const target = path.resolve(output);
  if (inputs.some((input) => path.resolve(input) === target))
    throw new Error('Output must not overwrite an input');
  await mkdir(path.dirname(target), { recursive: true });
  const parent = await realpath(path.dirname(target));
  const canonicalTarget = path.join(parent, path.basename(target));
  for (const root of forbiddenRoots) {
    const actual = await realpath(root);
    if (
      canonicalTarget === actual ||
      canonicalTarget.startsWith(actual + path.sep)
    )
      throw new Error('Output must be outside published input tree');
  }
  let outputStat: Awaited<ReturnType<typeof stat>> | undefined;
  try {
    outputStat = await stat(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  for (const input of inputs) {
    const inputPath = await realpath(input);
    const inputStat = await stat(inputPath);
    if (
      canonicalTarget === inputPath ||
      (outputStat &&
        inputStat.dev === outputStat.dev &&
        inputStat.ino === outputStat.ino)
    )
      throw new Error('Output aliases an input');
  }
  const temporary = path.join(
    parent,
    `.${path.basename(target)}.${randomUUID()}.tmp`,
  );
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
      flag: 'wx',
    });
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}
