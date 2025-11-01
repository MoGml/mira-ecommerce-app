# Release App Guide

This guide explains how to build and release the MIRA ecommerce app for iOS and Android using the automated release system.

## Overview

The release app system automates the process of:
- Version management (automatic version bumping)
- Building production-ready apps
- Submitting apps to App Store and Google Play Store

## Prerequisites

1. **EAS CLI**: Make sure you have EAS CLI installed and logged in
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **EAS Project**: Ensure your project is configured with EAS
   ```bash
   eas build:configure
   ```

3. **App Store/Play Store Credentials**: Configure your store credentials
   ```bash
   eas credentials
   ```

## Quick Start

### Build Release Apps

Build apps for both platforms:
```bash
npm run release:all
```

Build for a specific platform:
```bash
npm run release:ios
npm run release:android
```

### Build with Version Bump

Automatically bump version and build:
```bash
npm run release:bump
```

To specify version bump type:
```bash
npm run release all --bump-version --patch   # 1.0.0 → 1.0.1
npm run release all --bump-version --minor   # 1.0.0 → 1.1.0
npm run release all --bump-version --major   # 1.0.0 → 2.0.0
```

### Build and Submit to Stores

Build and automatically submit to stores:
```bash
npm run release:submit
```

## Available Scripts

### Release Scripts

| Command | Description |
|---------|-------------|
| `npm run release` | Default release (all platforms, production profile) |
| `npm run release:ios` | Build iOS app only |
| `npm run release:android` | Build Android app only |
| `npm run release:all` | Build both iOS and Android |
| `npm run release:bump` | Build with automatic version bump |
| `npm run release:submit` | Build and submit to stores |

### Direct Build Scripts

| Command | Description |
|---------|-------------|
| `npm run build:ios` | Build iOS using EAS directly |
| `npm run build:android` | Build Android using EAS directly |
| `npm run build:all` | Build both platforms using EAS |

### Submit Scripts

| Command | Description |
|---------|-------------|
| `npm run submit:ios` | Submit iOS app to App Store |
| `npm run submit:android` | Submit Android app to Play Store |

## Manual Release Process

### Step 1: Update Version (Optional)

You can manually update the version in `app.json`:
- `version`: Semantic version (e.g., "1.0.0")
- `ios.buildNumber`: Increment for each iOS build
- `android.versionCode`: Increment for each Android build

### Step 2: Build the App

```bash
# Using the release script
npm run release:all

# Or using EAS directly
eas build --platform all --profile production
```

### Step 3: Submit to Stores

```bash
# Using the release script
npm run release:submit

# Or using EAS directly
eas submit --platform all --profile production
```

## Release Script Options

The release script (`scripts/release.js`) supports various options:

```bash
node scripts/release.js [platform] [profile] [options]
```

### Parameters

- **platform**: `ios`, `android`, or `all` (default: `all`)
- **profile**: Build profile from `eas.json` (default: `production`)

### Options

- `--bump-version`: Automatically bump version before building
- `--major`: Bump major version (1.0.0 → 2.0.0)
- `--minor`: Bump minor version (1.0.0 → 1.1.0)
- `--patch`: Bump patch version (1.0.0 → 1.0.1) (default)
- `--submit`: Submit to stores after building
- `--skip-submit`: Skip store submission

### Examples

```bash
# Build iOS with patch version bump
node scripts/release.js ios production --bump-version --patch

# Build all platforms with minor version bump and submit
node scripts/release.js all production --bump-version --minor --submit

# Build Android only without submitting
node scripts/release.js android production --skip-submit
```

## Build Profiles

The app supports multiple build profiles defined in `eas.json`:

### Production
- **Distribution**: Store (App Store / Play Store)
- **Purpose**: Official releases
- **Features**: 
  - Production environment
  - Optimized builds
  - Auto-increment build numbers

### Preview
- **Distribution**: Internal
- **Purpose**: Testing before release
- **Features**: 
  - Production-like builds
  - Can be distributed via TestFlight or internal testing

### Development
- **Distribution**: Internal
- **Purpose**: Development and debugging
- **Features**: 
  - Development client
  - Debug builds

## Version Management

The release script automatically manages versions:

- **iOS**: 
  - `version` in `app.json` (semantic version)
  - `ios.buildNumber` (incremented automatically with `--bump-version`)

- **Android**:
  - `version` in `app.json` (semantic version)
  - `android.versionCode` (incremented automatically with `--bump-version`)

When using `--bump-version`, the script:
1. Increments the semantic version
2. Increments iOS build number
3. Increments Android version code
4. Updates both `app.json` and `package.json`

## Troubleshooting

### EAS CLI Not Found
```bash
npm install -g eas-cli
```

### Not Logged In
```bash
eas login
```

### Build Fails
- Check `eas.json` configuration
- Verify credentials: `eas credentials`
- Check build logs in EAS dashboard
- Ensure all environment variables are set

### Submission Fails
- Verify store credentials
- Check app store connect / Play Console settings
- Ensure app metadata is complete
- Verify app compliance with store guidelines

## Best Practices

1. **Version Bumping**: Always use `--bump-version` for production releases
2. **Testing**: Build preview builds before production releases
3. **Credentials**: Keep credentials secure and never commit them
4. **Build Profiles**: Use appropriate build profiles for each purpose
5. **Release Notes**: Prepare release notes before submitting to stores

## CI/CD Integration

You can integrate the release script into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Release App
  run: |
    npm install
    npm run release:all --bump-version --patch
```

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Guide](https://developer.apple.com/app-store-connect/)
- [Google Play Console Guide](https://support.google.com/googleplay/android-developer)

## Support

For issues or questions:
1. Check EAS build logs
2. Review Expo documentation
3. Check project configuration files (`eas.json`, `app.json`)

