# thoughtful-release 

[![NPM version](https://img.shields.io/npm/v/thoughtful-release.svg)](https://npmjs.com/package/thoughtful-release)
[![Travis Build Status](https://travis-ci.org/nknapp/thoughtful-release.svg?branch=master)](https://travis-ci.org/nknapp/thoughtful-release)
[![Appveyor Build Status](https://ci.appveyor.com/api/projects/status/github/nknapp/thoughtful-release?svg=true&branch=master)](https://ci.appveyor.com/project/nknapp/thoughtful-release)
[![Coverage Status](https://img.shields.io/coveralls/nknapp/thoughtful-release.svg)](https://coveralls.io/r/nknapp/thoughtful-release)

> Create high quality releases with less work

People like **substack** [encourage you to divide 
the functionality of large monolithic modules into reasonable parts and publish each of those as module on 
there own](https://www.youtube.com/watch?v=DCQNm6yiZh0). That's what I did when I separated [swagger-to-html](https://npmjs.com/package/swagger-to-html) into [bootprint](https://npmjs.com/package/bootprint) and three
template modules and then extracted multiple modules (i.e. the `customize-`family) from `bootprint`, so that
it was easy to implement [thought](https://npmjs.com/package/thought) on this basis as well. 

The problem is, that now there are 10 modules to maintain instead of just one. The overhead for releasing new 
versions is about the same for each package. This module is a toolkit to make the following tasks easier, thus
increasing the package quality and reducing the workload for a release:

* **Generate changelog**: Changelog generation is inspired by the [Ghost git workflow](https://github.com/TryGhost/Ghost/wiki/Git-workflow)
* **QA git hooks**: This can be done using the [ghooks](https://npmjs.com/package/ghooks) package. `Thougthful` has no builtins for that.
* **Git workflow**: Git hooks to prevent commiting to `master` directly. Support for cleaning up the history before merging to master
* **Release workflow**: (not yet implemented) A command to run tests, generate changelog, bump versions and publish to npm,
    similar to the [release-tools](https://npmjs.com/package/release-tools)-package


# Installation

```
npm install -g thoughtful-release
```

### CLI options

# NodeJS compatibility notes

This package will always support the latest version of NodeJS and as well as
the current LTS version. In the future, it will not be considered a breaking
change to drop support of a pre-LTS version of NodeJS.

Calling `thoughtful --help` will print a command-line reference:

```
Usage: thoughtful [options] [command]

Options:
  -V, --version                    output the version number
  -h, --help                       output usage information

Commands:
  changelog [options]              Update the file CHANGELOG.md of the module in the current directory.
  precommit                        Perform precommit-checks (locked branches...). Return non-zero exit-code if something is wrong
  sequence-editor <filename>       "Editor" for the rebase todos (replacing "pick" with "squash") with no interaction
  cleanup-history [target-branch]  Rebase the current branch onto another branch, condensing the whole branch into a single commit.
```

Please refer to the [command line reference](man/thoughtful.md) of this project for 
details about the commands. 

#### Supporting the git workflow

You can enforce the above workflow using git-hooks and `Thoughtful`. Have a look at 
[the git-workflow](docs/git-workflow.md)-document.



# License

`thoughtful-release` is published under the MIT-license.

See [LICENSE.md](LICENSE.md) for details.


# Release-Notes
 
For release notes, see [CHANGELOG.md](CHANGELOG.md)
 
# Contributing guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md).