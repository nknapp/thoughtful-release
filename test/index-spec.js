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
var qcp = require('../lib/q-child-process')
var fs = require('fs-extra')
var path = require('path')
var _ = {
  escapeRegExp: require('lodash.escaperegexp'),
  toArray: require('lodash.toarray')
}

delete process.env['THOUGHTFUL_GIT_CMDcd']

var Thoughtful = require('../')

function fixture (filename) {
  return fs.readFileSync(path.join('test', 'fixtures', filename), { encoding: 'utf-8' })
}

// Remove commit-ish and timestamp from changelog contents to make it comparable to test fixtures
function normalize (changelogContents) {
  return changelogContents
    .replace(/\w\w\w, \d\d \w\w\w \d\d\d\d \d\d:\d\d:\d\d GMT/g, 'TIMESTAMP')
    .replace(/[0-9a-f]{7}/g, 'COMMIT_ISH')
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
    return qcp.execFile('git', _.toArray(arguments), { cwd: workDir() })
  }

  function gitCommit (file, contents, message) {
    return fs.writeFile(workDir(file), contents)
      .then(() => git('add', file))
      .then(() => git('commit', '-a', '-m', message))
  }

  // Clear the working directory before each test
  beforeEach(() => {
    return fs.remove(workDir())
      .catch(ignoreENOENT)
      .then(() => fs.mkdirp(workDir()))
      // Create git repo
      .then(() => qcp.execFile('git', ['init'], { cwd: workDir() }))
      .then(() => git('config', 'user.email', 'test@example.com'))
      .then(() => git('config', 'user.name', 'Test User'))
      // add and commit package.json
      .then(() => {
        return fs.writeFile(workDir('package.json'), JSON.stringify({
          name: 'test-package',
          version: '0.0.1',
          repository: {
            url: 'git@github.com:nknapp/example.git'
          }
        }))
      })
      .then(() => qcp.execFile('git', ['add', 'package.json'], { cwd: workDir() }))
      .then(() => qcp.execFile('git', ['commit', '-m', 'Added package.json'], { cwd: workDir() }))
      .then(() => thoughtful.reset())
  })

  describe('the updateChangelog-method', () => {
    afterEach(() => {
      process.env['THOUGHTFUL_CHANGELOG_EDITOR'] = ''
      process.env['EDITOR'] = ''
    })
    it('should create an initial CHANGELOG.md file for a first release', () => {
      var changelogContents = thoughtful.updateChangelog({ release: 'minor' })
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
      return expect(changelogContents.then(normalize)).to.eventually.equal(fixture('index-spec/CHANGELOG-first.md'))
    })

    it('should create an initial CHANGELOG.md file for a current release', () => {
      var changelogContents = thoughtful.updateChangelog()
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
      return expect(changelogContents.then(normalize)).to.eventually.equal(fixture('index-spec/CHANGELOG-current.md'))
    })

    it('should update CHANGELOG.md file for a second release', function () {
      this.timeout(5000)
      // Update changelog and bump version
      var changelogContents = thoughtful.updateChangelog({ release: 'minor' })
        .then(() => qcp.execFile('npm', ['version', 'minor'], { cwd: workDir() }))
        // On Windows, we need to call the '.cmd' file
        .catch(() => qcp.execFile('npm.cmd', ['version', 'minor'], { cwd: workDir() }))
        // Add another file
        .then(() => fs.writeFile(workDir('index.js'), "'use strict'"))
        .then(() => qcp.execFile('git', ['add', 'index.js'], { cwd: workDir() }))
        .then(() => qcp.execFile('git', ['commit', '-m', 'Added index.js'], { cwd: workDir() }))
        // Update changelog again and load contents
        .then(() => thoughtful.updateChangelog({ release: 'patch' }))
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))

      return expect(changelogContents.then(normalize))
        .to.eventually.equal(fixture('index-spec/CHANGELOG-second.md'))
    })

    it('should add the CHANGELOG.md file if addToGit is true', () => {
      var stagedFiles = thoughtful.updateChangelog({ addToGit: true })
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
        // get staged files
        .then(() => git('diff', '--name-only', '--staged'))
        .then((output) => output.stdout.trim())
      return expect(stagedFiles).to.eventually.equal('CHANGELOG.md')
    })

    it('should not add the CHANGELOG.md file if addToGit is undefined', () => {
      var stagedFiles = thoughtful.updateChangelog()
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
        // get staged files
        .then(() => git('diff', '--name-only', '--staged'))
        .then((output) => output.stdout)
      return expect(stagedFiles).to.eventually.equal('')
    })

    it('should not add the CHANGELOG.md file if addToGit is false', () => {
      var stagedFiles = thoughtful.updateChangelog({ addToGit: false })
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
        // get staged files
        .then(() => git('diff', '--name-only', '--staged'))
        .then((output) => output.stdout)
      return expect(stagedFiles).to.eventually.equal('')
    })

    it('should open an editor for the CHANGELOG.md file if openEditor is true', () => {
      const dummyEditor = path.resolve(__dirname, 'dummy-editor', 'dummy-editor.js')
      process.env['THOUGHTFUL_CHANGELOG_EDITOR'] = `node '${dummyEditor}' changelog-editor`
      var contents = thoughtful.updateChangelog({ openEditor: true })
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
      return expect(contents.then(normalize)).to.eventually.equal(fixture('index-spec/CHANGELOG-current-edited.md'))
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
      var check = qcp.execFile('git', ['branch', 'feature'], { cwd: workDir() })
        .then(() => qcp.execFile('git', ['checkout', 'feature'], { cwd: workDir() }))
        .then(() => thoughtful.rejectLockedBranches())
      return expect(check).to.eventually.be.equal(true)
    })

    it('should not reject the master branch if THOUGHTFUL_LOCKED_BRANCHES=false', () => {
      process.env['THOUGHTFUL_LOCKED_BRANCHES'] = 'false'
      return expect(thoughtful.rejectLockedBranches()).to.eventually.equal(true)
    })
  })

  describe('the cleanupHistory-method', function () {
    before(() => {
      // Git editor command that does keeps the commit-message complete (to some extent) and works on all platforms
      process.env['GIT_EDITOR'] = `'${require.resolve('./dummy-git/commit-editor.sh').replace(/[\\]/g, '/$&')}' "Rebased commit"`
    })
    after(() => {
      process.env['GIT_EDITOR'] = ''
    })

    this.timeout(30000)
    it('should rebase a branch onto the master ', () => {
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
        .then(() => thoughtful.cleanupHistory({ targetBranch: 'master', thoughtful: require.resolve('../bin/thoughtful.js') }))
        // Test conditions
        .then(() => expect(git('log', '--pretty===%s%n%b').then((output) => output.stdout.trim().replace(/\n+/g, '  ')))
          .to.eventually.equal('==Rebased commit  Added file2  Modified file2  Added file3  ==Added file1.txt  ==Added package.json'))
    })

    it('should also work when no rebase is necessary in the end', () => {
      thoughtful.reset()
      // Test setup: two feature branches forked from master~1
      return git('branch', 'feature1')
        .then(() => git('checkout', 'feature1'))
        .then(() => gitCommit('file2.txt', 'file2-added', 'Added file2'))
        .then(() => gitCommit('file2.txt', 'file2-modified', 'Modified file2'))
        .then(() => gitCommit('file3.txt', 'file3-added-feature1', 'Added file3'))
        .then(() => thoughtful.cleanupHistory({ targetBranch: 'master', thoughtful: require.resolve('../bin/thoughtful.js') }))
        // Test conditions
        .then(() => expect(git('log', '--pretty===%s%n%b').then((output) => output.stdout.trim().replace(/\n+/g, '  ')))
          .to.eventually.equal('==Rebased commit  Added file2  Modified file2  Added file3  ==Added package.json'))
    })

    it('should rebase a branch, that consists of a single commit, onto the master and offer to change the commit message', () => {
      thoughtful.reset()
      // Test setup: two feature branches forked from master~1
      return git('branch', 'feature1')
        .then(() => gitCommit('file1.txt', 'abc', 'Added file1.txt'))
        .then(() => git('checkout', 'feature1'))
        .then(() => gitCommit('file2.txt', 'file2-added', 'Added file2'))
        .then(() => thoughtful.cleanupHistory({ targetBranch: 'master', thoughtful: require.resolve('../bin/thoughtful.js') }))
        // Test conditions
        .then(() => expect(git('log', '--pretty===%s%n%b').then((output) => output.stdout.trim().replace(/\n+/g, '  ')))
          .to.eventually.equal('==Rebased commit  Added file2  ==Added file1.txt  ==Added package.json'))
    })
  })

  describe('the sequenceEditor-method', () => {
    it('should replace all "pick" with "squash" in the file, except the first one', () => {
      var actual = fs.copy('test/fixtures/git-rebase-todo.txt', workDir('git-rebase-todo'))
        .then(() => thoughtful.sequenceEditor(workDir('git-rebase-todo')))
        .then(() => fs.readFile(workDir('git-rebase-todo'), 'utf-8'))
      var expected = fs.readFile('test/fixtures/git-rebase-todo-target.txt', 'utf-8')
      return Promise.all([actual, expected])
        .then(([actual, expected]) => expect(actual).to.equal(expected))
    })

    it('should reject files other than "git-rebase-todo"', () => {
      var promise = fs.copy('test/fixtures/git-rebase-todo.txt', workDir('git-rebase-todo.txt'))
        .then(() => thoughtful.sequenceEditor(workDir('git-rebase-todo.txt')))
      return expect(promise).to.be.rejected
    })
  })
})
