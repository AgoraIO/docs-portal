#!/usr/bin/env bash
# dev-diagnose.sh — run the dev server under memory instrumentation to diagnose
# the "script dev exited with code 143" (SIGTERM) deaths after a long session.
# Observational only: it does NOT change the dev server's memory behavior.
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/.dev-diag"
mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
MEM_LOG="$OUT_DIR/mem-$STAMP.tsv"
SIG_LOG="$OUT_DIR/signals-$STAMP.log"
PM_LOG="$OUT_DIR/postmortem-$STAMP.log"
INTERVAL="${DEV_DIAG_INTERVAL:-60}"

echo "dev-diagnose: sampling every ${INTERVAL}s -> $MEM_LOG"
echo "dev-diagnose: signal receipts -> $SIG_LOG"

# Inject the in-process signal trap into every node process in the dev tree,
# preserving any NODE_OPTIONS the user already has. This adds logging only.
export DEV_DIAG_SIGNAL_LOG="$SIG_LOG"
export NODE_OPTIONS="--require $ROOT_DIR/scripts/diag-signal-trap.cjs ${NODE_OPTIONS:-}"

# Start the dev server exactly as usual (parity with how the user runs it).
bun run dev &
DEV_PID=$!

# Recursively collect descendant PIDs of a given PID.
descendants() {
  local pid=$1 kids k
  kids=$(pgrep -P "$pid" 2>/dev/null)
  for k in $kids; do
    echo "$k"
    descendants "$k"
  done
}

# Sum RSS (KB) of DEV_PID + all descendants; print as MB.
# macOS `ps -p` wants a comma-separated PID list.
tree_rss_mb() {
  local pids
  pids="$DEV_PID $(descendants "$DEV_PID")"
  pids="$(echo "$pids" | tr ' \n' ',,' | sed -E 's/,+/,/g; s/^,|,$//g')"
  ps -o rss= -p "$pids" 2>/dev/null | awk '{s+=$1} END {printf "%.0f", s/1024}'
}

swap_used_mb() { sysctl -n vm.swapusage | sed -E 's/.*used = ([0-9.]+)M.*/\1/'; }
pages_free()   { vm_stat | awk '/Pages free/ {gsub(/\./,"",$3); print $3}'; }
swapouts()     { vm_stat | awk '/Swapouts/ {gsub(/\./,"",$2); print $2}'; }

printf 'time\ttree_rss_mb\tswap_used_mb\tpages_free\tswapouts\n' > "$MEM_LOG"

sampler() {
  while kill -0 "$DEV_PID" 2>/dev/null; do
    printf '%s\t%s\t%s\t%s\t%s\n' \
      "$(date +%H:%M:%S)" "$(tree_rss_mb)" "$(swap_used_mb)" "$(pages_free)" "$(swapouts)" \
      >> "$MEM_LOG"
    sleep "$INTERVAL"
  done
}
sampler &
SAMPLER_PID=$!

cleanup() { kill "$SAMPLER_PID" 2>/dev/null; }
trap cleanup EXIT

# Wait for the dev server to exit; capture its code + the exact death time.
wait "$DEV_PID"
CODE=$?
DIED_AT="$(date '+%Y-%m-%d %H:%M:%S')"
kill "$SAMPLER_PID" 2>/dev/null

{
  echo "dev server exited: code=$CODE at $DIED_AT"
  if [ "$CODE" -gt 128 ]; then
    echo "signal: SIG$(kill -l $((CODE - 128)) 2>/dev/null)  (128 + signal number)"
  else
    echo "signal: n/a (clean exit, not a signal)"
  fi
  echo
  echo "== final swap / vm_stat =="
  sysctl -n vm.swapusage
  vm_stat | grep -E "Pages free|Pageouts|Swapouts"
  echo
  echo "== peak tree RSS (MB) observed =="
  awk -F'\t' 'NR>1 && $2>m {m=$2} END {print m " MB"}' "$MEM_LOG"
  echo
  echo "== in-process signal receipts (the primary evidence) =="
  if [ -s "$SIG_LOG" ]; then
    cat "$SIG_LOG"
  else
    echo "(none — no catchable SIGTERM/SIGINT/SIGHUP was logged; the death was not a catchable signal)"
  fi
  echo
  echo "== OS log: node terminations / RunningBoard / memory kills (last 10m) =="
  log show --last 10m \
    --predicate 'eventMessage CONTAINS[c] "memorystatus" OR eventMessage CONTAINS[c] "jetsam" OR ((eventMessage CONTAINS[c] "node" OR eventMessage CONTAINS[c] "vite") AND (eventMessage CONTAINS[c] "terminat" OR eventMessage CONTAINS[c] "proc_exit" OR eventMessage CONTAINS[c] "kill"))' \
    --style compact 2>/dev/null | grep -iv "CONVERT_MEMLIMIT" | tail -60
} | tee "$PM_LOG"

echo
echo "dev-diagnose: memory trace -> $MEM_LOG"
echo "dev-diagnose: signal receipts -> $SIG_LOG"
echo "dev-diagnose: post-mortem -> $PM_LOG"
exit "$CODE"
