var cp = require('child_process')
var Q = require('q')
var debug = require('debug')('thoughtful:q-child-process')

/**
 * Promise-Based functions from child_process
 */
module.exports = {
  execFile: execFile,
  spawn: spawn,
  spawnWithShell: spawnWithShell,
  escapeParam: escapeParam
}

/**
 * Execute a child-process and return a promise for the output
 * @param cmd
 * @param args
 * @param options
 * @returns {{ stdout: string, stderr: string}} the output of the process on stdout and stderr
 */
function execFile (cmd, args, options) {
  var defer = Q.defer()
  cp.execFile(cmd, args, options, (err, stdout, stderr) => {
    if (err) {
      return defer.reject(err)
    }
    return defer.resolve({
      stdout: stdout,
      stderr: stderr,
      /**
       * Appends first stdout, then stderr to the `output`-string and returns the result
       * @param {string} output the previous output
       */
      appendTo: function (output) {
        var myOutput = `${stdout.trim()}\n${stderr.trim()}`
        return `${output}\n${myOutput.trim()}`.trim()
      }
    })
  })
  return defer.promise
}

/**
 * Spawn a process and return a promise that is resolved when the process exits with exit-code zero, or rejected
 * on a non-zero exit-code.
 * @param {string} cmd the command to execute
 * @param {string[]} args command line arguments for the command
 * @param {object} options options for the {@link child_process#spawn}-method.
 * @returns {*} a promise that is resolved or rejected based on the exit-code of the child-process
 */
function spawn (cmd, args, options) {
  debug('spawn', cmd, args, options)
  var defer = Q.defer()
  var child = cp.spawn(cmd, args, options)
  child.on('exit', function (code) {
    if (code === 0) {
      defer.resolve()
      debug('spawn resolved', cmd, args, options)
    } else {
      defer.reject(new Error(`Command "${cmd} ${args && args.join(' ')}" exited with ${code}`))
    }
  })
  return defer.promise
}

/**
 * Spawn a process and return a promise that is resolved when the process exits with exit-code zero, or rejected
 * on a non-zero exit-code.
 * The function uses a shell to spawn the process. The command may be a complete shell command including parameters,
 * and pipes in a single string. It is the counter-part to
 * [child_process#exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
 * but without callback and with the ability to inherit the I/O from the parent process.
 * @param {string} command a command in a single string
 * @param {object=} options options for the {@link child_process#spawn}-method.
 */
function spawnWithShell (command, options) {
  var os = require('os')
  switch (os.type()) {
    case 'Linux':
    case 'Dawin':
      return spawn('/bin/sh', ['-c', command], options)
    case 'Windows_NT':
      return spawn('cmd.exe', ['/s', '/c', command], options)
    default:
      throw new Error(`Unexpected OS-type ${os.type()}`)
  }
}

function escapeParam (param) {
  var os = require('os')
  switch (os.type()) {
    case 'Linux':
    case 'Dawin':
      // Escape " -> \" and \ -> \\
      return `"${param.replace(/[\\"]/g, '\\$&')}"`
    case 'Windows_NT':
      // No escaping in windows until somebody files an issue to do otherwise
      return param
    default:
      throw new Error(`Unexpected OS-type ${os.type()}`)
  }
}
