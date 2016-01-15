var cp = require('child_process')
var Q = require('q')

/**
 * Promise-Based functions from child_process
 */
module.exports = {
  /**
   * Execute a child-process and return a promise
   * @param cmd
   * @param args
   * @param options
   * @returns {*}
     */
  execFile: function (cmd, args, options) {
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
  },

  spawn: function (cmd, args, options) {
    var defer = Q.defer()
    var child = cp.spawn(cmd, args, options)
    child.on('exit', function (code) {
      if (code === 0) {
        defer.resolve()
      } else {
        defer.reject()
      }
    })
    return defer.promise
  }
}
