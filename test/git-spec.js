/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

/* global describe */
// /* global it */
// /* global xdescribe */
// /* global xit */

'use strict'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect

var git = require('../lib/git.js')

describe('git-library:', () => {
  describe('the "isRepo"-method', () => {
    it('should return false in a directory where .git does not exist', () => {
      expect(git('test').isRepo()).to.eventually.equal(false)
    })
    it('should return true in a directory where .git is a directory', () => {
      expect(git('.').isRepo()).to.eventually.equal(true)
    })
    it('should return false in a directory where .git is a file', () => {
      expect(git('test/fixtures/git-spec').isRepo()).to.eventually.equal(true)
    })
  })
})
