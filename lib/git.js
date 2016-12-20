/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

var cpp = require('../lib/q-child-process')
var qfs = require('m-io/fs')
var path = require('path')
var moment = require('moment')
var debug = require('debug')('thoughtful-release:git')

var _ = {
  defaults: require('lodash.defaults'),
  isString: require('lodash.isstring'),
  toArray: require('lodash.toarray')
}

/**
 * Create a git-object for a directory
 * @param {string} dir the current directory
 * @returns {Git} the git object
 */
module.exports = (dir) => new Git(dir)

/**
 * Path to a node-script to be used instead of the real 'git' for test-cases
 * @type {undefined}
 */
module.exports.mockCmd = undefined

/**
 * The Git class for accessing git repositories
 * @param {string} dir the working directory
 * @constructor
 */
function Git (dir) {
  var env = _.defaults({
    'LANG': 'en_US'
  }, process.env)

  var gitcmd = module.exports.mockCmd ? ['node', module.exports.mockCmd] : 'git'

  /**
   * Execute git with a list of cmd-line arguments in the working directory
   * and with LANG=en_US
   * <br/>
   * This method has dynamic arguments (the cli-arguments to pass to git)
   *
   * @returns {*}
   */
  this.run = function runGit () {
    debug(`Running in ${dir}`, gitcmd, _.toArray(arguments))
    return cpp.execFile(gitcmd, _.toArray(arguments), {env: env, cwd: dir})
  }

  /**
   * Spawn git, keeping stdio connected to the parents stdio. The is needed for commands
   * that need a tty to work
   * @returns {*}
   */
  this.spawn = function spawnGit () {
    debug(`Running in ${dir}`, gitcmd, _.toArray(arguments))
    return cpp.spawn(gitcmd, _.toArray(arguments), {env: env, cwd: dir, stdio: 'inherit'})
  }

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
      /* istanbul ignore else The else path is very unlikely and would need a setup with changed permissions to test it */
      if (error.code === 'ENOENT') {
        // Not .git directory
        return false
      } else {
        throw error
      }
    })
  }

  /**
   * Answer the latest release tag or `null` if no release tag exists
   */
  this.lastRelease = function lastReleaseTag () {
    return this.run('describe', '--long', '--match', 'v*')
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
          return {
            tag: null,
            newCommits: null
          }
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
    return this.run.apply(this, args).then(function (output) {
      if (output.stderr && output.stderr.trim()) {
        throw new Error(output.stderr)
      }
      return output.stdout
    })
  }

  /**
   * Return the currently checked-out branch
   * @returns {Promise.<string>} the branch name
   */
  this.currentBranch = function currentBranch () {
    return this.run('symbolic-ref', '--short', 'HEAD')
      .then((output) => output.stdout.trim())
  }

  /**
   * Replace all "pick" commits of an interactive rebase by "squash" (except the first)
   * @param todoFile the "git-rebase-todo" file
   */
  this.squashRebaseTodos = function squashRebaseTodos (todoFile) {
    return qfs.read(todoFile)
      .then((todo) => {
        var counter = 0
        if (todo.match(/^pick/gm).length > 1) {
          // Replace every "pick" by "squash" except the first one.
          return todo.replace(/^pick/gm, () => counter++ === 0 ? 'pick' : 'squash')
        } else {
          return todo.replace(/^pick/m, 'reword')
        }
      })
      .then((todo) => qfs.write(todoFile, todo))
  }

  /**
   * Perform a rebase of the current (topic-)branch onto a target-branch, condensing the
   * whole branch into a single commit.
   * This is done in two steps: First perform an interactive rebase on the `merge-base` to squash the branch.
   * Then rebase the whole branch on top of the target branch.
   *
   * This workflow has reduces the overhead from conflict management, when conflicts occur in multiple commits and different files on the branch.
   * (see `manual-testing/prepare-repo-for-rebase.sh` as an example where conflict handling works smoother if the branch is squashed first)
   *
   * @param {object=} options options to this function
   * @param {string=} options.thoughtful the command to invoke "thoughtful"
   * @param {string=} options.targetBranch the branch to rebase the current branch upon (default: master)
   */
  this.cleanupHistory = function cleanupHistory (options) {
    var targetBranch = (options && options.targetBranch) || 'master'
    var thoughtful = process.argv[1]
    /* istanbul ignore else
     The default value for "thoughtful" is the current process. It
     is hardly possible to use this default value in a unit-test */
    if (options && options.thoughtful) {
      thoughtful = options.thoughtful
    }

    const timestamp = moment().format('YYYY-MM-DDTHH-mm-ss')
    return this.run('tag', '-f', `thoughtful-backup/cleanup-history-${timestamp}`) // Make a backup...
      .then((tagOutput) => {
        return this.run('merge-base', 'HEAD', targetBranch) // Get merge-base
          // Squash
          .then((mergeBase) => this.spawn('-c', `sequence.editor='${thoughtful}' sequence-editor`, 'rebase', '--interactive', mergeBase.stdout.trim()))
          // Rebase on target branch
          .then(() => this.run('rebase', targetBranch).invoke('appendTo', tagOutput.appendTo('')))
      })
  }

  /**
   * Add (stage) files to the git repository
   * @param {string|string[]} file a single file or an array of files
   * @return {Promise<*>} a promise for the end of the operation
   */
  this.add = function add (file) {
    debug('Staging"' + file + '" to repository at "' + dir + '"')
    var files = _.isString(file) ? [file] : file
    files = files.map((file) => path.relative(dir, file))
    return this.run.apply(this, ['add'].concat(files))
      .then(function (output) {
        return null
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
