/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

var qfs = require('q-io/fs')
var moment = require('moment')
var path = require('path')

module.exports = function (cwd) {
  return new Changelog(cwd)
}

/**
 * Create a new Changelog-object to modify the CHANGELOG.md of a repository
 * @param {string} cwd the directory containing the CHANGELOG.md file
 * @constructor
 */
function Changelog (cwd) {
  var file = path.join(cwd, 'CHANGELOG.md')

  /**
   * Marks the position in which new releases should be inserted.
   * @type {String}
   */
  this.insertMarker = '<a name="current-release">'
  this.momentFormat = 'YYYY-MM-DD'

  /**
   * A promise for the contents of CHANGELOG.md
   */
  this.contents = qfs.read(file).catch((err) => {
    if (err.code === 'ENOENT') {
      return '# Release-Notes\n\n' + this.insertMarker + '\n'
    }
    throw err
  })

  /**
   * This method takes a version, a date and a formatted set of changes
   * and returns a combined markdown string of the changes.
   * @param version
   * @param date
   * @param changes
   * @returns {*}
   */
  this.formatRelease = function (version, date, changes) {
    var dateStr = moment(date).format(this.momentFormat)
    return `
# Version ${version} (${dateStr})

${changes}`
  }

  /**
   * The changelog is extended by a new release
   * @param version the new version
   * @param date the date of the release
   * @param changes the list of changes
     */
  this.newRelease = function (version, date, changes) {
    var oldContents = this.contents
    this.contents = oldContents.then((contents) => contents.replace(this.insertMarker, this.insertMarker + this.formatRelease(version, date, changes))
    )
    return this
  }
}
