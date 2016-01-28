#!/usr/bin/env node

require('./mock-kit')({
  'describe|--long|--match|v*': {
    stderr: 'fatal: No names found, cannot describe anything.',
    exitCode: 128
  }
})
