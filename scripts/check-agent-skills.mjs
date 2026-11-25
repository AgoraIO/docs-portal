import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  globSync,
  lstatSync,
  readdirSync,
  readFileSync,
  realpathSync,
} from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';

process.chdir(path.resolve(import.meta.dirname, '..'));
const canonical = '.agents/skills';
const claude = '.claude/skills';
const firstParty = ['fumadocs-migration', 'fumadocs-migration-private-en'];
const lock = JSON.parse(readFileSync('skills-lock.json', 'utf8'));
const names = [...Object.keys(lock.skills), ...firstParty].sort();

assert.equal(lock.version, 2, 'Expected skills CLI lock format v2');
assert.deepEqual(
  readdirSync(canonical).sort(),
  names,
  'Skill directories differ from the lock and project skills',
);
assert.deepEqual(
  readdirSync(claude).sort(),
  names,
  'Claude skill entries differ from canonical skills',
);

// skills CLI v2 lock hashes cover sorted relative paths, byte lengths and contents.
function skillHash(dir) {
  const hash = createHash('sha256');
  const files = readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path
        .relative(dir, path.join(entry.parentPath, entry.name))
        .split(path.sep)
        .join('/'),
    )
    .sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  for (const file of files) {
    let content = readFileSync(path.join(dir, file));
    if (!content.includes(0) && content.includes('\r\n')) {
      content = Buffer.from(
        content.toString('latin1').replaceAll('\r\n', '\n'),
        'latin1',
      );
    }
    hash
      .update(file)
      .update('\0')
      .update(String(content.length))
      .update('\0')
      .update(content);
  }
  return hash.digest('hex');
}

for (const name of names) {
  const dir = path.join(canonical, name);
  const alias = path.join(claude, name);
  assert.ok(
    lstatSync(alias).isSymbolicLink(),
    `${alias} must link to the canonical skill`,
  );
  assert.equal(
    realpathSync(alias),
    realpathSync(dir),
    `Incorrect target for ${alias}`,
  );
  const entry = readFileSync(path.join(dir, 'SKILL.md'), 'utf8');
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(entry);
  assert.ok(frontmatter, `Missing frontmatter in ${dir}`);
  const { name: declared, description } = load(frontmatter[1], {
    filename: dir,
  });
  assert.equal(declared, name, `Invalid name in ${dir}`);
  assert.ok(
    typeof description === 'string' && description.trim(),
    `Missing description in ${dir}`,
  );
  for (const metadata of globSync(`${dir}/agents/openai.{yaml,yml}`)) {
    assert.ok(
      load(readFileSync(metadata, 'utf8'), { filename: metadata })?.interface
        ?.display_name,
      metadata,
    );
  }
  if (lock.skills[name]) {
    assert.equal(
      skillHash(dir),
      lock.skills[name].computedHash,
      `Skill differs from locked contents: ${name}`,
    );
  }
}

const guideFiles = [
  'AGENTS.md',
  ...globSync('docs/agents/*.md'),
  ...globSync('.agents/*.md'),
  ...globSync('.agents/skills/*/SKILL.md'),
];
for (const file of guideFiles) {
  const guide = readFileSync(file, 'utf8');
  for (const [, name] of guide.matchAll(
    /\.agents\/skills\/([a-z][a-z0-9-]*)/g,
  )) {
    assert.ok(names.includes(name), `${file} references missing skill ${name}`);
  }
}
const hostCommands = new Set(['clear', 'compact']);
const catalog = readFileSync(path.join(canonical, 'ask-matt/SKILL.md'), 'utf8');
for (const [, name] of catalog.matchAll(/`\/([a-z][a-z0-9-]*)`/g)) {
  assert.ok(
    hostCommands.has(name) || names.includes(name),
    `ask-matt references missing command /${name}`,
  );
}
console.log(
  `Verified ${Object.keys(lock.skills).length} locked skills, ${firstParty.length} project skills and ${names.length} Claude links.`,
);
