#!/usr/bin/env node

/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

'use strict'

var Q = require('q')

module.exports = {
  updateChangelog: updateChangelog
}

/**
 * Update the CHANGELOG.md of the module in the given working directory.
 *
 * @param {string} cwd the current working directory of the module
 * @param {string} release the release specification (as in `npm version`)
 * @returns {*}
 */
function updateChangelog (cwd, release) {
  var npm = require('./lib/npm')(cwd)
  var changelog = require('./lib/changelog')(cwd)
  var git = require('./lib/git')(cwd)

  // Determine next version
  var versionP = npm.incVersion(release)
  // Determine current version tag
  var releaseInfoP = git.lastRelease()
  return Q.all([versionP, releaseInfoP, npm.repositoryUrl])
    .spread((version, releaseInfo, repoUrl) => {
      // Determine changes since current version tag
      return git.changes(releaseInfo.tag, {url: repoUrl})
        // Store changelog
        .then((changes) => changelog.newRelease(version, new Date(), changes).save())
        .then(() => `Updated CHANGELOG.md for version ${version}`)
    })
}
