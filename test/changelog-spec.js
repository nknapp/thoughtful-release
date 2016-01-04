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

'use strict'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect
var changelog = require('../lib/changelog.js')
var qfs = require('q-io/fs')
var path = require('path')

function fixture (filename) {
  return require('fs').readFileSync(path.join('test', 'fixtures', filename), {encoding: 'utf-8'})
}

// Exception handler that ignores ENOENT and re-throws everything else
const ignoreENOENT = (err) => {
  if (err.code !== 'ENOENT') {
    throw err
  }
}

describe('changelog-library:', () => {
  describe('the constructor', () => {
    it('should create an empty changelog if none is present', () => {
      return expect(changelog('test').contents).to.eventually.equal(fixture('changelog-empty.md'))
    })
  })

  describe('the newRelease-method', () => {
    it('should add the data of a new release', () => {
      var cl = changelog('test').newRelease('1.0.0', new Date('2015-10-02T13:05:00Z'), '* [Fix] Test')
      return expect(cl.contents).to.eventually.equal(fixture('changelog-with-a-release.md'))
    })
  })

  describe('the save method', () => {
    /**
     * Return the path to a file within the working dir
     *
     */
    function workDir () {
      const argsAsArray = Array.prototype.slice.apply(arguments)
      return path.join.apply(path, ['tmp', 'test', 'changelog'].concat(argsAsArray))
    }

    // Clear the working directory before each test
    beforeEach(() => {
      return qfs.removeTree(workDir())
        .catch(ignoreENOENT)
        .then(() => qfs.makeTree(workDir()))
    })

    it('should store the current state into the CHANGELOG.md file', () => {
      var changelogContents = changelog(workDir()).save()
        .then(() => qfs.read(workDir('CHANGELOG.md')))

      return expect(changelogContents).to.eventually.equal(fixture('changelog-empty.md'))
    })

    it('should be able to load, store a CHANGELOG.md file without modifying it.', () => {
      var changelogContents = qfs.copy('test/fixtures/changelog-with-a-release.md', workDir('CHANGELOG.md'))
        .then(() => changelog(workDir())
            .save())
        .then(() => qfs.read(workDir('CHANGELOG.md')))
      return expect(changelogContents).to.eventually.equal(fixture('changelog-with-a-release.md'))
    })

    it('should be able to load a CHANGELOG.md and store a modified version', () => {
      var changelogContents = qfs.copy('test/fixtures/changelog-with-a-release.md', workDir('CHANGELOG.md'))
        .then(() => changelog(workDir())
            .newRelease('2.0.0', new Date('2015-11-25T13:06:00Z'), '* Change 1\n* Change 2')
            .save())
        .then(() => qfs.read(workDir('CHANGELOG.md')))
      return expect(changelogContents).to.eventually.equal(fixture('changelog-with-two-releases.md'))
    })
  })
})
