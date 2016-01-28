/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

/* global describe */
// /* global afterEach */
/* global it */
// /* global xdescribe */
// /* global xit */

'use strict'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect
var path = require('path')
var qcp = require('../lib/q-child-process')

describe('q-child-process-library:', () => {
  describe('the spawn-method', () => {
    it('should reject the promise if the child-process exits with exit-code!=0', () => {
      return expect(qcp.spawn(path.resolve(__dirname, path.resolve(__dirname, 'dummy-git', 'git-lastRelease-error.js'))))
        .to.be.rejected
    })
  })
})
