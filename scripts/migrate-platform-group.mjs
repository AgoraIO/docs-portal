import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOC_FILE_EXTENSION = /\.(md|mdx)$/;
const OPEN_TAG_PATTERN =
  /<PlatformStructured\s+platform=(["'])(?<platform>[^"']+)\1\s*>/y;
const CLOSE_TAG = '</PlatformStructured>';
const KNOWN_PLATFORMS = new Set([
  'android',
  'ios',
  'web',
  'javascript',
  'flutter',
  'react-native',
  'windows',
  'cpp',
  'macos',
  'electron',
  'unity',
  'unreal',
  'blueprint',
  'python',
  'linux-cpp',
  'linux-c',
  'linux-java',
]);
const PLATFORM_ALIASES = new Map([['react-js', 'javascript']]);

export function planPlatformGroupMigration(filePath, source, options = {}) {
  const { body, frontmatter } = splitFrontmatter(source);
  const parsedBlocks = parseTopLevelStructuredBlocks(body);

  if (parsedBlocks.status === 'skipped') {
    return {
      filePath,
      reason: parsedBlocks.reason,
      status: 'skipped',
    };
  }

  if (parsedBlocks.blocks.length < 2) {
    return {
      filePath,
      reason: 'expected at least two PlatformStructured blocks',
      status: 'skipped',
    };
  }

  const platforms = [];
  const panels = [];
  const seen = new Set();

  for (const block of parsedBlocks.blocks) {
    const platform = normalizePlatform(block.platform);

    if (!KNOWN_PLATFORMS.has(platform)) {
      return {
        filePath,
        reason: `unknown platform: ${block.platform}`,
        status: 'skipped',
      };
    }

    if (seen.has(platform)) {
      return {
        filePath,
        reason: `duplicate platform: ${platform}`,
        status: 'skipped',
      };
    }

    if (/<\/?PlatformStructured\b/.test(block.content)) {
      return {
        filePath,
        reason: `nested PlatformStructured content in ${platform}`,
        status: 'skipped',
      };
    }

    seen.add(platform);
    platforms.push(platform);
    panels.push({
      content: block.content.trim(),
      platform,
    });
  }

  const targetDir = filePath.replace(DOC_FILE_EXTENSION, '');
  if (options.skipExisting !== false && existsSync(targetDir)) {
    return {
      filePath,
      reason: `target directory already exists: ${targetDir}`,
      status: 'skipped',
    };
  }

  const targetFiles = [
    {
      content: buildIndexContent(frontmatter, platforms),
      path: join(targetDir, 'index.mdx'),
    },
    ...panels.map((panel) => ({
      content: `${panel.content}\n`,
      path: join(targetDir, `${panel.platform}.mdx`),
    })),
  ];

  return {
    filePath,
    platforms,
    status: 'ready',
    targetDir,
    targetFiles,
  };
}

export function applyPlatformGroupMigration(plan) {
  if (plan.status !== 'ready') {
    return;
  }

  for (const targetFile of plan.targetFiles) {
    mkdirSync(dirname(targetFile.path), { recursive: true });
    writeFileSync(targetFile.path, targetFile.content);
  }

  unlinkSync(plan.filePath);
}

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\s*/);

  if (!match) {
    return {
      body: source,
      frontmatter: '',
    };
  }

  return {
    body: source.slice(match[0].length),
    frontmatter: (match[1] ?? '').trim(),
  };
}

