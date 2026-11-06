#!/usr/bin/env bash
set -euo pipefail
destination="${RUNNER_TEMP:?}/unimovil-maestro"
mkdir -p "$destination"
curl --fail --location --retry 3 --output "$destination/maestro.zip" https://github.com/mobile-dev-inc/Maestro/releases/download/cli-2.11.0/maestro.zip
cd "$destination"
printf '%s\n' '5384593cb4e7a106489e75a821d157dd43f4e438df6bc308b72e82c685e1283a  maestro.zip' | shasum -a 256 --check
unzip -q maestro.zip
printf '%s\n' "$destination/maestro/bin" >> "${GITHUB_PATH:?}"
