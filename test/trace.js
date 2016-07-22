/**
 * A shortcut for loding `trace` only with compatible versions (i.e. node 6)
 */

'use strict'

if (process.version.match(/v6/)) {
  require('trace')
}
