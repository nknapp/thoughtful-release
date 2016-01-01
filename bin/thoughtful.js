#!/usr/bin/env node

/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

'use strict'

var program = require('commander')

program
  .version(require('../package').version)
  .command('changelog <release>', 'update the CHANGELOG.md of the module in the current directory')
  .option('<release>', 'The target release of the changelog (same as for "npm version")')
  .action((release) => {
    console.log('Updating changelog')
    require('../index.js').updateChangelog(process.cwd(), release).done(console.log)
  })

program.parse(process.argv)