function parseTopLevelStructuredBlocks(body) {
  const blocks = [];
  let position = 0;

  while (position < body.length) {
    const whitespace = body.slice(position).match(/^\s*/)?.[0] ?? '';
    position += whitespace.length;

    if (position >= body.length) {
      break;
    }

    OPEN_TAG_PATTERN.lastIndex = position;
    const open = OPEN_TAG_PATTERN.exec(body);

    if (!open?.groups?.platform) {
      return {
        reason:
          'only files made of consecutive top-level PlatformStructured blocks are supported',
        status: 'skipped',
      };
    }

    const contentStart = OPEN_TAG_PATTERN.lastIndex;
    const closeStart = body.indexOf(CLOSE_TAG, contentStart);

    if (closeStart === -1) {
      return {
        reason: `missing closing PlatformStructured tag for ${open.groups.platform}`,
        status: 'skipped',
      };
    }

    blocks.push({
      content: body.slice(contentStart, closeStart),
      platform: open.groups.platform,
    });
    position = closeStart + CLOSE_TAG.length;
  }

  return {
    blocks,
    status: 'ready',
  };
}

function buildIndexContent(frontmatter, platforms) {
  const lines = removePlatformGroupFrontmatterKeys(frontmatter);

  return `---
${lines.join('\n')}${lines.length > 0 ? '\n' : ''}layout: platform-group
platforms:
${platforms.map((platform) => `  - ${platform}`).join('\n')}
defaultPlatform: ${platforms[0]}
---
`;
}

function removePlatformGroupFrontmatterKeys(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (/^\s*(layout|defaultPlatform):/.test(line)) {
      continue;
    }

    if (/^\s*platforms:\s*$/.test(line)) {
      while (index + 1 < lines.length && /^\s+-\s+/.test(lines[index + 1])) {
        index += 1;
      }
      continue;
    }

    if (/^\s*platforms:\s*\[/.test(line)) {
      continue;
    }

    output.push(line);
  }

  return output.filter((line, index, array) => {
    if (line.trim()) {
      return true;
    }

    return array[index - 1]?.trim() && array[index + 1]?.trim();
  });
}

function normalizePlatform(value) {
  const platform = String(value ?? '').trim();
  return PLATFORM_ALIASES.get(platform) ?? platform;
}

function collectDocFiles(root) {
  const files = [];

  for (const entry of readdirSync(root).sort()) {
    const entryPath = join(root, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      files.push(...collectDocFiles(entryPath));
      continue;
    }

    if (stats.isFile() && DOC_FILE_EXTENSION.test(entry)) {
      files.push(entryPath);
    }
  }

  return files;
}

function parseArgs(argv) {
  const args = {
    root: 'content/docs',
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dry-run') {
      args.write = false;
      continue;
    }

    if (arg === '--write') {
      args.write = true;
      continue;
    }

    if (arg === '--root') {
      args.root = argv[index + 1] ?? args.root;
      index += 1;
      continue;
    }

    if (!arg.startsWith('-')) {
      args.root = arg;
    }
  }

  return args;
}

function runCli() {
  const args = parseArgs(process.argv.slice(2));

  if (!existsSync(args.root)) {
    throw new Error(`Docs root does not exist: ${args.root}`);
  }

  const stats = statSync(args.root);
  const files = stats.isDirectory() ? collectDocFiles(args.root) : [args.root];
  const plans = files.map((filePath) =>
    planPlatformGroupMigration(filePath, readFileSync(filePath, 'utf8')),
  );
  const ready = plans.filter((plan) => plan.status === 'ready');
  const skipped = plans.filter((plan) => plan.status === 'skipped');

  for (const plan of ready) {
    const relativeTargets = plan.targetFiles
      .map((file) => relative(process.cwd(), file.path))
      .join(', ');
    console.log(
      `${args.write ? 'migrate' : 'would migrate'} ${relative(
        process.cwd(),
        plan.filePath,
      )} -> ${relativeTargets}${args.write ? ' (removed source file)' : ''}`,
    );

    if (args.write) {
      applyPlatformGroupMigration(plan);
    }
  }

  for (const plan of skipped.slice(0, 20)) {
    console.log(
      `skip ${relative(process.cwd(), plan.filePath)}: ${plan.reason}`,
    );
  }

  console.log(
    `[platform-group] ready=${ready.length} skipped=${skipped.length} mode=${
      args.write ? 'write' : 'dry-run'
    }`,
  );
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFilePath) {
  runCli();
}
