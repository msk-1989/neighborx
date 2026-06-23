#!/usr/bin/env bash
# Vercel prebuild — swaps the Prisma provider from "sqlite" (committed, for
# local dev) to "postgresql" when building on Vercel (or any environment
# where DATABASE_PROVIDER=postgresql).
#
# Why: Prisma does not allow `provider = env(...)`, so the provider must be a
# literal in schema.prisma. We commit "sqlite" so local dev + the existing
# local SQLite DB keep working, and rewrite it to "postgresql" here for the
# Vercel build (which targets Neon Postgres).
#
# This script is idempotent and safe to run locally (it's a no-op when
# DATABASE_PROVIDER is unset or "sqlite").
set -euo pipefail

SCHEMA="prisma/schema.prisma"
PROVIDER="${DATABASE_PROVIDER:-sqlite}"

echo "[vercel-prebuild] DATABASE_PROVIDER=$PROVIDER"

if [ "$PROVIDER" = "postgresql" ]; then
  if ! grep -q 'provider  = "sqlite"' "$SCHEMA"; then
    echo "[vercel-prebuild] Schema provider is already not sqlite — skipping rewrite."
    exit 0
  fi
  echo "[vercel-prebuild] Rewriting provider: \"sqlite\" -> \"postgresql\" in $SCHEMA"
  # Portable in-place sed (works on both GNU and BSD sed).
  sed -i.bak 's/provider  = "sqlite"/provider  = "postgresql"/' "$SCHEMA"
  rm -f "$SCHEMA.bak"
  echo "[vercel-prebuild] Done. Provider is now postgresql."
else
  echo "[vercel-prebuild] Keeping committed sqlite provider (local dev)."
fi

# Always (re)generate the Prisma client against the (possibly rewritten) schema.
echo "[vercel-prebuild] Running prisma generate..."
bunx prisma generate
