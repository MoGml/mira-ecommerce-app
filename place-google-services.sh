#!/usr/bin/env bash

set -euo pipefail

echo "Placing google-services.json before Gradle build..."

# Decode from EAS secret
if [ -n "${GOOGLE_SERVICES_JSON:-}" ]; then
  echo "Decoding google-services.json from EAS secret..."
  echo "$GOOGLE_SERVICES_JSON" | base64 -d > google-services.json

  # Place in android/app directory
  if [ -d "android/app" ]; then
    cp google-services.json android/app/
    echo "Placed google-services.json in android/app/"
    ls -la android/app/google-services.json
  else
    echo "ERROR: android/app directory not found"
    exit 1
  fi
else
  echo "ERROR: GOOGLE_SERVICES_JSON environment variable not set"
  exit 1
fi

# Now run the actual Gradle command
echo "Running Gradle command: $@"
exec "$@"
