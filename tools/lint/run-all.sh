#!/bin/sh
# Runs every custom lint beside this script. The set is derived by globbing, never a hand-kept
# list: a lint added next to these must not need a second edit somewhere else to be enforced,
# because one that is never invoked reads as coverage while protecting nothing.
# Each lint prints its own findings and exits non-zero; this reports every failing one rather
# than stopping at the first, so a single run shows the whole picture.
set -u
dir=$(cd "$(dirname "$0")" && pwd)
failed=0
for lint in "$dir"/*.ts "$dir"/spec-of-code/*.ts; do
	[ -f "$lint" ] || continue
	if ! bun "$lint"; then
		echo "custom lint failed: ${lint#"$dir"/}" >&2
		failed=$((failed + 1))
	fi
done
if [ "$failed" -gt 0 ]; then
	echo "$failed custom lint(s) failed" >&2
	exit 1
fi
echo ok
