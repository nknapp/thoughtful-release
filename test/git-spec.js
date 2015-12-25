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
var fs = require('fs')
var path = require('path')
var git = require('../lib/git.js')

describe('git-library:', () => {
  describe('the "isRepo"-method', () => {
    it('should return false in a directory where .git does not exist', () => {
      return expect(git('test').isRepo()).to.eventually.equal(false)
    })
    it('should return true in a directory where .git is a directory', () => {
      return expect(git('.').isRepo()).to.eventually.equal(true)
    })
  })

  describe('the "lastRelease"-method', () => {
    it('should parse a simple version correctly', () => {
      process.env['THOUGHTFUL_GIT_CMD'] = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').lastRelease()).to.eventually.deep.equal({
        tag: 'v0.8.3',
        newCommits: 0
      })
    })
    it('should parse a version with qualifier correctly', () => {
      process.env['THOUGHTFUL_GIT_CMD'] = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3-beta.js')
      return expect(git('test').lastRelease()).to.eventually.deep.equal({
        tag: 'v0.8.3-beta',
        newCommits: 0
      })
    })
  })
  describe('the "changelog"-method', () => {
    it('should call "git log" with the correct parameters and return the plain output', () => {
      process.env['THOUGHTFUL_GIT_CMD'] = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').changelog('v0.8.3'))
        .to.eventually.equal('log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..\n')

    })
    it('should include the repository in the tformat if specified (converting github repository urls into weblinks)', () => {
      process.env['THOUGHTFUL_GIT_CMD'] = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').changelog('v0.8.3', {
        url: 'git+ssh://github.com/nknapp/bootprint.git'
      }))
        .to.eventually.equal('log|--no-merges|--pretty=tformat:* [%h](https://github.com/nknapp/bootprint/commit/%h) %s - %an|v0.8.3..\n')

    })

    it('should include the target commit in the git-call if present', () => {
      process.env['THOUGHTFUL_GIT_CMD'] = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').changelog('v0.8.3', {
        to: 'v0.8.5'
      }))
        .to.eventually.equal('log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..v0.8.5\n')

    })

  })
})
