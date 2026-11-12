#!/usr/bin/env bash
# Kemas extension RIPITA Coretax Downloader menjadi ZIP untuk diunduh dari website.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$PWD/public/tools/ripita-coretax-downloader.zip"
rm -f "$OUT"
(cd extensions/ripita-coretax-downloader && zip -qr "$OUT" . -x ".DS_Store")
echo "Dibuat: $OUT"
