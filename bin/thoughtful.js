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
  .command('changelog <release>')
  .action((release) => {
    console.log('Updating changelog')
    require('../index.js').updateChangelog(process.cwd(), release).done(console.log)
  })

program.parse(process.argv)
