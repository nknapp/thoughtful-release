#!/usr/bin/env node

require('./mock-kit')({
  'describe|--long|--match|v*': {
    stdout: 'v0.8.3-beta-0-g3f5e3fa'
  }
})
