#!/usr/bin/env node

/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

'use strict'


var fs = require('fs')
var git = require('../lib/git')(".");
var _ = require('lodash')



/**
 *  Normalize "git://github.com/nknapp/bootprint" and "git@github.com/nknapp/bootprint" to "https://github.com/nknapp/bootprint.git",
 * Ensure single ".git" at the end.
 * Leave everything intact that does not have github in it.
 */
function normalizeUrl(url) {
  if (!_.isString(url)) {
    return url;
  }
  var match = url.match(/.*?(:\/\/|@)github\.com[/:](.*?)(#.*?)?$/);
  if (match) {
    return 'https://github.com/'+match[2].replace(/\.git$/,"");
  } else {
    return null;
  }
}

var packageJson = JSON.parse(fs.readFileSync('package.json'));
git.lastRelease()
  .then((release) => git.changelog(release.tag, {
    githubUrl: normalizeUrl(packageJson.repository.url)
  }))
  .done(console.log);

