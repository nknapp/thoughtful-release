#!/usr/bin/env node

require('./mock-kit')({
  'describe|--long|--match|v*': {
    stdout: '12345-0-g1d8ed8e'
  }
})
