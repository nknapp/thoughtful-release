/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

var fs = require('fs-extra')
var path = require('path')
var qcp = require('../lib/q-child-process.js')

module.exports = function (cwd) {
  return new Changelog(cwd)
}

/**
 * Create a new Changelog-object to modify the CHANGELOG.md of a repository
 * @param {string} cwd the directory containing the CHANGELOG.md file
 * @constructor
 */
function Changelog (cwd) {
  this.file = path.join(cwd, 'CHANGELOG.md')

  /**
   * Marks the position in which new releases should be inserted.
   * @type {String}
   */
  this.insertMarker = '<a name="current-release"></a>'

  /**
   * A promise for the contents of CHANGELOG.md
   */
  this.contents = fs.readFile(this.file, 'utf-8').catch((err) => {
    if (err.code === 'ENOENT') {
      return '# Release-Notes\n\n' + this.insertMarker + '\n'
    }
    throw err
  })

  /**
   * This method takes a version, a date and a formatted set of changes
   * and returns a combined markdown string of the changes.
   * @param version
   * @param {Date} date
   * @param changes
   * @returns {*}
   */
  this.formatRelease = function (version, date, changes) {
    var dateStr = date.toUTCString()
    return `# Version ${version} (${dateStr})

${changes}

`
  }

  /**
   * The changelog is extended by a new release
   * @param version the new version
   * @param date the date of the release
   * @param changes the list of changes
   */
  this.newRelease = function (version, date, changes) {
    var oldContents = this.contents
    var release = this.insertMarker + '\n' + this.formatRelease(version, date, changes)
    this.contents = oldContents
      .then((contents) => {
        return contents
          .replace(this.insertMarker, release)
          .replace(/\n*$/, '\n')
      })
    return this
  }

  /**
   * Store the modified file into the changelog
   * @returns {Promise.<?>} a promise that is resolved when the file is written
   */
  this.save = function () {
    return this.contents
      .then((contents) => fs.writeFile(this.file, contents))
  }

  /**
   * Open an editor on CHANGELOG.md. The command is either taken from the environment variable
   * THOUGHTFUL_CHANGELOG_EDITOR or EDITOR. If none is defined, `vi` is used.
   * @returns {Promise.<*>} a Promise that is resolved when the editor closes with exit-code zero and rejected
   *    for any other exit-code.
   */
  this.openEditor = function () {
    var editor = process.env['THOUGHTFUL_CHANGELOG_EDITOR'] || process.env['EDITOR'] || /* istanbul ignore next */ 'vi'
    var file = path.relative(cwd, this.file)
    return this.save().then(() => qcp.spawnWithShell(`${editor} ${qcp.escapeParam(file)}`, { env: process.env, cwd: cwd, stdio: 'inherit' }))
  }
}
