thoughtful(1) -- releases with Thought

SYNOPSIS
--------

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

A tool to support maintenance tasks in small npm-modules.

DESCRIPTION
-----------

`thoughtful` automates certain tasks that recur during the development of applications:

* Changelog generation
* Git-Workflow to keep the history clean

COMMANDS
--------

### `thoughtful changelog [options]`

Update the file CHANGELOG.md in the current directory. The contents of the changelog is derived from the git-history of the project.
One line of changelog is generated for each commit.

* In order for the changelog to make sense, the git-history should be kept clean.
* The first line for the commit-message is used as changelog-entry.
* Each release must be tagged with an annotated tag that matches the pattern `v*` (like `v1.3.0` or `v1.5.0.beta-1`).
* The command will create an initial file CHANGELOG.md, if none exists yet.
* The changelog-file needs placeholder `<a name="current-release"></a>` at the place where the new release should be inserted.

See [the git-workflow](https://github.com/nknapp/thoughtful-release/blob/v1.0.0/docs/git-workflow.md) for details about the proposed workflow. 
An example for the generated changelog can be seen in [the changelog-file of this module](https://github.com/nknapp/thoughtful-release/blob/v1.0.0/CHANGELOG.md)

* `-r <release>`, `--release <release>`: This optional parameter is the version number that should be inserted for the updated part of the changelog.
     It must either be a valid semver-identifier or one of `major`, `minor`, `patch`, `premajor`, `preminor`, `prepatch`.
     The semantics are the same as in the `npm version` command (see https://docs.npmjs.com/cli/version). If the parameter is omitted, 
     the current version of the `package.json` will be inserted. This is useful for running the command as `version`-script with along `npm version`
* `-a`, `--add-to-git`: Stages the generated changelog to the git-repository. As `version`-script, this will modify the changelog in the 
    same commit as the version bump.
* `-o`, `--open-editor`: Opens the modified changelog in an editor before staging it to the git repository. This allows the user to make corrections
    prior to committing.
    
This command is usable as `version script`:
    
```json
{
  "name": "my-package",
  "version": "0.0.0",
  "devDependencies": {
    "thoughtful-release": "*"
  },
  "scripts": {
    "version": "thoughtful changelog -o -a"
  }
}

```


This command uses [this gist by @ErisDS](https://gist.github.com/ErisDS/23fcb4d2047829ec80f4) as inspiration.

### `thoughtful precommit`

This command executes checks that are meant to be used as git pre-commit hooks. Currently, it only checks for locked-branches 
and returns with a non-zero exit-code if the current branch is marked as locked. See [the locked-branches documentation](https://github.com/nknapp/thoughtful-release/blob/v1.0.0/docs/locked-branches.md)
for details about how to configure locked-branches. If no configuration can be found, the default is to only prevent commits to the
master branch.

### `thoughtful sequence-editor`

This command is not meant to be executed directly. Instead, it is used as git sequence-editor by the `cleanup-history`-command
when squashing a whole branch into a single commit. While an interactive rebase usually uses an editor to let the user decide which 
commits to pick, squash, edit..., this "editor" just selects "pick" on the first commit and "squash" on the rest. It return with a
non-zero exit-code if called on any file other than "git-rebase-todo"

###  `thoughtful clean-history [target-branch]`

This command performs a history clean-up that should be done prior to merging a feature branch into the master.

It will determine the fork-point of your branch calling `git merge-base HEAD master`. It will run an interactive rebase 
upon this commit using `thoughtful sequence-editor` as editor for the `rebase-todo-list`.`thoughtful sequence-editor` 
will edit the todo-list automatically, keeping the first commit as `pick` and all other commits as `squash`.
After doing that, it will rebase the current branch onto the master branch and ask the user to resolve any conflicts 
The occur in the rebase.

* [target-branch]: This option provides the name of the branch to rebase upon. Default: `master`

The implementation `clean-history` command mostly came from 
[the Ghost wiki](https://github.com/TryGhost/Ghost/wiki/Git-workflow#clean-up-history)

SEE ALSO
--------
Homepage: https://github.com/nknapp/thoughtful-release

REPORTING BUGS
--------------
Issues: https://github.com/nknapp/thoughtful-release/issues 


