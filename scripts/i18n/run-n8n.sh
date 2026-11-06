#!/usr/bin/env bash
# Runs automation/n8n/i18n-sync.workflow.json headless with a local n8n:
# extract -> (translate with Codex if anything is missing) -> check -> report.
#
#   npm run i18n:sync              skips n8n when nothing is missing (fast)
#   npm run i18n:sync -- --force   always runs the n8n workflow
#
# Needs n8n on PATH (pinned: npm i -g n8n@2.35.7) or N8N_BIN, and the Codex CLI
# logged in with a ChatGPT account. Exits non-zero when the final check fails.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORKFLOW="$ROOT/automation/n8n/i18n-sync.workflow.json"
N8N_PINNED="2.35.7" # newest n8n that runs on Node 22; 2.41+ needs Node 24
N8N_BIN="${N8N_BIN:-n8n}"
cd "$ROOT"

FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    *) echo "i18n sync: unknown option $arg" >&2; exit 2 ;;
  esac
done

# Fast path: nothing missing means nothing for n8n to do.
if [[ "$FORCE" == 0 ]] && notes="$(node scripts/i18n/extract.mjs --check --summary 2>&1 >/dev/null)"; then
  echo "${notes//i18n: /i18n sync: }"
  echo "i18n sync: nothing to translate, n8n not started (use --force to run the workflow anyway)."
  exit 0
fi

if ! command -v "$N8N_BIN" >/dev/null 2>&1; then
  echo "i18n sync: n8n is not installed. Install it with: npm i -g n8n@$N8N_PINNED" >&2
  echo "           (or set N8N_BIN to an n8n executable). Use npm run i18n:check for a check without n8n." >&2
  exit 2
fi

# A private n8n home, so this never touches a personal n8n instance.
export N8N_USER_FOLDER="${ROOMPAIR_N8N_HOME:-${XDG_CACHE_HOME:-$HOME/.cache}/roompair-n8n}"
mkdir -p "$N8N_USER_FOLDER"
export ROOMPAIR_DIR="$ROOT"                  # read by the workflow's commands
export NODES_EXCLUDE='[]'                     # n8n 2.x disables Execute Command by default
export N8N_LOG_LEVEL=info                     # `n8n execute` prints its result at info level
export N8N_DIAGNOSTICS_ENABLED=false
export N8N_VERSION_NOTIFICATIONS_ENABLED=false
export N8N_TEMPLATES_ENABLED=false
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
export N8N_RUNNERS_BROKER_PORT="${N8N_RUNNERS_BROKER_PORT:-5699}" # avoid a running n8n on 5679

LOG="$N8N_USER_FOLDER/last-run.log"
OUT="$N8N_USER_FOLDER/last-run.json"
: >"$LOG"

if command -v flock >/dev/null 2>&1; then
  exec 9>"$N8N_USER_FOLDER/.lock"
  flock -w 600 9 || { echo "i18n sync: another sync is still running." >&2; exit 1; }
fi

VERSION="$("$N8N_BIN" --version 2>>"$LOG" | tail -n 1)"
[[ "$VERSION" == "$N8N_PINNED" ]] || echo "i18n sync: note: using n8n $VERSION (tested with $N8N_PINNED)." >&2

WORKFLOW_ID="$(node -p 'require(process.argv[1]).id' "$WORKFLOW")"
HASH="$( (cat "$WORKFLOW"; echo "$VERSION") | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(require("crypto").createHash("sha256").update(s).digest("hex")))')"
if [[ "$(cat "$N8N_USER_FOLDER/.workflow-hash" 2>/dev/null)" != "$HASH" ]]; then
  echo "i18n sync: importing workflow $WORKFLOW_ID into n8n $VERSION…" >&2
  if ! "$N8N_BIN" import:workflow --input="$WORKFLOW" >>"$LOG" 2>&1; then
    echo "i18n sync: n8n import failed; log: $LOG" >&2
    tail -n 20 "$LOG" >&2
    exit 1
  fi
  echo "$HASH" >"$N8N_USER_FOLDER/.workflow-hash"
fi

echo "i18n sync: running n8n workflow $WORKFLOW_ID…" >&2
if ! "$N8N_BIN" execute --id="$WORKFLOW_ID" --rawOutput >"$OUT" 2>>"$LOG"; then
  echo "i18n sync: the n8n workflow failed; log: $LOG" >&2
  grep -v '^\s*$' "$OUT" | tail -n 30 >&2 || true
  exit 1
fi
node scripts/i18n/n8n-report.mjs "$OUT"

# The extractor decides the exit code, independent of how n8n reported.
node scripts/i18n/extract.mjs --check --summary >/dev/null
