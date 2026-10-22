#!/bin/sh
# Re-film the demo from the app. Usage: capture/run.sh /path/to/Table-Topics
# Copies the capture into the app's browser tests for one run, then removes it (it is never committed there).
set -e
APP=${1:-/home/user/Table-Topics}
HERE=$(cd "$(dirname "$0")/.." && pwd)
cp "$HERE/capture/demo.capture.ts" "$APP/tests/e2e/zz-demo-capture.spec.ts"
trap 'rm -f "$APP/tests/e2e/zz-demo-capture.spec.ts"' EXIT
cd "$APP"
DEMO_OUT="$HERE/public/demo" E2E_PORT=${E2E_PORT:-3155} pnpm -s exec playwright test zz-demo-capture --workers=1 --reporter=line
