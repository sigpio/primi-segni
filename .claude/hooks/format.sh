#!/usr/bin/env bash
# PostToolUse (Edit|Write): formatta il file appena modificato con prettier.
# Best-effort: non fallisce mai e non blocca il tool (exit 0 sempre).

input=$(cat)
file=$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.tool_input&&j.tool_input.file_path)||"")}catch(e){}})' 2>/dev/null)

[ -z "$file" ] && exit 0

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md) ;;
  *) exit 0 ;;
esac

root="$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd)"
[ -z "$root" ] && exit 0

if [ -x "$root/node_modules/.bin/prettier" ]; then
  "$root/node_modules/.bin/prettier" --write "$file" >/dev/null 2>&1 || true
fi

exit 0
