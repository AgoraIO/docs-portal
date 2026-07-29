import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const tempDirs: string[] = [];

export function git(cwd: string, ...args: string[]) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function runScript(
  script: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
) {
  return execFileSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function runScriptFailure(
  script: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
) {
  try {
    runScript(script, args, env);
  } catch (error) {
    const execError = error as Error & {
      stderr?: Buffer | string;
      stdout?: Buffer | string;
    };
    return `${execError.stdout ?? ''}${execError.stderr ?? ''}`;
  }

  throw new Error('Expected workflow script to fail.');
}

export async function makeTempDir() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'private-docs-workflow-'));
  tempDirs.push(dir);
  return dir;
}

export async function cleanupTempDirs() {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })),
  );
}

export async function writeFixture(
  root: string,
  relativePath: string,
  contents: string,
) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, 'utf8');
}

export function configureGit(repo: string) {
  git(repo, 'config', 'user.name', 'Docs Workflow Test');
  git(repo, 'config', 'user.email', 'docs-workflow@example.com');
}

export async function createPublicRepo(root: string) {
  const publicRepo = path.join(root, 'public');
  git(root, 'init', '--initial-branch=main', publicRepo);
  configureGit(publicRepo);
  await writeFixture(publicRepo, 'content/docs/guide.md', 'Published guide\n');
  await writeFixture(publicRepo, 'content/docs/remove.md', 'Remove me\n');
  await writeFixture(
    publicRepo,
    'src/app.ts',
    "export const app = 'public';\n",
  );
  git(publicRepo, 'add', '.');
  git(publicRepo, 'commit', '-m', 'initial public content');
  return publicRepo;
}
