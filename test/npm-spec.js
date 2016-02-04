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
var npm = require('../lib/npm.js')

describe('The npm-helper lib:', () => {
  describe('The version method', () => {
    const npmModule = npm('test/fixtures/npm-spec/default')
    it('should return the current version if the parameter is undefined', () => {
      return expect(npmModule.incVersion()).to.eventually.equal('0.0.1')
    })
    it('should return the specified version if the parameter is a valid version string', () => {
      return expect(npmModule.incVersion('1.5.2')).to.eventually.equal('1.5.2')
    })
    it('should return the incremented version if the parameter is "major"', () => {
      return expect(npmModule.incVersion('major')).to.eventually.equal('1.0.0')
    })
    it('should return the incremented version if the parameter is "minor"', () => {
      return expect(npmModule.incVersion('minor')).to.eventually.equal('0.1.0')
    })
    it('should return the incremented version if the parameter is "patch"', () => {
      return expect(npmModule.incVersion('patch')).to.eventually.equal('0.0.2')
    })
    it('should fail if the parameter is invalid (e.g. "bugfix)"', () => {
      return expect(npmModule.incVersion('bugfix')).to.be.rejectedWith(Error)
    })
  })

  describe('the repository url', () => {
    it('should point to example.com for the test-fixture', () => {
      return expect(npm('test/fixtures/npm-spec/default').repositoryUrl)
        .to.eventually.equal('https://example.com/')
    })
  })

  describe('the lockedBranches-method', () => {
    it('should return the branch "master" by default', () => {
      return expect(npm('test/fixtures/npm-spec/default').lockedBranches())
        .to.eventually.deep.equal(['master'])
    })
    it('should return the configured if any branches are configured', () => {
      return expect(npm('test/fixtures/npm-spec/lockedBranches').lockedBranches())
        .to.eventually.deep.equal(['muster', 'otherlocked'])
    })
  })
})
