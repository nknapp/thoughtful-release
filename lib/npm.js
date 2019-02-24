/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2019 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

var path = require('path')
var semver = require('semver')
var fs = require('fs-extra')
var Q = require('q')
var _ = {
  defaultsDeep: require('lodash.defaultsdeep')
}

/**
 * Returns an NPM object for the given directory
 * @param {string} cwd
 * @return {NPM} the NPM object for the given directory
 */
module.exports = function npm (cwd) {
  return new NPM(cwd)
}

/**
 * Default values for the "thoughtful"-property of the `package.json`
 */
var thoughtfulDefaults = {
  thoughtful: {
    lockedBranches: ['master']
  }
}

/**
 * Creates an NPM-object for the given directory
 *
 * @param {string} cwd the module directory (containing the `package.json`)
 * @constructor
 */
function NPM (cwd) {
  /**
   * The contents of the package.json file (parsed)
   *
   * @type {Promise.<object>}
   */
  this.packageJson = fs.readFile(path.resolve(cwd, 'package.json'), 'utf-8')
    .then(JSON.parse)
    .then((packageJson) => _.defaultsDeep(packageJson, thoughtfulDefaults))

  /**
   * Return the url to the git-repository.
   * The url is modified in order to provide a web-url
   * where the repository contents can be watched.
   *
   * @type {Promise.<string>}
   */
  this.repositoryUrl = this.packageJson
    .then((packageJson) => packageJson.repository && packageJson.repository.url)
  /**
   * Increment the version of the module in a directory and return the new version
   * @param {string=} increment a version increment (major, minor...) or a semver-version
   *   (same values as for `npm version`). If no value is provided, the function will return
   *   the current version
   * @returns {Promise<string>} the incremented or the specified version as promise
   */
  this.computeVersion = function (increment) {
    if (!increment) {
      return this.packageJson.then(pkgJson => pkgJson.version)
    }
    var version = semver.valid(increment)
    if (version) {
      return Q(version)
    }
    // Apply version increment
    return this.packageJson.then((packageJson) => {
      var newVersion = semver.inc(packageJson.version, increment)
      if (!newVersion) {
        throw new Error('Invalid increment increment: "' + increment + '" is neither a valid semver-number, ' +
          'nor `major`, `premajor`, `minor`, `preminor`, `patch`, `prepatch`, or `prerelease`')
      }
      return newVersion
    })
  }

  /**
   * Checks whether the given branch is a locked-branche (i.e. a branch that may not be
   * committed to directly.
   * @param {string} branch the branch to check
   * @returns {Promise<boolean>} true if the branch is locked
   */
  this.lockedBranches = function () {
    return this.packageJson.then(function (packageJson) {
      return packageJson.thoughtful.lockedBranches
    })
  }
}
