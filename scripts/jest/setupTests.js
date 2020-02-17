'use strict';

const chalk = require('chalk');
const util = require('util');
const shouldIgnoreConsoleError = require('./shouldIgnoreConsoleError');

if (process.env.REACT_CLASS_EQUIVALENCE_TEST) {
  // Inside the class equivalence tester, we have a custom environment, let's
  // require that instead.
  require('./spec-equivalence-reporter/setupTests.js');
} else {
  const env = jasmine.getEnv();
  const errorMap = require('../error-codes/codes.json');

  // TODO: Stop using spyOn in all the test since that seem deprecated.
  // This is a legacy upgrade path strategy from:
  // https://github.com/facebook/jest/blob/v20.0.4/packages/jest-matchers/src/spyMatchers.js#L160
  const isSpy = spy => spy.calls && typeof spy.calls.count === 'function';

  const spyOn = global.spyOn;
  const noop = function() {};

  // Spying on console methods in production builds can mask errors.
  // This is why we added an explicit spyOnDev() helper.
  // It's too easy to accidentally use the more familiar spyOn() helper though,
  // So we disable it entirely.
  // Spying on both dev and prod will require using both spyOnDev() and spyOnProd().
  global.spyOn = function() {
    throw new Error(
      'Do not use spyOn(). ' +
        'It can accidentally hide unexpected errors in production builds. ' +
        'Use spyOnDev(), spyOnProd(), or spyOnDevAndProd() instead.'
    );
  };

  if (process.env.NODE_ENV === 'production') {
    global.spyOnDev = noop;
    global.spyOnProd = spyOn;
    global.spyOnDevAndProd = spyOn;
  } else {
    global.spyOnDev = spyOn;
    global.spyOnProd = noop;
    global.spyOnDevAndProd = spyOn;
  }

  expect.extend({
    ...require('./matchers/interactionTracing'),
    ...require('./matchers/toWarnDev'),
    ...require('./matchers/reactTestMatchers'),
  });

  // We have a Babel transform that inserts guards against infinite loops.
  // If a loop runs for too many iterations, we throw an error and set this
  // global variable. The global lets us detect an infinite loop even if
  // the actual error object ends up being caught and ignored. An infinite
  // loop must always fail the test!
  env.beforeEach(() => {
    global.infiniteLoopError = null;
  });
  env.afterEach(() => {
    const error = global.infiniteLoopError;
    global.infiniteLoopError = null;
    if (error) {
      throw error;
    }
  });

  ['error', 'warn'].forEach(methodName => {
    const unexpectedConsoleCallStacks = [];
    const newMethod = function(format, ...args) {
      // Ignore uncaught errors reported by jsdom
      // and React addendums because they're too noisy.
      if (methodName === 'error' && shouldIgnoreConsoleError(format, args)) {
        return;
      }

      // Capture the call stack now so we can warn about it later.
      // The call stack has helpful information for the test author.
      // Don't throw yet though b'c it might be accidentally caught and suppressed.
      const stack = new Error().stack;
      unexpectedConsoleCallStacks.push([
        stack.substr(stack.indexOf('\n') + 1),
        util.format(format, ...args),
      ]);
    };

    console[methodName] = newMethod;

    env.beforeEach(() => {
      unexpectedConsoleCallStacks.length = 0;
    });

    env.afterEach(() => {
      if (console[methodName] !== newMethod && !isSpy(console[methodName])) {
        throw new Error(
          `Test did not tear down console.${methodName} mock properly.`
        );
      }

      if (unexpectedConsoleCallStacks.length > 0) {
        const messages = unexpectedConsoleCallStacks.map(
          ([stack, message]) =>
            `${chalk.red(message)}\n` +
            `${stack
              .split('\n')
              .map(line => chalk.gray(line))
              .join('\n')}`
        );

        const message =
          `Expected test not to call ${chalk.bold(
            `console.${methodName}()`
          )}.\n\n` +
          'If the warning is expected, test for it explicitly by:\n' +
          `1. Using the ${chalk.bold('.toWarnDev()')} / ${chalk.bold(
            '.toLowPriorityWarnDev()'
          )} matchers, or...\n` +
          `2. Mock it out using ${chalk.bold(
            'spyOnDev'
          )}(console, '${methodName}') or ${chalk.bold(
            'spyOnProd'
          )}(console, '${methodName}'), and test that the warning occurs.`;

        throw new Error(`${message}\n\n${messages.join('\n\n')}`);
      }
    });
  });

  if (process.env.NODE_ENV === 'production') {
    // In production, we strip error messages and turn them into codes.
    // This decodes them back so that the test assertions on them work.
    const decodeErrorMessage = function(message) {
      if (!message) {
        return message;
      }
      const re = /error-decoder.html\?invariant=(\d+)([^\s]*)/;
      const matches = message.match(re);
      if (!matches || matches.length !== 3) {
        return message;
      }
      const code = parseInt(matches[1], 10);
      const args = matches[2]
        .split('&')
        .filter(s => s.startsWith('args[]='))
        .map(s => s.substr('args[]='.length))
        .map(decodeURIComponent);
      const format = errorMap[code];
      let argIndex = 0;
      return format.replace(/%s/g, () => args[argIndex++]);
    };
    const OriginalError = global.Error;
    const ErrorProxy = new Proxy(OriginalError, {
      apply(target, thisArg, argumentsList) {
        const error = Reflect.apply(target, thisArg, argumentsList);
        error.message = decodeErrorMessage(error.message);
        return error;
      },
      construct(target, argumentsList, newTarget) {
        const error = Reflect.construct(target, argumentsList, newTarget);
        error.message = decodeErrorMessage(error.message);
        return error;
      },
    });
    ErrorProxy.OriginalError = OriginalError;
    global.Error = ErrorProxy;
  }

  require('jasmine-check').install();
}
