#!/usr/bin/env node

require('./mock-kit')({
  'add|file1.js': {
    stdout: '',
    stderr: ''
  },
  'add|file2.js|file3.js': {
    stdout: '',
    stderr: ''
  },

  'add|file4.js': {
    // mimic non-existing file
    stdout: '',
    stderr: "fatal: pathspec 'file4.js' did not match any files",
    exitCode: 128
  }
})
