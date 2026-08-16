#!/usr/bin/env bash

set -eu

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
fi

pnpm install --frozen-lockfile
pnpm dev:up
