import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const manifestPath = 'scripts/api-reference-shared-files.json';
const hash = (value) => createHash('sha256').update(value).digest('hex');
const read = (root, file) => {
  try {
    return readFileSync(path.join(root, file));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

/** Compare checked-out bytes, including uncommitted changes; never copy files. */
export function compareSharedReference(left, right) {
  left = realpathSync(left);
  right = realpathSync(right);
  if (left === right) throw new Error('Select two different checkouts.');
  const contract = JSON.parse(
    readFileSync(path.join(left, manifestPath), 'utf8'),
  );
  if (
    !Array.isArray(contract.files) ||
    !contract.files.includes(manifestPath) ||
    !Array.isArray(contract.packageScripts) ||
    new Set(contract.files).size !== contract.files.length ||
    contract.files.some(
      (file) =>
        typeof file !== 'string' ||
        path.isAbsolute(file) ||
        file.split('/').includes('..'),
    )
  )
    throw new Error(
      'Invalid shared-file manifest. Include the manifest itself and unique repository-relative files.',
    );

  const compare = (file, a, b) => ({
    file,
    left: a === null ? null : hash(a),
    right: b === null ? null : hash(b),
    equal: a !== null && b !== null && Buffer.from(a).equals(Buffer.from(b)),
  });
  const files = contract.files.map((file) =>
    compare(file, read(left, file), read(right, file)),
  );
  const scripts = (root) =>
    JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).scripts ??
    {};
  const a = scripts(left);
  const b = scripts(right);
  for (const name of contract.packageScripts) {
    files.push(
      compare(
        `package.json#scripts.${name}`,
        typeof a[name] === 'string' ? a[name] : null,
        typeof b[name] === 'string' ? b[name] : null,
      ),
    );
  }
  return {
    status: files.every((file) => file.equal) ? 'PASS' : 'FAIL',
    left,
    right,
    files,
  };
}

if (
  import.meta.url === pathToFileURL(path.resolve(process.argv[1] ?? '')).href
) {
  try {
    const { values } = parseArgs({
      options: { against: { type: 'string' }, help: { type: 'boolean' } },
    });
    if (values.help) {
      process.stdout.write(
        'bun run qa:api:shared --against /path/to/companion-checkout\nRead-only comparison of shared API reference files and QA commands.\n',
      );
    } else {
      if (!values.against)
        throw new Error('Provide --against /path/to/companion-checkout.');
      const report = compareSharedReference(process.cwd(), values.against);
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      if (report.status !== 'PASS') process.exitCode = 1;
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
