#!/usr/bin/env bash
# Source this helper before using the preinstalled Android command-line tools.
android_tool_bin="${ANDROID_HOME:?}/cmdline-tools/latest/bin"
if [ ! -x "$android_tool_bin/sdkmanager" ]; then
  android_tool_bin="$ANDROID_HOME/cmdline-tools/12.0/bin"
fi
if [ ! -x "$android_tool_bin/sdkmanager" ] || [ ! -x "$android_tool_bin/avdmanager" ]; then
  printf '%s\n' 'Android command-line tools are missing from the runner SDK.' >&2
  return 1
fi
export PATH="$android_tool_bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
