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
var _ = require('lodash')

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
    const argsAsArray = Array.prototype.slice.apply(arguments)
    return path.join.apply(path, ['tmp', 'test', 'index-js'].concat(argsAsArray))
  }

  /**
   *
   * @type {Thoughtful}
   */
  var thoughtful = new Thoughtful(workDir())

  // Clear the working directory before each test
  beforeEach(() => {
    return qfs.removeTree(workDir())
      .catch(ignoreENOENT)
      .then(() => qfs.makeTree(workDir()))
      // Create git repo
      .then(() => qcp.execFile('git', ['init'], {cwd: workDir()}))

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
      var changelogContents = thoughtful.updateChangelog('minor')
        .then(() => qfs.read(workDir('CHANGELOG.md')))
      return expect(changelogContents).to.eventually.match(regexFixture('index-spec/CHANGELOG-first.md'))
    })

    it('should update CHANGELOG.md file for a second release', () => {
      // Update changelog and bump version
      var changelogContents = thoughtful.updateChangelog('minor')
        .then(() => qcp.execFile('npm', ['version', 'minor'], {cwd: workDir()}))
        // Add another file
        .then(() => qfs.write(workDir('index.js'), "'use strict'"))
        .then(() => qcp.execFile('git', ['add', 'index.js'], {cwd: workDir()}))
        .then(() => qcp.execFile('git', ['commit', '-m', 'Added index.js'], {cwd: workDir()}))
        // Update changelog again and load contents
        .then(() => thoughtful.updateChangelog('patch'))
        .then(() => qfs.read(workDir('CHANGELOG.md')))

      return expect(changelogContents).to.eventually.match(regexFixture('index-spec/CHANGELOG-second.md'))
    })
  })

  describe('the rejectLockedBranches-method', () => {
    afterEach(() => {
      process.env['THOUGHTFUL_ALLOW_LOCKED_BRANCHES'] = ''
      delete process.env['THOUGHTFUL_ALLOW_LOCKED_BRANCHES']
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

    it('should not reject the master branch if THOUGHTFUL_ALLOW_LOCKED_BRANCHES=true', () => {
      process.env['THOUGHTFUL_ALLOW_LOCKED_BRANCHES'] = 'true'
      return expect(thoughtful.rejectLockedBranches()).to.eventually.equal(true)
    })
  })
})
