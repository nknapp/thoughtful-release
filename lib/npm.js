/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

var path = require('path')
var semver = require('semver')
var qfs = require('q-io/fs')
var Q = require('q')

/**
 * Returns an NPM object for the given directory
 * @param {string} cwd
 * @return {NPM} the NPM object for the given directory
 */
module.exports = function npm (cwd) {
  return new NPM(cwd)
}

/**
 * Creates an NPM-object for the given directory
 *
 * @param {string} cwd the module directory (containing the `package.json`)
 * @constructor
 */
function NPM (cwd) {
  this.packageJson = qfs.read(path.resolve(cwd, 'package.json')).then(JSON.parse)
  this.repositoryUrl = this.packageJson
    .then((packageJson) => packageJson.repository && packageJson.repository.url)
  /**
   * Increment the version of the module in a directory and return the new version
   * @param {string} release a release-specifier or a semver-version (as `npm version`)
   * @returns {Promise<string>} the incremented or the specified version as promise
   */
  this.incVersion = function (release) {
    return Q(semver.valid(release) ||
      this.packageJson.then((packageJson) => semver.inc(packageJson.version, release)))
  }
}
