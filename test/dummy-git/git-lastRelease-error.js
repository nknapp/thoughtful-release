#!/usr/bin/env node

require('./mock-kit')({
  'describe|--long|--match|v*': {
    stderr: 'Some error occured',
    exitCode: 1
  },
  '': {
    stderr: 'Some error occured',
    exitCode: 1
  }
})
