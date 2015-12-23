/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

var cp = require('child_process')
var fs = require('fs')
var qfs = require('q-io/fs')
var path = require('path')

module.exports = function (dir) {
  return {
    isRepo: () => {
      return qfs.stat(path.join(dir, '.git')).then(function(stat) {
        // .git directory must be a directory
        return stat.isDirectory();
      }).catch((error) => {
        if (error.code === 'ENOENT') {
          // Not .git directory
          return false;
        }
      })
    }
  }

}
