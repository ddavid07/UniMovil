#!/usr/bin/env bash
set -euo pipefail
sdkmanager 'system-images;android-36;google_apis;x86_64' > "$RUNNER_TEMP/unimovil-sdk.log"
printf 'no\n' | avdmanager create avd --name unimovil --package 'system-images;android-36;google_apis;x86_64' --device pixel_6
"$ANDROID_HOME/emulator/emulator" -avd unimovil -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect > "$RUNNER_TEMP/unimovil-emulator.log" 2>&1 &
emulator_pid=$!
trap 'kill "$emulator_pid" 2>/dev/null || true' EXIT
adb wait-for-device
for _attempt in {1..120}; do
  if [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = 1 ]; then break; fi
  sleep 2
done
test "$(adb shell getprop sys.boot_completed | tr -d '\r')" = 1
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
if [ "$EXPO_PUBLIC_MAP_MODE" = fixture-error ]; then
  adb shell wm size 720x1280
  adb shell wm density 320
fi
adb install apps/mobile/android/app/build/outputs/apk/release/app-release.apk
mkdir -p test-results
for iteration in $(seq 1 "${E2E_REPETITIONS:-1}"); do
  maestro test -e MAP_MODE="$EXPO_PUBLIC_MAP_MODE" --format junit --output "test-results/android-$iteration.xml" --test-output-dir "test-results/android-$iteration" .maestro/campus.yaml
done
