'use strict';

module.exports = {
  env: {
    browser: true,
  },
  globals: {
    // ES6
    Map: true,
    Set: true,
    Symbol: true,
    Proxy: true,
    WeakMap: true,
    WeakSet: true,
    Uint16Array: true,
    // Vendor specific
    MSApp: true,
    __REACT_DEVTOOLS_GLOBAL_HOOK__: true,
    // UMD wrapper code
    // TODO: this is too permissive.
    // Ideally we should only allow these *inside* the UMD wrapper.
    exports: true,
    module: true,
    define: true,
    require: true,
    global: true,
  },
  parserOptions: {
    ecmaVersion: 5,
    sourceType: 'script',
  },
  rules: {
    'no-undef': 'error',
    'no-shadow-restricted-names': 'error',
  },
};
