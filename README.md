# thoughtful-release

> Create high quality releases with less work

People like **substack** encourage you to divide 
the functionality of large monolithic modules into reasonable parts and publish each of those as module on 
there own. That's what I did when I separated [swagger-to-html](https://npmjs.com/package/swagger-to-html) into [bootprint](https://npmjs.com/package/bootprint) and three
template modules and then extracted multiple modules (i.e. the `customize-`family) from `bootprint`, so that
it was easy to implement [thought](https://npmjs.com/package/thought) on this basis as well. 

The problem is, that now there are 10 modules to maintain instead of just one. The overhead for releasing new 
versions is about the same for each packages. This module is a toolkit to make the following tasks easier, thus
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

    changelog <release>  update the CHANGELOG.md of the module in the current directory
    help [cmd]           display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    <release>      The target release of the changelog (same as for "npm version")
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
The paramater can be a version bump (`major`, `minor`, `bugfix`,...) or a valid semver-number. Possible values
are the same as the values for the [npm version](https://docs.npmjs.com/cli/version)-command.


##  API-reference

<a name="updateChangelog"></a>
### updateChangelog(cwd, release) ⇒ <code>\*</code>
Update the CHANGELOG.md of the module in the given working directory.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cwd | <code>string</code> | the current working directory of the module |
| release | <code>string</code> | the release specification (as in `npm version`) |




## License

`thoughtful-release` is published under the MIT-license. 
See [LICENSE.md](LICENSE.md) for details.

## Release-Notes
 
For release notes, see [CHANGELOG.md](CHANGELOG.md)
 
## Contributing guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md).