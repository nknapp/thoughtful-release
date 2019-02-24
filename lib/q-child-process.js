var cp = require('child_process')
var debug = require('debug')('thoughtful:q-child-process')
var _ = {
  isArray: require('lodash.isarray')
}

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
  // if the cmd is an array, use the first entry as cmd and insert the rest as argument
  if (_.isArray(cmd)) {
    args = cmd.concat(args)
    args.shift()
    cmd = cmd[0]
  }
  return new Promise((resolve, reject) => {
    cp.execFile(cmd, args, options, (err, stdout, stderr) => {
      if (err) {
        return reject(err)
      }
      return resolve({
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
  })
}

/**
 * Spawn a process and return a promise that is resolved when the process exits with exit-code zero, or rejected
 * on a non-zero exit-code.
 * @param {string|array<string>} cmd the command to execute
 * @param {string[]} args command line arguments for the command
 * @param {object} options options for the {@link child_process#spawn}-method.
 * @returns {*} a promise that is resolved or rejected based on the exit-code of the child-process
 */
function spawn (cmd, args, options) {
  // if the cmd is an array, use the first entry as cmd and insert the rest as argument
  if (_.isArray(cmd)) {
    args = cmd.concat(args)
    args.shift()
    cmd = cmd[0]
  }

  debug('spawn', cmd, args, options)
  return new Promise((resolve, reject) => {
    var child = cp.spawn(cmd, args, options)
    child.on('exit', function (code) {
      if (code === 0) {
        resolve()
        debug('spawn resolved', cmd, args, options)
      } else {
        reject(new Error(`Command "${cmd} ${args && JSON.stringify(args)}" exited with ${code}`))
      }
    })
  })
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
  return spawn('sh', ['-c', command], options)
}

/**
 * Escape parameters for use with the `spawnWithShell`
 **/
function escapeParam (param) {
  // Same on windows and linux, since we are spawning the git-shell
  // Wrap the parameter in quotes and escape '"' and '\' with a backslash to allow shell parameters to be recognized as a unit
  return `"${param.replace(/[\\"]/g, '\\$&')}"`
}
