#!/usr/bin/env bash

set -euo pipefail

echo "Ensuring Firebase config files are in place..."

# For Android
if [ -f "google-services.json" ]; then
  echo "Copying google-services.json to android/app/"
  mkdir -p android/app
  cp google-services.json android/app/
else
  echo "Warning: google-services.json not found in project root"
fi

# For iOS
if [ -f "GoogleService-Info.plist" ]; then
  echo "Copying GoogleService-Info.plist to ios/mira/"
  mkdir -p ios/mira
  cp GoogleService-Info.plist ios/mira/
else
  echo "Warning: GoogleService-Info.plist not found in project root"
fi

# Fix iOS deployment target
if [ -f "ios/mira.xcodeproj/project.pbxproj" ]; then
  echo "Updating iOS deployment target to 16.0..."
  # Use perl for cross-platform compatibility (works on both Linux and macOS)
  perl -i -pe 's/IPHONEOS_DEPLOYMENT_TARGET = 15\.1;/IPHONEOS_DEPLOYMENT_TARGET = 16.0;/g' ios/mira.xcodeproj/project.pbxproj
  echo "iOS deployment target updated"
fi

echo "Build preparation completed successfully"
