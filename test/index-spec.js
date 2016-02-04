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
/* global beforeEach */
/* global afterEach */

'use strict'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect
var qcp = require('../lib/q-child-process')
var qfs = require('q-io/fs')
var path = require('path')
var Q = require('q')
var _ = {
  escapeRegExp: require('lodash.escaperegexp'),
  toArray: require('lodash.toarray')
}

delete process.env['THOUGHTFUL_GIT_CMDcd']

var Thoughtful = require('../')

function fixture (filename) {
  return require('fs').readFileSync(path.join('test', 'fixtures', filename), {encoding: 'utf-8'})
}

/**
 * Load a fixture from a file. Create a regex with the contents using regex-escapings.
 * Replace all occurrences of '#_#_#_#_#' (exactly this string) by `.*` after the escaping has taken place.

 */
function regexFixture (filename) {
  var contents = fixture(filename)
  var escaped = _.escapeRegExp(contents).replace(/#_#_#_#_#/g, '.*?')
  return new RegExp('^' + escaped + '$')
}

// Exception handler that ignores ENOENT and re-throws everything else
const ignoreENOENT = (err) => {
  if (err.code !== 'ENOENT') {
    throw err
  }
}

describe('main-module:', () => {
  /**
   * Return the path to a file within the working dir
   *
   */
  function workDir () {
    return path.join.apply(path, ['tmp', 'test', 'index-js'].concat(_.toArray(arguments)))
  }

  /**
   *
   * @type {Thoughtful}
   */
  var thoughtful = new Thoughtful(workDir())

  function git () {
    return qcp.execFile('git', _.toArray(arguments), {cwd: workDir()})
  }

  function gitCommit (file, contents, message) {
    return qfs.write(workDir(file), contents)
      .then(() => qcp.execFile('ls', ['-l'], { cwd: workDir() }))
      .then(() => git('add', file))
      .then(() => git('commit', '-a', '-m', message))
  }

  // Clear the working directory before each test
  beforeEach(() => {
    return qfs.removeTree(workDir())
      .catch(ignoreENOENT)
      .then(() => qfs.makeTree(workDir()))
      // Create git repo
      .then(() => qcp.execFile('git', ['init'], {cwd: workDir()}))
      .then(() => git('config', 'user.email', 'test@example.com'))
      .then(() => git('config', 'user.name', 'Test User'))
      // add and commit package.json
      .then(() => {
        return qfs.write(workDir('package.json'), JSON.stringify({
          name: 'test-package',
          version: '0.0.1',
          repository: {
            url: 'git@github.com:nknapp/example.git'
          }
        }))
      })
      .then(() => qcp.execFile('git', ['add', 'package.json'], {cwd: workDir()}))
      .then(() => qcp.execFile('git', ['commit', '-m', 'Added package.json'], {cwd: workDir()}))
      .then(() => thoughtful.reset())
  })

  describe('the updateChangelog-method', () => {
    it('should create an initial CHANGELOG.md file for a first release', () => {
      var changelogContents = thoughtful.updateChangelog({release: 'minor'})
        .then(() => qfs.read(workDir('CHANGELOG.md')))
      return expect(changelogContents).to.eventually.match(regexFixture('index-spec/CHANGELOG-first.md'))
    })

    it('should create an initial CHANGELOG.md file for a current release', () => {
      var changelogContents = thoughtful.updateChangelog()
        .then(() => qfs.read(workDir('CHANGELOG.md')))
      return expect(changelogContents).to.eventually.match(regexFixture('index-spec/CHANGELOG-current.md'))
    })

    it('should update CHANGELOG.md file for a second release', () => {
      // Update changelog and bump version
      var changelogContents = thoughtful.updateChangelog({release: 'minor'})
        .then(() => qcp.execFile('npm', ['version', 'minor'], {cwd: workDir()}))
        // Add another file
        .then(() => qfs.write(workDir('index.js'), "'use strict'"))
        .then(() => qcp.execFile('git', ['add', 'index.js'], {cwd: workDir()}))
        .then(() => qcp.execFile('git', ['commit', '-m', 'Added index.js'], {cwd: workDir()}))
        // Update changelog again and load contents
        .then(() => thoughtful.updateChangelog({release: 'patch'}))
        .then(() => qfs.read(workDir('CHANGELOG.md')))

      return expect(changelogContents).to.eventually.match(regexFixture('index-spec/CHANGELOG-second.md'))
    })
  })

  describe('the rejectLockedBranches-method', () => {
    afterEach(() => {
      process.env['THOUGHTFUL_LOCKED_BRANCHES'] = ''
      delete process.env['THOUGHTFUL_LOCKED_BRANCHES']
    })

    it('should reject the master branch by default', () => {
      return expect(thoughtful.rejectLockedBranches()).to.be.rejectedWith(Error)
    })

    it('should not reject the branch "feature" by default', () => {
      var check = qcp.execFile('git', ['branch', 'feature'], {cwd: workDir()})
        .then(() => qcp.execFile('git', ['checkout', 'feature'], {cwd: workDir()}))
        .then(() => thoughtful.rejectLockedBranches())
      return expect(check).to.eventually.be.equal(true)
    })

    it('should not reject the master branch if THOUGHTFUL_LOCKED_BRANCHES=false', () => {
      process.env['THOUGHTFUL_LOCKED_BRANCHES'] = 'false'
      return expect(thoughtful.rejectLockedBranches()).to.eventually.equal(true)
    })
  })

  describe('the cleanupHistory-method', () => {
    it('should rebase a branch onto the master ', () => {
      // Git editor command that does not modify the commit message and works on all platforms
      process.env['GIT_EDITOR'] = `${require.resolve('./dummy-git/commit-editor.js')} "Rebased commit"`
      thoughtful.reset()
      // Test setup: two feature branches forked from master~1
      return git('branch', 'feature1')
        .then(() => gitCommit('file1.txt', 'abc', 'Added file1.txt'))
        .then(() => git('checkout', 'feature1'))
        .then(() => gitCommit('file2.txt', 'file2-added', 'Added file2'))
        .then(() => gitCommit('file2.txt', 'file2-modified', 'Modified file2'))
        .then(() => git('branch', 'feature2')) // This does not switch to the branch
        .then(() => gitCommit('file3.txt', 'file3-added-feature1', 'Added file3'))
        .then(() => git('checkout', 'feature2'))
        .then(() => gitCommit('file3.txt', 'file3-added-feature2', 'Added file3'))
        .then(() => thoughtful.cleanupHistory({targetBranch: 'master', thoughtful: require.resolve('../bin/thoughtful.js')}))
        // Test conditions
        .then(() => expect(git('log', '--pretty===%s%n%b').then((output) => output.stdout.trim().replace(/\n+/g, '  ')))
            .to.eventually.equal('==Rebased commit  Added file2  Modified file2  Added file3  ==Added file1.txt  ==Added package.json'))
    })

    it('should also work when no rebase is necessary in the end', () => {
      // Git editor command that does not modify the commit message and works on all platforms
      process.env['GIT_EDITOR'] = `${require.resolve('./dummy-git/commit-editor.js')} "Rebased commit"`
      thoughtful.reset()
      // Test setup: two feature branches forked from master~1
      return git('branch', 'feature1')
        .then(() => git('checkout', 'feature1'))
        .then(() => gitCommit('file2.txt', 'file2-added', 'Added file2'))
        .then(() => gitCommit('file2.txt', 'file2-modified', 'Modified file2'))
        .then(() => gitCommit('file3.txt', 'file3-added-feature1', 'Added file3'))
        .then(() => thoughtful.cleanupHistory({targetBranch: 'master', thoughtful: require.resolve('../bin/thoughtful.js')}))
        // Test conditions
        .then(() => expect(git('log', '--pretty===%s%n%b').then((output) => output.stdout.trim().replace(/\n+/g, '  ')))
            .to.eventually.equal('==Rebased commit  Added file2  Modified file2  Added file3  ==Added package.json'))
    })

    it('should rebase a branch, that consists of a single commit, onto the master and offer to change the commit message', () => {
      // Git editor command that does not modify the commit message and works on all platforms
      process.env['GIT_EDITOR'] = `${require.resolve('./dummy-git/commit-editor.js')} "Rebased commit"`
      thoughtful.reset()
      // Test setup: two feature branches forked from master~1
      return git('branch', 'feature1')
        .then(() => gitCommit('file1.txt', 'abc', 'Added file1.txt'))
        .then(() => git('checkout', 'feature1'))
        .then(() => gitCommit('file2.txt', 'file2-added', 'Added file2'))
        .then(() => thoughtful.cleanupHistory({targetBranch: 'master', thoughtful: require.resolve('../bin/thoughtful.js')}))
        // Test conditions
        .then(() => expect(git('log', '--pretty===%s%n%b').then((output) => output.stdout.trim().replace(/\n+/g, '  ')))
            .to.eventually.equal('==Rebased commit  Added file2  ==Added file1.txt  ==Added package.json'))
    })
  })

  describe('the sequenceEditor-method', () => {
    it('should replace all "pick" with "squash" in the file, except the first one', () => {
      var actual = qfs.copy('test/fixtures/git-rebase-todo.txt', workDir('git-rebase-todo'))
        .then(() => thoughtful.sequenceEditor(workDir('git-rebase-todo')))
        .then(() => qfs.read(workDir('git-rebase-todo')))
      var expected = qfs.read('test/fixtures/git-rebase-todo-target.txt')
      return Q.all([actual, expected])
        .spread((actual, expected) => expect(actual).to.equal(expected))
    })

    it('should reject files other than "git-rebase-todo"', () => {
      var promise = qfs.copy('test/fixtures/git-rebase-todo.txt', workDir('git-rebase-todo.txt'))
        .then(() => thoughtful.sequenceEditor(workDir('git-rebase-todo.txt')))
      return expect(promise).to.be.rejected
    })
  })
})
