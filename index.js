#!/usr/bin/env node

/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

'use strict'

var Q = require('q')
var _ = {
  contains: require('lodash.contains'),
  isPlainObject: require('lodash.isplainobject')
}
var path = require('path')

module.exports = Thoughtful

/**
 * Return a new Thoughtful instance
 * @param {string} cwd the working directory of that instance
 * @constructor
 */
function Thoughtful (cwd) {
  var npm = require('./lib/npm')(cwd)
  var changelog = require('./lib/changelog')(cwd)
  var git = require('./lib/git')(cwd)

  /**
   * Update the CHANGELOG.md of the module in the given working directory.
   *
   * @param {object=} options optional parameters
   * @param {string=} options.release the release specification (as in `npm version`). If no value is provided, the current
   *    version from the package.json will be used. This is useful, when the function is called by as npm-`version` script
   *    in which case it is called after version bump but before committing the change.
   * @param {boolean=} options.openEditor if this value is true, the changelog-file will be opened in an editor before commiting to git.
   *    The environment variable THOUGHTFUL_CHANGELOG_EDITOR may contain a custom command to open the editor. If this variable is not
   *    set, the EDITOR variable or `vi` will be used.
   * @param {boolean=} options.addToGit if this value is true, the changelog-file will be staged in the git repository
   * @returns {Promise<?>} a promise for finishing writing the changelog
   */
  this.updateChangelog = function updateChangelog (options) {
    options = options || {}
    this.reset()
    // Determine next version
    const versionP = npm.incVersion(options.release)
    // Determine current version tag
    const releaseInfoP = git.lastRelease()
    // Determine repository url
    const repoUrlP = npm.repositoryUrl

    return Q.all([versionP, releaseInfoP, repoUrlP])
      .spread((version, releaseInfo, repoUrl) => {
        // Determine changes since current version tag
        return git.changes(releaseInfo.tag, {url: repoUrl})
          // Store changelog
          .then((changes) => changelog.newRelease(version, new Date(), changes).save())
          .then(() => `Updated CHANGELOG.md for version ${version}`)
      })
  }

  /**
   * Throw an exception if the current branch is listed in `package.json` under
   * `$.thoughtful.lockedBranches`.
   *
   * The branch check can be disabled by setting the environment variable
   * `THOUGHTFUL_LOCKED_BRANCHES=false`
   *
   * @returns {Promise.<boolean>} true, if the branch is not locked.
   * @throw {Error} if the branch is locked
   */
  this.rejectLockedBranches = function rejectLockedBranches () {
    if (process.env['THOUGHTFUL_LOCKED_BRANCHES'] === 'false') {
      return Q(true)
    }
    this.reset()
    return Q.all([git.currentBranch(), npm.lockedBranches()])
      .spread((current, lockedBranches) => {
        return _.contains(lockedBranches, current) ? current : null
      })
      .then((branch) => {
        if (branch) {
          throw new Error('Current branch "' + branch + '" is locked. Commit rejected')
        }
        return true
      })
  }

  /**
   * For use with "git -c sequence.editor=..." when rebasing and squashing feature-branches
   *
   * Replace "pick" commits in rebase-todo-file by "squash" (except the first).
   *
   * @param filename the name of the file to be edited
   */
  this.sequenceEditor = function (filename) {
    switch (path.basename(filename)) {
      case 'git-rebase-todo':
        return git.squashRebaseTodos(filename)
      default:
        throw new Error('Unexpected file edited in sequence editor: ' + filename)
    }
  }

  /**
   * Perform a rebase of the current (topic-)branch onto a target-branch, condensing the
   * whole branch into a single commit.
   * @param {object} options options to this function
   * @param {string=} options.targetBranch the branch to rebase the current branch upon (default: master)
   * @param {string=} options.thoughtful the command to invoke "thoughtful" (default: process.argv[1])
   */
  this.cleanupHistory = function (options) {
    return git.cleanupHistory(options)
  }

  /**
   * Reset and reload the cached parts of Thoughtful
   */
  this.reset = function reset () {
    npm = require('./lib/npm')(cwd)
    changelog = require('./lib/changelog')(cwd)
    git = require('./lib/git')(cwd)
  }
}
