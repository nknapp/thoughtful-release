#!/usr/bin/env node

process.argv = process.argv.map((arg) => arg.replace(/thoughtful-backup\/.*/g, 'thoughtful-backup'))
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
  },
  '-c|sequence.editor=thoughtful sequence-editor|rebase|--interactive|--fork-point|master': {
    stdout: 'rebase onto master'
  },
  '-c|sequence.editor=thoughtful sequence-editor|rebase|--interactive|--fork-point|stable': {
    stdout: 'rebase onto stable'
  },
  'merge-base|HEAD|master': {
    stdout: 'fork-point-master'
  },
  'merge-base|HEAD|stable': {
    stdout: 'fork-point-stable'
  },
  '-c|sequence.editor=thoughtful sequence-editor|rebase|--interactive|fork-point-stable': {
    stdout: 'Squash to fork-point-stable'
  },
  '-c|sequence.editor=thoughtful sequence-editor|rebase|--interactive|fork-point-master': {
    stdout: 'Squash to fork-point-master'
  },
  'rebase|--fork-point|stable': {
    stdout: 'Rebase on stable'
  },
  'rebase|--fork-point|master': {
    stdout: 'Rebase on master'
  },
  'tag|-f|thoughtful-backup': {
    stdout: 'Tagging thoughtful-backup'
  }

})
