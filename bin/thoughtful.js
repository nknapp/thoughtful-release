#!/usr/bin/env node

/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

'use strict'

const program = require('commander')
const Thoughtful = require('../index.js')
const thoughtful = new Thoughtful(process.cwd())

program
  .version(require('../package').version)
  .command('changelog <release>')
  .description('update the CHANGELOG.md of the module in the current directory')
  .option('<release>', 'The target release of the changelog (same as for "npm version")')
  .action((release) => {
    console.log('Updating changelog')
    thoughtful.updateChangelog(release).done(console.log)
  })

program
  .version(require('../package').version)
  .command('precommit')
  .description('Perform precommit-checks (locked branches...). Return non-zero exit-code if something is wrong')
  .action(() => {
    thoughtful.rejectLockedBranches().done(console.log)
  })

program.parse(process.argv)

if (process.argv.length === 2) {
  // No args provided: Display help
  program.outputHelp()
}
