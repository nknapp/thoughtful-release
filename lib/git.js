/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

var cpp = require('../lib/q-child-process')
var qfs = require('q-io/fs')
var path = require('path')
var _ = require('lodash')

var env = _.defaults({
  'LANG': 'en_US'
}, process.env)

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
function Git (dir, options) {
  var gitcmd = process.env['THOUGHTFUL_GIT_CMD'] || 'git'
  /**
   * Return true, if the working directory is a git-repository (i.e. has ".git"-subdirectory)
   *
   * @return {Promise<boolean>} true, if the working directory is a git-repository
   */
  this.isRepo = function isRepo () {
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
   * Answer the lastest release tag or `null` if no release tag exists
   */
  this.lastRelease = function lastReleaseTag () {
    return cpp.execFile(gitcmd, ['describe', '--long', '--match', 'v*'], {env: env})
      .then((output) => {
        if (output.stderr && output.stderr.trim()) {
          throw new Error(output.stderr)
        }
        var match = output.stdout.trim().match(/^(v.+)-(\d+)-g([\da-f]+)$/)
        if (match) {
          return {
            tag: match[1],
            newCommits: Number(match[2])
          }
        } else {
          throw new Error(`No version tag found in git output: ${output.stdout}`)
        }
      }, (err) => {
        if (err.message && err.message.indexOf('fatal: No names found, cannot describe anything.') >= 0) {
          return null
        }
        throw err
      })
  }

  /**
   * Generate changelog entries for a span between two tags
   * @param {string} from the start tag
   * @param {object=} options optional parameters
   * @param {string=} options.url repository remote url
   * @param {string=} options.to the end tag. This defaults to the current commit if not set.
   */
  this.changes = function changes (from, options) {
    var to = ''
    var commitPattern = '%h'

    if (options) {
      if (options.to) {
        to = options.to
      }
      commitPattern = markdownLinkPattern(options.url)
    }
    var args = ['log', '--no-merges', `--pretty=tformat:* ${commitPattern} %s - %an`]
    if (from || to) {
      args.push(`${from}..${to}`)
    }
    return cpp.execFile(gitcmd, args).then(function (output) {
      if (output.stderr && output.stderr.trim()) {
        throw new Error(output.stderr)
      }
      return output.stdout
    })
  }
}

/**
 * Convert a repository url like "git://github.com/nknapp/bootprint" and "git@github.com/nknapp/bootprint" to
 * a tformat-pattern for git creating a markdown link to the current commit
 * like "[%h](https://github.com/nknapp/bootprint/commit/%h)".
 * If the url is not github, '%h' will be returned to default.
 * Support for other git-providers (like gitlab) could be added here.
 */
function markdownLinkPattern (url) {
  if (!_.isString(url)) {
    return '%h'
  }
  var match = url.match(/.*?(:\/\/|@)github\.com[/:](.*?)(#.*?)?$/)
  if (match) {
    var repoPath = match[2].replace(/\.git$/, '')
    return `[%h](https://github.com/${repoPath}/commit/%h)`
  } else {
    return '%h'
  }
}
