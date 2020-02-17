'use strict';

const bundleTypes = require('./bundles').bundleTypes;
const moduleTypes = require('./bundles').moduleTypes;
const inlinedHostConfigs = require('../shared/inlinedHostConfigs');

const UMD_DEV = bundleTypes.UMD_DEV;
const UMD_PROD = bundleTypes.UMD_PROD;
const UMD_PROFILING = bundleTypes.UMD_PROFILING;
const NODE_DEV = bundleTypes.NODE_DEV;
const NODE_PROD = bundleTypes.NODE_PROD;
const NODE_PROFILING = bundleTypes.NODE_PROFILING;
const FB_WWW_DEV = bundleTypes.FB_WWW_DEV;
const FB_WWW_PROD = bundleTypes.FB_WWW_PROD;
const FB_WWW_PROFILING = bundleTypes.FB_WWW_PROFILING;
const RN_OSS_DEV = bundleTypes.RN_OSS_DEV;
const RN_OSS_PROD = bundleTypes.RN_OSS_PROD;
const RN_OSS_PROFILING = bundleTypes.RN_OSS_PROFILING;
const RN_FB_DEV = bundleTypes.RN_FB_DEV;
const RN_FB_PROD = bundleTypes.RN_FB_PROD;
const RN_FB_PROFILING = bundleTypes.RN_FB_PROFILING;
const RENDERER = moduleTypes.RENDERER;
const RECONCILER = moduleTypes.RECONCILER;

