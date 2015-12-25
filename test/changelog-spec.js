/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

/* global describe */
/* global it */
// /* global xdescribe */
// /* global xit */

'use strict'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect
var changelog = require('../lib/changelog.js')

describe('changelog-library:', () => {
  describe('the constructor', () => {
    it('should create an empty changelog if none is present', () => {
      return expect(changelog('test').contents).to.eventually.equal('# Release-Notes\n\n<a name="current-release">\n')
    })
  })

  describe('the newRelease-method', () => {
    it('should add the data of a new release', () => {
      var cl = changelog('test').newRelease('0.0.1', new Date(2015, 11, 25, 0, 0, 0, 0), '* Change 1\n* Change 2')
      return expect(cl.contents).to.eventually.equal('# Release-Notes\n\n<a name="current-release">\n# Version 0.0.1 (2015-12-25)\n\n* Change 1\n* Change 2\n')
    })
  })
})
