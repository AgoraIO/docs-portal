import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const sourceRoot = path.join(repoRoot, 'content', 'openapi');
const publicRoot = path.join(repoRoot, 'public', 'openapi');

const copied = [];

if (!fs.existsSync(sourceRoot)) {
  process.exit(0);
}

fs.rmSync(publicRoot, { force: true, recursive: true });
copyOpenApiAssets(sourceRoot, publicRoot);

for (const file of copied) {
  console.log(`copied ${file}`);
}

function copyOpenApiAssets(fromDir, toDir) {
  for (const entry of fs.readdirSync(fromDir, { withFileTypes: true })) {
    const fromPath = path.join(fromDir, entry.name);
    const toPath = path.join(toDir, entry.name);

    if (entry.isDirectory()) {
      copyOpenApiAssets(fromPath, toPath);
      continue;
    }

    if (!/\.(ya?ml|json)$/i.test(entry.name)) {
      continue;
    }

    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    fs.copyFileSync(fromPath, toPath);
    copied.push(path.relative(repoRoot, toPath));
  }
}
