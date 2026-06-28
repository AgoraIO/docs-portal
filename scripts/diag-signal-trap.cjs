// scripts/diag-signal-trap.cjs
// Preloaded into every node process in the dev tree via NODE_OPTIONS=--require.
// Logs the exact moment a catchable termination signal arrives (pid + RSS), then
// re-exits so the process still dies as it normally would. Observational only.
const fs = require('node:fs');
const path = require('node:path');

const logPath =
  process.env.DEV_DIAG_SIGNAL_LOG ||
  path.join(process.cwd(), '.dev-diag', 'signals.log');

// logPath/cwd are resolved at preload time (cwd may change later, so capturing
// it now is correct). Best-effort ensure the directory exists; a failure here
// must never throw — this preload runs inside the dev server itself.
try {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
} catch {
  // directory may be unwritable; the signal handler's own catch will cope
}

const SIGNUM = { SIGHUP: 1, SIGINT: 2, SIGTERM: 15 };

for (const sig of Object.keys(SIGNUM)) {
  process.on(sig, () => {
    const rssMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
    // columns: ISO-timestamp \t signal \t pid=… \t ppid=… \t rss=…MB \t argv=…
    const line =
      [
        new Date().toISOString(),
        sig,
        `pid=${process.pid}`,
        `ppid=${process.ppid}`,
        `rss=${rssMb}MB`,
        `argv=${process.argv.slice(1).join(' ').slice(0, 120)}`,
      ].join('\t') + '\n';
    try {
      fs.appendFileSync(logPath, line);
    } catch {
      // never let the trap interfere with shutdown
    }
    process.exit(128 + SIGNUM[sig]);
  });
}
