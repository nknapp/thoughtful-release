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

  describe('the spawn-shell', () => {
    it('should reject the promise if the child-process exits with exit-code!=0', () => {
      const cmd = path.resolve(__dirname, 'dummy-git', 'git-add.js')
      return expect(qcp.spawnWithShell(cmd + ' add file4.js'))
        .to.be.rejected
    })
  })

  describe('the spawn-shell', () => {
    it('should fulfull the promise if the child-process exits with exit-code===0', () => {
      const cmd = path.resolve(__dirname, 'dummy-git', 'git-add.js')
      return expect(qcp.spawnWithShell(cmd + ' add file1.js'))
        .not.to.be.rejected
    })
  })

  describe('The escapeParam-method', () => {
    var os = require('os')
    switch (os.type()) {
      case 'Linux':
      case 'Dawin':
        it('should escape \\ and " on Linux', () => {
          expect()
        })
        break
      case 'Windows_NT':
        it('should have test-cases for Windows (but does not yet)', () => {
          throw new Error('should have test-cases for Windows (but does not yet)')
        })
        break
      default:
        throw new Error(`Unexpected OS-type ${os.type()}`)
    }
  })
})