// If you need to replace a file with another file for a specific environment,
// add it to this list with the logic for choosing the right replacement.
const forks = Object.freeze({
  // Optimization: for UMDs, use object-assign polyfill that is already a part
  // of the React package instead of bundling it again.
  'object-assign': (bundleType, entry, dependencies) => {
    if (
      bundleType !== UMD_DEV &&
      bundleType !== UMD_PROD &&
      bundleType !== UMD_PROFILING
    ) {
      // It's only relevant for UMD bundles since that's where the duplication
      // happens. Other bundles just require('object-assign') anyway.
      return null;
    }
    if (dependencies.indexOf('react') === -1) {
      // We can only apply the optimizations to bundle that depend on React
      // because we read assign() from an object exposed on React internals.
      return null;
    }
    // We can use the fork!
    return 'shared/forks/object-assign.umd.js';
  },

  // Without this fork, importing `shared/ReactSharedInternals` inside
  // the `react` package itself would not work due to a cyclical dependency.
  'shared/ReactSharedInternals': (bundleType, entry, dependencies) => {
    if (entry === 'react') {
      return 'react/src/ReactSharedInternals';
    }
    if (dependencies.indexOf('react') === -1) {
      // React internals are unavailable if we can't reference the package.
      // We return an error because we only want to throw if this module gets used.
      return new Error(
        'Cannot use a module that depends on ReactSharedInternals ' +
          'from "' +
          entry +
          '" because it does not declare "react" in the package ' +
          'dependencies or peerDependencies. For example, this can happen if you use ' +
          'warning() instead of warningWithoutStack() in a package that does not ' +
          'depend on React.'
      );
    }
    return null;
  },

  // We have a few forks for different environments.
  'shared/ReactFeatureFlags': (bundleType, entry) => {
    switch (entry) {
      case 'react-dom/unstable-new-scheduler': {
        switch (bundleType) {
          case FB_WWW_DEV:
          case FB_WWW_PROD:
          case FB_WWW_PROFILING:
            return 'shared/forks/ReactFeatureFlags.www-new-scheduler.js';
          case NODE_DEV:
          case NODE_PROD:
          case NODE_PROFILING:
            return 'shared/forks/ReactFeatureFlags.new-scheduler.js';
          default:
            throw Error(
              `Unexpected entry (${entry}) and bundleType (${bundleType})`
            );
        }
      }
      case 'react-native-renderer':
        switch (bundleType) {
          case RN_FB_DEV:
          case RN_FB_PROD:
          case RN_FB_PROFILING:
            return 'shared/forks/ReactFeatureFlags.native-fb.js';
          case RN_OSS_DEV:
          case RN_OSS_PROD:
          case RN_OSS_PROFILING:
            return 'shared/forks/ReactFeatureFlags.native-oss.js';
          default:
            throw Error(
              `Unexpected entry (${entry}) and bundleType (${bundleType})`
            );
        }
      case 'react-native-renderer/fabric':
        switch (bundleType) {
          case RN_FB_DEV:
          case RN_FB_PROD:
          case RN_FB_PROFILING:
            return 'shared/forks/ReactFeatureFlags.native-fb.js';
          case RN_OSS_DEV:
          case RN_OSS_PROD:
          case RN_OSS_PROFILING:
            return 'shared/forks/ReactFeatureFlags.native-oss.js';
          default:
            throw Error(
              `Unexpected entry (${entry}) and bundleType (${bundleType})`
            );
        }
      case 'react-reconciler/persistent':
        return 'shared/forks/ReactFeatureFlags.persistent.js';
      case 'react-test-renderer':
        switch (bundleType) {
          case FB_WWW_DEV:
          case FB_WWW_PROD:
          case FB_WWW_PROFILING:
            return 'shared/forks/ReactFeatureFlags.test-renderer.www.js';
        }
        return 'shared/forks/ReactFeatureFlags.test-renderer.js';
      default:
        switch (bundleType) {
          case FB_WWW_DEV:
          case FB_WWW_PROD:
          case FB_WWW_PROFILING:
            return 'shared/forks/ReactFeatureFlags.www.js';
        }
    }
    return null;
  },

  scheduler: (bundleType, entry, dependencies) => {
    switch (bundleType) {
      case UMD_DEV:
      case UMD_PROD:
      case UMD_PROFILING:
        if (dependencies.indexOf('react') === -1) {
          // It's only safe to use this fork for modules that depend on React,
          // because they read the re-exported API from the SECRET_INTERNALS object.
          return null;
        }
        // Optimization: for UMDs, use the API that is already a part of the React
        // package instead of requiring it to be loaded via a separate <script> tag
        return 'shared/forks/Scheduler.umd.js';
      default:
        // For other bundles, use the shared NPM package.
        return null;
    }
  },

  'scheduler/tracing': (bundleType, entry, dependencies) => {
    switch (bundleType) {
      case UMD_DEV:
      case UMD_PROD:
      case UMD_PROFILING:
        if (dependencies.indexOf('react') === -1) {
          // It's only safe to use this fork for modules that depend on React,
          // because they read the re-exported API from the SECRET_INTERNALS object.
          return null;
        }
        // Optimization: for UMDs, use the API that is already a part of the React
        // package instead of requiring it to be loaded via a separate <script> tag
        return 'shared/forks/SchedulerTracing.umd.js';
      default:
        // For other bundles, use the shared NPM package.
        return null;
    }
  },

  'scheduler/src/SchedulerFeatureFlags': (bundleType, entry, dependencies) => {
    if (
      bundleType === FB_WWW_DEV ||
      bundleType === FB_WWW_PROD ||
      bundleType === FB_WWW_PROFILING
    ) {
      return 'scheduler/src/forks/SchedulerFeatureFlags.www.js';
    }
    return 'scheduler/src/SchedulerFeatureFlags';
  },

  'scheduler/src/SchedulerHostConfig': (bundleType, entry, dependencies) => {
    if (
      entry === 'scheduler/unstable_mock' ||
      entry === 'react-noop-renderer' ||
      entry === 'react-noop-renderer/persistent' ||
      entry === 'react-test-renderer'
    ) {
      return 'scheduler/src/forks/SchedulerHostConfig.mock';
    }
    return 'scheduler/src/forks/SchedulerHostConfig.default';
  },

  // This logic is forked on www to ignore some warnings.
  'shared/lowPriorityWarning': (bundleType, entry) => {
    switch (bundleType) {
      case FB_WWW_DEV:
      case FB_WWW_PROD:
      case FB_WWW_PROFILING:
        return 'shared/forks/lowPriorityWarning.www.js';
      default:
        return null;
    }
  },

  // This logic is forked on www to ignore some warnings.
  'shared/warningWithoutStack': (bundleType, entry) => {
    switch (bundleType) {
      case FB_WWW_DEV:
      case FB_WWW_PROD:
      case FB_WWW_PROFILING:
        return 'shared/forks/warningWithoutStack.www.js';
      default:
        return null;
    }
  },

  // In FB bundles, we preserve an inline require to ReactCurrentOwner.
  // See the explanation in FB version of ReactCurrentOwner in www:
  'react/src/ReactCurrentOwner': (bundleType, entry) => {
    switch (bundleType) {
      case FB_WWW_DEV:
      case FB_WWW_PROD:
      case FB_WWW_PROFILING:
        return 'react/src/forks/ReactCurrentOwner.www.js';
      default:
        return null;
    }
  },

  // Similarly, we preserve an inline require to ReactCurrentDispatcher.
  // See the explanation in FB version of ReactCurrentDispatcher in www:
  'react/src/ReactCurrentDispatcher': (bundleType, entry) => {
    switch (bundleType) {
      case FB_WWW_DEV:
      case FB_WWW_PROD:
      case FB_WWW_PROFILING:
        return 'react/src/forks/ReactCurrentDispatcher.www.js';
      default:
        return null;
    }
  },

  // Different wrapping/reporting for caught errors.
  'shared/invokeGuardedCallbackImpl': (bundleType, entry) => {
    switch (bundleType) {
      case FB_WWW_DEV:
      case FB_WWW_PROD:
      case FB_WWW_PROFILING:
        return 'shared/forks/invokeGuardedCallbackImpl.www.js';
      default:
        return null;
    }
  },

  // Different dialogs for caught errors.
  'react-reconciler/src/ReactFiberErrorDialog': (bundleType, entry) => {
    switch (bundleType) {
      case FB_WWW_DEV:
      case FB_WWW_PROD:
      case FB_WWW_PROFILING:
        // Use the www fork which shows an error dialog.
        return 'react-reconciler/src/forks/ReactFiberErrorDialog.www.js';
      case RN_OSS_DEV:
      case RN_OSS_PROD:
      case RN_OSS_PROFILING:
      case RN_FB_DEV:
      case RN_FB_PROD:
      case RN_FB_PROFILING:
        switch (entry) {
          case 'react-native-renderer':
          case 'react-native-renderer/fabric':
            // Use the RN fork which plays well with redbox.
            return 'react-reconciler/src/forks/ReactFiberErrorDialog.native.js';
          default:
            return null;
        }
      default:
        return null;
    }
  },

  'react-reconciler/src/ReactFiberHostConfig': (
    bundleType,
    entry,
    dependencies,
    moduleType
  ) => {
    if (dependencies.indexOf('react-reconciler') !== -1) {
      return null;
    }
    if (moduleType !== RENDERER && moduleType !== RECONCILER) {
      return null;
    }
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (let rendererInfo of inlinedHostConfigs) {
      if (rendererInfo.entryPoints.indexOf(entry) !== -1) {
        return `react-reconciler/src/forks/ReactFiberHostConfig.${
          rendererInfo.shortName
        }.js`;
      }
    }
    throw new Error(
      'Expected ReactFiberHostConfig to always be replaced with a shim, but ' +
        `found no mention of "${entry}" entry point in ./scripts/shared/inlinedHostConfigs.js. ` +
        'Did you mean to add it there to associate it with a specific renderer?'
    );
  },

  'react-stream/src/ReactFizzHostConfig': (
    bundleType,
    entry,
    dependencies,
    moduleType
  ) => {
    if (dependencies.indexOf('react-stream') !== -1) {
      return null;
    }
    if (moduleType !== RENDERER && moduleType !== RECONCILER) {
      return null;
    }
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (let rendererInfo of inlinedHostConfigs) {
      if (rendererInfo.entryPoints.indexOf(entry) !== -1) {
        if (!rendererInfo.isFizzSupported) {
          return null;
        }
        return `react-stream/src/forks/ReactFizzHostConfig.${
          rendererInfo.shortName
        }.js`;
      }
    }
    throw new Error(
      'Expected ReactFizzHostConfig to always be replaced with a shim, but ' +
        `found no mention of "${entry}" entry point in ./scripts/shared/inlinedHostConfigs.js. ` +
        'Did you mean to add it there to associate it with a specific renderer?'
    );
  },

  'react-stream/src/ReactFizzFormatConfig': (
    bundleType,
    entry,
    dependencies,
    moduleType
  ) => {
    if (dependencies.indexOf('react-stream') !== -1) {
      return null;
    }
    if (moduleType !== RENDERER && moduleType !== RECONCILER) {
      return null;
    }
    // eslint-disable-next-line no-for-of-loops/no-for-of-loops
    for (let rendererInfo of inlinedHostConfigs) {
      if (rendererInfo.entryPoints.indexOf(entry) !== -1) {
        if (!rendererInfo.isFizzSupported) {
          return null;
        }
        return `react-stream/src/forks/ReactFizzFormatConfig.${
          rendererInfo.shortName
        }.js`;
      }
    }
    throw new Error(
      'Expected ReactFizzFormatConfig to always be replaced with a shim, but ' +
        `found no mention of "${entry}" entry point in ./scripts/shared/inlinedHostConfigs.js. ` +
        'Did you mean to add it there to associate it with a specific renderer?'
    );
  },

  // We wrap top-level listeners into guards on www.
  'react-dom/src/events/EventListener': (bundleType, entry) => {
    switch (bundleType) {
      case FB_WWW_DEV:
      case FB_WWW_PROD:
      case FB_WWW_PROFILING:
        // Use the www fork which is integrated with TimeSlice profiling.
        return 'react-dom/src/events/forks/EventListener-www.js';
      default:
        return null;
    }
  },

  // React DOM uses different top level event names and supports mouse events.
  'events/ResponderTopLevelEventTypes': (bundleType, entry) => {
    if (entry === 'react-dom' || entry.startsWith('react-dom/')) {
      return 'events/forks/ResponderTopLevelEventTypes.dom.js';
    }
    return null;
  },
});

module.exports = forks;
