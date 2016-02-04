#!/usr/bin/env node

/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

// Small library to make handling dummy-calls to git easier.

/**
 * Determine string output from multiple choices passed into the function
 * based on the process argument.
 * @param {object<string,object>} choices a list of choices with their output.
 *    Keys are process-arguments concatenated by pipes ('|')
 */
module.exports = function (choices) {
  var choiceKey = process.argv.slice(2).join('|')
  var selectedChoice = choices[choiceKey]
  if (selectedChoice) {
    if (selectedChoice.stdout) {
      console.log(selectedChoice.stdout)
    }
    if (selectedChoice.stderr) {
      console.error(selectedChoice.stderr)
    }
    process.exit(selectedChoice.exitCode || 0)
  } else {
    console.error(`No choice found for "${choiceKey}" in ${process.argv[1]}`)
    process.exit(255)
  }
}
