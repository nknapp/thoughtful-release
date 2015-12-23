/*!
 * thoughtful-release <https://github.com/nknapp/thoughtful-release>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

var fs = require('fs')

if (!fs.statSync('package.json').isFile()) {
  throw new Error('package.json be a file in the current directory')
}

if (!fs.statSync('.git').isDirectory()) {
  throw new Error('.git be a sub-directory of the current directory')
}

var changelog = fs.readFileSync('CHANGELOG.md')
