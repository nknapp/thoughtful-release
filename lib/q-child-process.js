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
    cp.execFile(cmd, args, options, (err, output) => {
      if (err) {
        return defer.reject(err)
      }
      return defer.resolve(output)
    })
    return defer.promise
  }
}
