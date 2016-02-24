#!/usr/bin/env node

// Changelog-Editor for unit-tests
// Usage:
//   dummy-editor.js "some text" "file-to-open"
//
//       "some text": This text will be inserted at the beginning of the file
//       "file-to-open": The file the should be edited
//
var fs = require('fs')
var contents = fs.readFileSync(process.argv[3], {encoding: 'utf-8'})
contents = contents.replace(/\n+/g, '\n')
fs.writeFileSync(process.argv[3], `${process.argv[2]}

${contents.trim()}
`)
