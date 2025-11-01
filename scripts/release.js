#!/usr/bin/env node

/**
 * Release App Script
 * Automates the release build process for iOS and Android
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, 'red');
  process.exit(1);
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Parse command line arguments
const args = process.argv.slice(2);
const platform = args[0] || 'all'; // 'ios', 'android', or 'all'
const profile = args[1] || 'production'; // Build profile
const updateVersion = args.includes('--bump-version');
const skipSubmit = args.includes('--skip-submit');

// Validate platform
if (!['ios', 'android', 'all'].includes(platform)) {
  error(`Invalid platform: ${platform}. Must be 'ios', 'android', or 'all'`);
}

// Read current version from app.json
function getCurrentVersion() {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  return {
    version: appJson.expo.version,
    iosBuildNumber: appJson.expo.ios?.buildNumber || '1',
    androidVersionCode: appJson.expo.android?.versionCode || 1,
  };
}

// Update version
function bumpVersion(type = 'patch') {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const [major, minor, patch] = appJson.expo.version.split('.').map(Number);
  let newVersion;
  
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  appJson.expo.version = newVersion;
  packageJson.version = newVersion;
  
  // Bump iOS build number
  if (appJson.expo.ios) {
    appJson.expo.ios.buildNumber = String(Number(appJson.expo.ios.buildNumber || '1') + 1);
  }
  
  // Bump Android version code
  if (appJson.expo.android) {
    appJson.expo.android.versionCode = (appJson.expo.android.versionCode || 1) + 1;
  }
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  success(`Version bumped to ${newVersion}`);
  return newVersion;
}

// Build app using EAS
function buildApp(platform, profile) {
  info(`Building ${platform} app with profile: ${profile}...`);
  
  try {
    const command = `eas build --platform ${platform} --profile ${profile} --non-interactive`;
    log(`\n${colors.cyan}Running: ${command}${colors.reset}\n`);
    execSync(command, { stdio: 'inherit' });
    success(`${platform} build completed successfully!`);
  } catch (err) {
    error(`Failed to build ${platform} app: ${err.message}`);
  }
}

// Submit app to stores
function submitApp(platform) {
  info(`Submitting ${platform} app to store...`);
  
  try {
    const command = `eas submit --platform ${platform} --profile ${profile} --non-interactive`;
    log(`\n${colors.cyan}Running: ${command}${colors.reset}\n`);
    execSync(command, { stdio: 'inherit' });
    success(`${platform} app submitted successfully!`);
  } catch (err) {
    error(`Failed to submit ${platform} app: ${err.message}`);
  }
}

// Main release flow
function release() {
  log('\n' + '='.repeat(50), 'bright');
  log('🚀 MIRA Release App', 'bright');
  log('='.repeat(50) + '\n', 'bright');
  
  const currentVersion = getCurrentVersion();
  info(`Current version: ${currentVersion.version}`);
  info(`iOS build number: ${currentVersion.iosBuildNumber}`);
  info(`Android version code: ${currentVersion.androidVersionCode}`);
  log('');
  
  // Bump version if requested
  let newVersion = currentVersion.version;
  if (updateVersion) {
    const versionType = args.find(arg => ['--major', '--minor', '--patch'].includes(arg))?.replace('--', '') || 'patch';
    newVersion = bumpVersion(versionType);
  }
  
  // Check if EAS CLI is installed
  try {
    execSync('eas --version', { stdio: 'pipe' });
  } catch (err) {
    error('EAS CLI is not installed. Please install it with: npm install -g eas-cli');
  }
  
  // Login check
  try {
    execSync('eas whoami', { stdio: 'pipe' });
  } catch (err) {
    warning('Not logged in to EAS. Attempting to login...');
    try {
      execSync('eas login', { stdio: 'inherit' });
    } catch (loginErr) {
      error('Failed to login to EAS. Please login manually: eas login');
    }
  }
  
  // Build apps
  if (platform === 'all') {
    buildApp('ios', profile);
    buildApp('android', profile);
  } else {
    buildApp(platform, profile);
  }
  
  // Submit to stores if not skipped
  if (!skipSubmit) {
    const shouldSubmit = args.includes('--submit');
    if (shouldSubmit) {
      log('\n' + '-'.repeat(50));
      info('Submitting apps to stores...');
      
      if (platform === 'all') {
        submitApp('ios');
        submitApp('android');
      } else {
        submitApp(platform);
      }
    }
  }
  
  log('\n' + '='.repeat(50));
  success(`Release process completed! Version: ${newVersion}`);
  log('='.repeat(50) + '\n');
}

// Handle errors
process.on('unhandledRejection', (err) => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
});

// Run release
release();

