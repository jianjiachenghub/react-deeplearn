'use strict';

module.exports = function shouldIgnoreConsoleError(format, args) {
  if (__DEV__) {
    if (typeof format === 'string') {
      if (format.indexOf('Error: Uncaught [') === 0) {
        // This looks like an uncaught error from invokeGuardedCallback() wrapper
        // in development that is reported by jsdom. Ignore because it's noisy.
        return true;
      }
      if (format.indexOf('The above error occurred') === 0) {
        // This looks like an error addendum from ReactFiberErrorLogger.
        // Ignore it too.
        return true;
      }
    }
  } else {
    if (
      format != null &&
      typeof format.message === 'string' &&
      typeof format.stack === 'string' &&
      args.length === 0
    ) {
      // In production, ReactFiberErrorLogger logs error objects directly.
      // They are noisy too so we'll try to ignore them.
      return true;
    }
  }
  // Looks legit
  return false;
};
