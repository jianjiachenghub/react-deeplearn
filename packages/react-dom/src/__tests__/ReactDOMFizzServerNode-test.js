/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment node
 */

'use strict';

let Stream;
let React;
let ReactDOMFizzServer;

describe('ReactDOMFizzServer', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('react');
    ReactDOMFizzServer = require('react-dom/unstable-fizz');
    Stream = require('stream');
  });

  function getTestWritable() {
    let writable = new Stream.PassThrough();
    writable.setEncoding('utf8');
    writable.result = '';
    writable.on('data', chunk => (writable.result += chunk));
    return writable;
  }

  it('should call pipeToNodeWritable', () => {
    let writable = getTestWritable();
    ReactDOMFizzServer.pipeToNodeWritable(<div>hello world</div>, writable);
    jest.runAllTimers();
    expect(writable.result).toBe('<div>hello world</div>');
  });
});
