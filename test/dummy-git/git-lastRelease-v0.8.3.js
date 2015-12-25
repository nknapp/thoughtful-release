#!/usr/bin/env node

require('./mock-kit')({
  'describe|--long|--match|v*': {
    stdout: 'v0.8.3-0-g3f5e3fa'
  },
  'log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..': {
    stdout: 'log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..'
  },
  'log|--no-merges|--pretty=tformat:* [%h](https://github.com/nknapp/bootprint/commit/%h) %s - %an|v0.8.3..': {
    stdout: 'log|--no-merges|--pretty=tformat:* [%h](https://github.com/nknapp/bootprint/commit/%h) %s - %an|v0.8.3..'
  },
  'log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..v0.8.5': {
    stdout: 'log|--no-merges|--pretty=tformat:* %h %s - %an|v0.8.3..v0.8.5'
  }

})
