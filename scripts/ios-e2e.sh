#!/usr/bin/env bash
set -euo pipefail
export MAESTRO_DRIVER_STARTUP_TIMEOUT="${MAESTRO_DRIVER_STARTUP_TIMEOUT:-240000}"
runtime_id=$(xcrun simctl list runtimes --json | python3 -c 'import json,sys; rs=[r for r in json.load(sys.stdin)["runtimes"] if r.get("isAvailable") and r["identifier"].startswith("com.apple.CoreSimulator.SimRuntime.iOS-26") and r["version"].startswith("26.5")]; assert rs, "iOS 26.5 runtime unavailable"; print(sorted(rs,key=lambda r:tuple(map(int,r["version"].split("."))))[-1]["identifier"])')
device_type=com.apple.CoreSimulator.SimDeviceType.iPhone-16
if [ "$EXPO_PUBLIC_MAP_MODE" = fixture-error ]; then
  device_type=$(xcrun simctl list devicetypes --json | python3 -c 'import json,sys; ds=[d for d in json.load(sys.stdin)["devicetypes"] if d["name"]=="iPhone SE (3rd generation)"]; assert ds, "Compact simulator unavailable"; print(ds[0]["identifier"])')
fi
device_id=$(xcrun simctl create "UniMovil acceptance" "$device_type" "$runtime_id")
xcrun simctl boot "$device_id"
xcrun simctl bootstatus "$device_id" -b
trap 'xcrun simctl shutdown "$device_id" || true' EXIT
xcrun simctl install "$device_id" apps/mobile/ios/build/Build/Products/Release-iphonesimulator/UniMovil.app
mkdir -p test-results
for iteration in $(seq 1 "${E2E_REPETITIONS:-1}"); do
  maestro --device "$device_id" test -e MAP_MODE="$EXPO_PUBLIC_MAP_MODE" --format junit --output "test-results/ios-$iteration.xml" --test-output-dir "test-results/ios-$iteration" .maestro/campus.yaml
done
