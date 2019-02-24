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
var changelog = require('../lib/changelog.js')
var fs = require('fs-extra')
var path = require('path')

function fixture(filename) {
  return require('fs').readFileSync(path.join('test', 'fixtures', filename), { encoding: 'utf-8' })
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

  describe('the contents-method', () => {
    it('should throw an error, if the CHANGELOG.md cannot be read, but does exist', () => {
      var workdir = path.join('tmp', 'test', 'changelog-error')

      // Create CHANGELOG.md as directory, so that it can't be read.
      return fs.mkdirp(path.join(workdir, 'CHANGELOG.md'))
        .then(() => changelog(workdir).contents)
        .then(
          () => expect.fail("Should throw an error"),
          (err) => {
            return expect(err.code).to.equal('EISDIR')
          })
    })
  })

  describe('the save method', function () {
    this.timeout(5000)
    /**
     * Return the path to a file within the working dir
     *
     */
    function workDir() {
      const argsAsArray = Array.prototype.slice.apply(arguments)
      return path.join.apply(path, ['tmp', 'test', 'changelog'].concat(argsAsArray))
    }

    // Clear the working directory before each test
    beforeEach(() => {
      return fs.remove(workDir())
        .catch(ignoreENOENT)
        .then(() => fs.mkdirp(workDir()))
    })

    it('should store the current state into the CHANGELOG.md file', () => {
      var changelogContents = changelog(workDir()).save()
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))

      return expect(changelogContents).to.eventually.equal(fixture('changelog-empty.md'))
    })

    it('should be able to load, store a CHANGELOG.md file without modifying it.', () => {
      var changelogContents = fs.copy('test/fixtures/changelog-with-a-release.md', workDir('CHANGELOG.md'))
        .then(() => changelog(workDir())
          .save())
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
      return expect(changelogContents).to.eventually.equal(fixture('changelog-with-a-release.md'))
    })

    it('should be able to load a CHANGELOG.md and store a modified version', () => {
      var changelogContents = fs.copy('test/fixtures/changelog-with-a-release.md', workDir('CHANGELOG.md'))
        .then(() => changelog(workDir())
          .newRelease('2.0.0', new Date('2015-11-25T13:06:00Z'), '* Change 1\n* Change 2')
          .save())
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
      return expect(changelogContents).to.eventually.equal(fixture('changelog-with-two-releases.md'))
    })
  })

  describe('The openEditor-method', function () {
    /**
     * Return the path to a file within the working dir
     *
     */
    function workDir() {
      const argsAsArray = Array.prototype.slice.apply(arguments)
      return path.join.apply(path, ['tmp', 'test', 'changelog-editor'].concat(argsAsArray))
    }

    // Clear the working directory before each test
    beforeEach(() => {
      return fs.remove(workDir())
        .catch(ignoreENOENT)
        .then(() => fs.mkdirp(workDir()))
    })

    afterEach(() => {
      process.env['THOUGHTFUL_CHANGELOG_EDITOR'] = ''
      process.env['EDITOR'] = ''
    })

    it('should call THOUGHTFUL_CHANGELOG_EDITOR as editor, if set', () => {
      const dummyEditor = path.resolve(__dirname, 'dummy-editor', 'dummy-editor.js')
      // Dummy editor prepends contents with first argument ("changelog editor")
      process.env['THOUGHTFUL_CHANGELOG_EDITOR'] = `node "${dummyEditor}" changelog-editor`
      process.env['EDITOR'] = `node "${dummyEditor}" default-editor`
      var changelogContents = changelog(workDir()).openEditor()
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
      return expect(changelogContents).to.eventually.equal(`changelog-editor

# Release-Notes
<a name="current-release"></a>
`)
    })

    it('should call escape the changelog-path propery if it contains spaces', () => {
      const dummyEditor = path.resolve(__dirname, 'dummy-editor', 'dummy-editor.js')
      // Dummy editor prepends contents with first argument ("changelog editor")
      process.env['THOUGHTFUL_CHANGELOG_EDITOR'] = `node "${dummyEditor}" changelog-editor`

      var changelogContents = fs.mkdirp(workDir('with spaces'))
        .then(() => changelog(workDir('with spaces')).openEditor())
        .then(() => fs.readFile(workDir('with spaces/CHANGELOG.md'), 'utf-8'))
      return expect(changelogContents).to.eventually.equal(`changelog-editor

# Release-Notes
<a name="current-release"></a>
`)
    })

    it('should call EDITOR as editor, if THOUGHTFUL_CHANGELOG_EDITOR is not set', () => {
      const dummyEditor = path.resolve(__dirname, 'dummy-editor', 'dummy-editor.js')
      process.env['THOUGHTFUL_CHANGELOG_EDITOR'] = ''
      process.env['EDITOR'] = `node "${dummyEditor}" default-editor`
      var changelogContents = changelog(workDir()).openEditor()
        .then(() => fs.readFile(workDir('CHANGELOG.md'), 'utf-8'))
      return expect(changelogContents).to.eventually.equal(`default-editor

# Release-Notes
<a name="current-release"></a>
`)
    })
  })
})
