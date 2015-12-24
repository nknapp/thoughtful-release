/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

var cpp = require('../lib/q-child-process')
var qfs = require('q-io/fs')
var path = require('path')

/**
 * Create a git-object for a directory
 * @param {string} dir the current directory
 * @returns {Git} the git object
 */
module.exports = (dir) => new Git(dir)

/**
 * The Git class for accessing git repositories
 * @param {string} dir the working directory
 * @param {object} options optional parameters
 * @param {
 * @constructor
 */
function Git(dir, options) {
  var gitcmd = process.env['THOUGHTFUL_GIT_CMD'] || 'git';
  /**
   * Return true, if the working directory is a git-repository (i.e. has ".git"-subdirectory)
   *
   * @return {Promise<boolean>} true, if the working directory is a git-repository
   */
  this.isRepo = function isRepo() {
    return qfs.stat(path.join(dir, '.git')).then((stat) => {
      // .git directory must be a directory
      return stat.isDirectory()
    }).catch((error) => {
      if (error.code === 'ENOENT') {
        // Not .git directory
        return false
      } else {
        throw error
      }
    })
  }

  /**
   * Answer the lastest release tag
   */
  this.lastRelease = function lastReleaseTag() {
    return cpp.execFile(gitcmd, ['describe', '--long', '--match', 'v*']).then((output) => {
      var match = output.trim().match(/^(v.+)-(\d+)-g([\da-f]+)$/)
      if (match) {
        return {
          tag: match[1],
          newCommits: Number(match[2])
        }
      } else {
        throw(new Error('No version tag found'))
      }
    })
  }

  /**
   * Generate changelog entries for a span between two tags
   * @param {string} from the start tag
   * @param {object=} options optional parameters
   * @param {string=} options.githubUrl url prefix for github
   * @param {string=} options.to the end tag. This defaults to the current commit if not set.
   */
  this.changelog = function changelog(from, options) {
    var to = "";
    var commitPattern = "%h";

    if (options) {
      if (options.to) {
        to = options.to;
      }
      if (options.githubUrl) {
        commitPattern = `[%h](${options.githubUrl}/commit/%h)`
      }
    }
    return cpp.execFile(gitcmd, ['log', '--no-merges', `--pretty=tformat:* ${commitPattern} %s - %an`, `${from}..${to}` ])
  }
}
