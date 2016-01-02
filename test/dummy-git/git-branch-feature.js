#!/usr/bin/env node

require('./mock-kit')({
  'symbolic-ref|--short|HEAD': {
    stdout: 'feature\n'
  }
})
