/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

const rule = require('../no-primitive-constructors');
const RuleTester = require('eslint').RuleTester;
const ruleTester = new RuleTester();

ruleTester.run('eslint-rules/no-primitive-constructors', rule, {
  valid: ['!!obj', "'' + obj", '+string'],
  invalid: [
    {
      code: 'Boolean(obj)',
      errors: [
        {
          message:
            'Do not use the Boolean constructor. To cast a value to a boolean, use double negation: !!value',
        },
      ],
    },
    {
      code: 'String(obj)',
      errors: [
        {
          message:
            'Do not use the String constructor. ' +
            'To cast a value to a string, concat it with the empty string ' +
            "(unless it's a symbol, which has different semantics): '' + value",
        },
      ],
    },
    {
      code: 'Number(string)',
      errors: [
        {
          message:
            'Do not use the Number constructor. To cast a value to a number, use the plus operator: +value',
        },
      ],
    },
  ],
});
