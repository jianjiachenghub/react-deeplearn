'use strict';

const {readdirSync, statSync} = require('fs');
const {join} = require('path');
const baseConfig = require('./config.base');

// Find all folders in packages/* with package.json
const packagesRoot = join(__dirname, '..', '..', 'packages');
const packages = readdirSync(packagesRoot).filter(dir => {
  if (dir.charAt(0) === '.') {
    return false;
  }
  if (dir === 'events') {
    // There's an actual Node package called "events"
    // that's used by jsdom so we don't want to alias that.
    return false;
  }
  const packagePath = join(packagesRoot, dir, 'package.json');
  return statSync(packagePath).isFile();
});

// Create a module map to point React packages to the build output
const moduleNameMapper = {};

// Allow bundle tests to read (but not write!) default feature flags.
// This lets us determine whether we're running in Fire mode
// without making relevant tests internal-only.
moduleNameMapper[
  '^shared/ReactFeatureFlags'
] = `<rootDir>/packages/shared/forks/ReactFeatureFlags.readonly`;

// Map packages to bundles
packages.forEach(name => {
  // Root entry point
  moduleNameMapper[`^${name}$`] = `<rootDir>/build/node_modules/${name}`;
  // Named entry points
  moduleNameMapper[
    `^${name}\/([^\/]+)$`
  ] = `<rootDir>/build/node_modules/${name}/$1`;
});

module.exports = Object.assign({}, baseConfig, {
  // Redirect imports to the compiled bundles
  moduleNameMapper,
  // Don't run bundle tests on -test.internal.* files
  testPathIgnorePatterns: ['/node_modules/', '-test.internal.js$'],
  // Exclude the build output from transforms
  transformIgnorePatterns: ['/node_modules/', '<rootDir>/build/'],
  setupFiles: [
    ...baseConfig.setupFiles,
    require.resolve('./setupTests.build.js'),
  ],
});
