#!/usr/bin/env node

require('./mock-kit')({
  'describe|--long|--match|v*': {
    stderr: 'Output on stderr'
  },
  'log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..v0.8.5': {
    stderr: 'Output on stderr'
  }
})
