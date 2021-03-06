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
var git = require('../lib/git.js')
var fs = require('fs-extra')
var path = require('path')

describe('git-library:', () => {
  afterEach(() => {
    delete git.mockCmd
  })
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
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').lastRelease()).to.eventually.deep.equal({
        tag: 'v0.8.3',
        newCommits: 0
      })
    })
    it('should parse a version with qualifier correctly', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3-beta.js')
      return expect(git('test').lastRelease()).to.eventually.deep.equal({
        tag: 'v0.8.3-beta',
        newCommits: 0
      })
    })

    it("should relay git's stderr as error thrown", () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-error.js')
      return expect(git('test').lastRelease()).to.be.rejected
    })

    it("should relay git's stderr as error thrown, even if the exit code is 0", () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-error-exit0.js')
      return expect(git('test').lastRelease()).to.be.rejected
    })

    it('should throw an error the found tag does not match the schema (this can actually never happen)', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-non-matching-tag.js')
      return expect(git('test').lastRelease()).to.be.rejected
    })

    it('should return a special object if no version tags exist', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-no-version-tag.js')
      return expect(git('test').lastRelease()).to.eventually.deep.equal({
        tag: null,
        newCommits: null
      })
    })

    it('should throw an error if the git process throws an error', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-error.js')
      return expect(git('test').lastRelease()).to.be.rejected
    })
  })

  describe('the "changes"-method', () => {
    it('should call "git log" with the correct parameters and return the plain output', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').changes('v0.8.3'))
        .to.eventually.equal('log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..\n')
    })

    it('should include the repository in the tformat if specified (converting github repository urls into weblinks)', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').changes('v0.8.3', {
        url: 'git+ssh://github.com/nknapp/bootprint.git'
      })).to.eventually.equal('log|--no-merges|--pretty=tformat:* [%h](https://github.com/nknapp/bootprint/commit/%h) %s - %an|v0.8.3..\n')
    })

    it('should include the target commit in the git-call if present', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').changes('v0.8.3', {
        to: 'v0.8.5'
      })).to.eventually.equal('log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..v0.8.5\n')
    })

    it('should treat output of git on stderr as error', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-error-exit0.js')
      return expect(git('test').changes('v0.8.3', {
        to: 'v0.8.5'
      })).to.be.rejected
    })

    it('should not add markdown links to non-github repos', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').changes('v0.8.3', {
        url: 'http://blog.knappi.org'
      }))
        .to.eventually.equal('log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..\n')
    })

    it('should add markdown links to github repos', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').changes('v0.8.3', {
        url: 'https://github.com/nknapp/bootprint'
      }))
        .to.eventually.equal('log|--no-merges|--pretty=tformat:* [%h](https://github.com/nknapp/bootprint/commit/%h) %s - %an|v0.8.3..\n')
    })
  })

  describe('the currentBranch-method', () => {
    it('should call "git symbolic-ref --short HEAD" to determine the branch', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-branch-feature.js')
      return expect(git('test').currentBranch()).to.eventually.equal('feature')
    })
  })

  describe('the squashRebaseTodo-method', () => {
    it('should replace all "pick" with "squash" in the file, except the first one', () => {
      var actual = fs.mkdirp('tmp/git-squash-rebase-todo')
        .then(() => fs.copy('test/fixtures/git-rebase-todo.txt', 'tmp/git-squash-rebase-todo/git-rebase-todo.txt'))
        .then(() => git('test').squashRebaseTodos('tmp/git-squash-rebase-todo/git-rebase-todo.txt'))
        .then(() => fs.readFile('tmp/git-squash-rebase-todo/git-rebase-todo.txt', 'utf-8'))
      var expected = fs.readFile('test/fixtures/git-rebase-todo-target.txt', 'utf-8')
      return Promise.all([actual, expected])
        .then(([actual, expected]) => expect(actual).to.equal(expected))
    })

    it('should replace a single "pick" with "reword" in the file', () => {
      var actual = fs.mkdirp('tmp/git-squash-rebase-todo')
        .then(() => fs.copy('test/fixtures/git-rebase-todo-single.txt', 'tmp/git-squash-rebase-todo/git-rebase-todo-single.txt'))
        .then(() => git('test').squashRebaseTodos('tmp/git-squash-rebase-todo/git-rebase-todo-single.txt'))
        .then(() => fs.readFile('tmp/git-squash-rebase-todo/git-rebase-todo-single.txt', 'utf-8'))
      var expected = fs.readFile('test/fixtures/git-rebase-todo-single-target.txt', 'utf-8')
      return Promise.all([actual, expected])
        .then(([actual, expected]) => expect(actual).to.equal(expected))
    })
  })

  describe('the cleanupHistory-method', () => {
    it('should rebase and squash the branch onto master by default', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').cleanupHistory({ thoughtful: 'thoughtful' }))
        .to.eventually.equal('Tagging thoughtful-backup\nRebase on master')
    })

    it('should rebase and squash the branch onto stable if specified as targetBranch', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-lastRelease-v0.8.3.js')
      return expect(git('test').cleanupHistory({ targetBranch: 'stable', thoughtful: 'thoughtful' }))
        .to.eventually.equal('Tagging thoughtful-backup\nRebase on stable')
    })
  })

  describe('ths add-method', () => {
    it('should add a single file in case of a string', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-add.js')
      return expect(git('test').add('test/file1.js'))
        .not.to.be.rejected
    })

    it('should add multiple files in case of a array', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-add.js')
      return expect(git('test').add(['test/file2.js', 'test/file3.js']))
        .not.to.be.rejected
    })

    it('should return a rejected promise for non-existing files', () => {
      git.mockCmd = path.resolve(__dirname, 'dummy-git', 'git-add.js')
      return expect(git('test').add('test/file4.js'))
        .to.be.rejected
    })
  })
})
