#!/usr/bin/env node

/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

'use strict'

var fs = require('fs')
var git = require('../lib/git')('.')

var packageJson = JSON.parse(fs.readFileSync('package.json'))
git.lastRelease()
  .then((release) => git.changelog(release.tag, {
      repoUrl: packageJson.repository.url
    }))
  .done(console.log)
