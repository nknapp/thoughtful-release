/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2019 Nils Knappmeier.
 * Released under the MIT license.
 */

/* eslint-env mocha */

'use strict'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect
var path = require('path')
var qcp = require('../lib/promised-child-process')

describe('q-child-process-library:', () => {
  describe('the spawn-method', () => {
    it('should reject the promise if the child-process exits with exit-code!=0', () => {
      return expect(qcp.spawn(['node', path.resolve(__dirname, path.resolve(__dirname, 'dummy-git', 'git-lastRelease-error.js'))]))
        .to.be.rejected
    })
  })

  describe('the spawnShell-method', () => {
    it('should reject the promise if the child-process exits with exit-code!=0', () => {
      const cmd = path.resolve(__dirname, 'dummy-git', 'git-add.js')
      return expect(qcp.spawnWithShell("node '" + cmd + "' add file4.js"))
        .to.be.rejected
    })

    it('should fulfill the promise if the child-process exits with exit-code===0', () => {
      const cmd = path.resolve(__dirname, 'dummy-git', 'git-add.js')
      return expect(qcp.spawnWithShell("node '" + cmd + "' add file1.js", { stdio: 'inherit' }))
        .not.to.be.rejected
    })
  })

  describe('The escapeParam-method', () => {
    it('should wrap the string in quotes, escaping \\ and " on any platform (since bash is always used as shell, even on windows)', () => {
      expect(qcp.escapeParam('abc"bcd"\\test')).to.equal('"abc\\"bcd\\"\\\\test"')
    })
  })
})
