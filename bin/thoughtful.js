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
  .action((release) => require('../index.js').updateChangelog(process.cwd(), release))
  .parse(process.argv)
