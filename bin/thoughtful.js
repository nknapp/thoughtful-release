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
  .command('precommit')
  .description('Perform precommit-checks (locked branches...). Return non-zero exit-code if something is wrong')
  .action(() => {
    thoughtful.rejectLockedBranches().done(console.log)
  })

program
  .command('sequence-editor <filename>')
  .description('"Editor" for the rebase todos (replacing "pick" with "squash") with no interaction')
  .action((filename) => {
    thoughtful.sequenceEditor(filename).done(() => console.log(`File ${filename} written.`))
  })

program
  .command('cleanup-history [target-branch]')
  .description('Rebase the current branch onto another branch, condensing the whole branch into a single commit.')
  .action((targetBranch) => {
    thoughtful.cleanupHistory({targetBranch: targetBranch}).done(() => console.log(`Cleanup complete`))
  })

program.parse(process.argv)

if (process.argv.length === 2) {
  // No args provided: Display help
  program.outputHelp()
}
