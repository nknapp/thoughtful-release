# thoughtful-release

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
* **QA git hooks**: (not yet implemented) Mechanism to register a pre-commit and a pre-push hook so to
    avoid working on the master branch and to ensure the code-style of the project
* **Git workflow**: (not yet implemented) Tools for creating a new branch and cleaning up the history before merging to master
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

    changelog [options] <release>  update the CHANGELOG.md of the module in the current directory
    precommit                      Perform precommit-checks (locked branches...). Return non-zero exit-code if something is wrong

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -V, --version  output the version number
```

#### Updating the changelog

`thoughtful changelog` will generate a changelog from the git-history of the project,
summarizing changes since the last release-tag (one line per commit). It uses 
[this gist by @ErisDS](https://gist.github.com/ErisDS/23fcb4d2047829ec80f4)
as inspiration. A clean git-history is a prerequisite for generating a changelog like this.
I think the rules for the [Ghost git-workflow rules](https://github.com/TryGhost/Ghost/wiki/Git-workflow)
are well suited for this purpose.
In particular the following parts should be followed when using `thoughtful` to generate a changelog:

* "Always work on a branch" and never submit to `master` directly.
* [Clean up the git history](https://github.com/TryGhost/Ghost/wiki/Git-workflow#clean-up-history) 
  before merging to master so that on feature or bugfix finally consists of a single commit.
* Follow a specific [format for commit messages], most importantly the commit summary on the first line
  (the first line is what `thoughtful` uses for the changelog).

Release tags are annotated tags that match of the form `v*` (like `v1.3.0` or `v1.5.0.beta-1`).

If no file `CHANGELOG.md` exists in your project, the command will create one from a template. 
Be sure not to modify the placeholder `<a name="current-release"></a>` in the file, since this 
is the point where new releases are inserted.

The section-header for the current changelog-entry will be the next version, determined by the `release`-parameter.
The paramater can be a version bump (`major`, `minor`, `patch`,...) or a valid semver-number. Possible values
are the same as the values for the [npm version](https://docs.npmjs.com/cli/version)-command.

#### Thoughtful pre-commit hooks

The command `thoughtful precommit` will execute precommit hooks. You can register this command (manually) 
as pre-commit-hook for your repository by adding a file `.git/hooks/pre-commit` to your project with 
the following contents

```bash
#!/bin/sh

exec thoughtful precommit
```

Execute-permissions must be set for this file.

The command will do the following tasks:

* Reject commits to the locked branches. If nothing is configured in the `package.json`, then the 
  `master`-branch is a locked branch. In the following example, `master` is not locked, but `lockedBranch1`
  and `lockedBranch2` is locked instead.

```json
{
  "name": "example",
  "version": "0.0.1",
  "thoughtful": {
    "lockedBranches": [ "lockedBranch1", "lockedBranch2" ]
  }
}
```


* Execute custom pre-commit hooks (not yet implemented). In the future, `thoughtful precommit` will additionally
  execute the `pre-commit` script defined in the `package.json`. This can be used to enforce coding-styles
  (I use [standard](https://npmjs.com/package/standard)) and/or unit tests.


##  API-reference

<a name="Thoughtful"></a>
### Thoughtful
**Kind**: global class  

* [Thoughtful](#Thoughtful)
  * [new Thoughtful(cwd)](#new_Thoughtful_new)
  * [.updateChangelog(release)](#Thoughtful+updateChangelog) ⇒ <code>Promise.&lt;?&gt;</code>
  * [.rejectLockedBranches()](#Thoughtful+rejectLockedBranches) ⇒ <code>Promise.&lt;boolean&gt;</code>
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
`$.thoughtful.lockedBranches`

**Kind**: instance method of <code>[Thoughtful](#Thoughtful)</code>  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true, if the branch is not locked.  
**Throw**: <code>Error</code> if the branch is locked  
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