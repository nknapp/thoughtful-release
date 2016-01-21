# Locked branches

Locked branches prevent you from committing to a given branch directly. The [ghooks](https://npmjs.com/package/ghooks)-package is a good way to
configure this feature. It registers itself as dispatcher for all possible hooks on `install`
and allows you to configure hook-scripts in the `package.json`. `Thoughtful` can be used as hook-script to forbid committing to certain
branches.

## Configuring a git pre-commit hook

* At first, switch to a new branch and install that modules

```bash
npm install --save-dev ghooks
npm install --save-dev thoughtful-release
```

After installing the modules, setup your `package.json`

```json
{
  "name": "my-package",
  "version": "0.0.0",
  "devDependencies": {
    "ghooks": "^1.0.1",
    "thoughtful-release": "*"
  },
  "config": {
    "ghooks": {
      "pre-commit": "thoughtful precommit"
    }
  }
}

```


Then try to commit directly to the `master`. You will receive an error message.
But we still need to commit the changes we just made to the project. There are two ways now.

* You can create a new branch and merge it afterwards: 
```bash
git checkout -b git-hooks
git commit package.json -m "Added pre-commit-hook for locked branches"
git checkout master
git merge git-hooks
```

* You can also tell `Thoughtful` to ignore the locked branches:

```
THOUGHTFUL_LOCKED_BRANCHES=false git commit package.json -m "Added pre-commit-hook for locked branches
```

## Configuring locked branches

You can also configure other branchs to be forbidden. For example if you want `master` not to be locked, but instead forbid
commits to `lockedBranch1` and `lockedBranch2`, you can add the following snippet to your package.json:

```json
{
  "name": "example",
  "version": "0.0.1",
  "thoughtful": {
    "lockedBranches": [ "lockedBranch1", "lockedBranch2" ]
  }
}
```


If you really really need to commit to a locked branch, you can set the environment variable `THOUGHTFUL_LOCKED_BRANCHES=false`.


