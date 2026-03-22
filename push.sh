#!/bin/bash
# One-command deploy: ./push.sh "your message"
# Vercel auto-deploys on every push to main — live in ~20 seconds
MSG="${1:-update}"
cd "$(dirname "$0")"
git add .
git commit -m "$MSG"
git push
echo "✓ Pushed. Live at https://coalition-ai.vercel.app in ~20 seconds"
