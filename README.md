# thoughtful-release 

[![NPM version](https://badge.fury.io/js/thoughtful-release.svg)](http://badge.fury.io/js/thoughtful-release)
[![Build Status](https://travis-ci.org/nknapp/thoughtful-release.svg)](https://travis-ci.org/nknapp/thoughtful-release)
[![Coverage Status](https://img.shields.io/coveralls/nknapp/thoughtful-release.svg)](https://coveralls.io/r/nknapp/thoughtful-release)

> Create high quality releases with less work

People like **substack** encourage you to divide 
the functionality of large monolithic modules into reasonable parts and publish each of those as module on 
there own. That's what I did when I separated [swagger-to-html](https://npmjs.com/package/swagger-to-html) into [bootprint](https://npmjs.com/package/bootprint) and three
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

Calling `thoughtful --help` will print a command-line reference:

```
Usage: thoughtful [options] [command]


  Commands:

    changelog [options]              update the CHANGELOG.md of the module in the current directory.
    precommit                        Perform precommit-checks (locked branches...). Return non-zero exit-code if something is wrong
    sequence-editor <filename>       "Editor" for the rebase todos (replacing "pick" with "squash") with no interaction
    cleanup-history [target-branch]  Rebase the current branch onto another branch, condensing the whole branch into a single commit.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

Please refer to the [man/thoughtful.md](command line reference) of this project for 
details about the commands. 

#### Supporting the git workflow

You can enforce the above workflow using git-hooks and `Thoughtful`. Have a look at 
[the git-workflow](docs/git-workflow.md)-document.

##  API-reference

<a name="Thoughtful"></a>
### Thoughtful
**Kind**: global class  

* [Thoughtful](#Thoughtful)
  * [new Thoughtful(cwd)](#new_Thoughtful_new)
  * [.updateChangelog(release)](#Thoughtful+updateChangelog) ⇒ <code>Promise.&lt;?&gt;</code>
  * [.rejectLockedBranches()](#Thoughtful+rejectLockedBranches) ⇒ <code>Promise.&lt;boolean&gt;</code>
  * [.sequenceEditor(filename)](#Thoughtful+sequenceEditor)
  * [.cleanupHistory(options)](#Thoughtful+cleanupHistory)
  * [.reset()](#Thoughtful+reset)

<a name="new_Thoughtful_new"></a>
#### new Thoughtful(cwd)
Return a new Thoughtful instance


| Param | Type | Description |
| --- | --- | --- |
| cwd | <code>string</code> | the working directory of that instance |

<a name="Thoughtful+updateChangelog"></a>
#### thoughtful.updateChangelog(release) ⇒ <code>Promise.&lt;?&gt;</code>
Update the CHANGELOG.md of the module in the given working directory.

**Kind**: instance method of <code>[Thoughtful](#Thoughtful)</code>  
**Returns**: <code>Promise.&lt;?&gt;</code> - a promise for finishing writing the changelog  

| Param | Type | Description |
| --- | --- | --- |
| release | <code>string</code> | the release specification (as in `npm version`) |

<a name="Thoughtful+rejectLockedBranches"></a>
#### thoughtful.rejectLockedBranches() ⇒ <code>Promise.&lt;boolean&gt;</code>
Throw an exception if the current branch is listed in `package.json` under
`$.thoughtful.lockedBranches`.

The branch check can be disabled by setting the environment variable
`THOUGHTFUL_LOCKED_BRANCHES=false`

**Kind**: instance method of <code>[Thoughtful](#Thoughtful)</code>  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true, if the branch is not locked.  
**Throw**: <code>Error</code> if the branch is locked  
<a name="Thoughtful+sequenceEditor"></a>
#### thoughtful.sequenceEditor(filename)
For use with "git -c sequence.editor=..." when rebasing and squashing feature-branches

Replace "pick" commits in rebase-todo-file by "squash" (except the first).

**Kind**: instance method of <code>[Thoughtful](#Thoughtful)</code>  

| Param | Description |
| --- | --- |
| filename | the name of the file to be edited |

<a name="Thoughtful+cleanupHistory"></a>
#### thoughtful.cleanupHistory(options)
Perform a rebase of the current (topic-)branch onto a target-branch, condensing the
whole branch into a single commit.

**Kind**: instance method of <code>[Thoughtful](#Thoughtful)</code>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | options to this function |
| [options.targetBranch] | <code>string</code> | the branch to rebase the current branch upon (default: master) |
| [options.thoughtful] | <code>string</code> | the command to invoke "thoughtful" (default: process.argv[1]) |

<a name="Thoughtful+reset"></a>
#### thoughtful.reset()
Reset and reload the cached parts of Thoughtful

**Kind**: instance method of <code>[Thoughtful](#Thoughtful)</code>  



## License

`thoughtful-release` is published under the MIT-license. 
See [LICENSE.md](LICENSE.md) for details.

## Release-Notes
 
For release notes, see [CHANGELOG.md](CHANGELOG.md)
 
## Contributing guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md).