#!/usr/bin/env node

// Commit editor for the unit-test of the cleanupHistory-method.
// The first argument as subject line to the commit and removes duplicate newlines
// The commit message file must be the second argument, so the usage is with
// GIT_EDITOR='commit-editor.js "a commit subject"'

var fs = require('fs')
var contents = fs.readFileSync(process.argv[3], {encoding: 'utf-8'})
contents = contents.replace(/\n+/g, '\n')
fs.writeFileSync(process.argv[3], `${process.argv[2]}

${contents.trim()}
`)
