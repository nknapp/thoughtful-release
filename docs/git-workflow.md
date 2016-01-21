# Git workflow

The command `thoughtful clean-history` supports you in the following workflow using git.

* Create a new branch for each feature (never commit to `master` directly)
* Commit into the branch quickly and often
* Share the branch with others for discussion
* When done, condense the whole branch into a single commit
* Rebase this commit on top of master
* Merge into master (or create a pull-request)

## Motivation

I've noticed myself to be a very quick committer. I commit early and often and I tend to push small changes to `master` very quickly, 
sometimes to quickly. Rebasing the shared `master` is off-limits, since it causes problems for whoever has cloned your repository, 
so the history quickly becomes filled with rubbish commits. This may not seem critical at the first glance. But if you think of it:

The git-history is a documentation of your projects evolution. In two years, you may wonder why you inserted this line of code. Then,
you can ask your git-log and everything is fine. But if every try-and-error of your development process is part of the final history,
you will end up researching a lot more to find the real purpose of the code. In large projects with a lot of contributors it is crucial to
have a clean history. But even if you are working on your own, you will be thankful for this. Projects like [ghost](https://npmjs.com/package/ghost) have 
contribution guidelines to formalize this.

I decided that I wanted to treat my own packages similar to the Ghost-guidelines. I wrote `Thoughtful` to watch over me
and help me with recurring tasks like updating the changelog.

## Create a new branch for each feature 

If you are working on the master branch, it is very easy to accidently push to the main repo (e.g. on Github), especially if you are
using an IDE that offers you to push just after a commit. The best way to avoid this problem is to always create a feature-branch
when changeing code (no matter how large the change is). You can work on it, commit as much as you like, share it for discussion.
It won't matter how many commits are there in the end; you can clean it up later.

The best way to enforce this workflow in a project are git-hooks. I use a pre-commit hook that forbids me to commit to the `master`-branch.
Pre-push would be ok, too. But I think, if you are not allowed to push to `origin/master` you can just as well forbid committing to `master`.

See [locked-branches](locked-branches.md) for details about how to configure `thoughtful precommit` as pre-commit hook in your project.

## Commit into the branch quickly and often

Now that you are always working on a branch, you can commit as much as you want. 
What you are doing won't be visible in the maste branch later on.

## Share the branch with others for discussion

You can also push your feature-branch to github and create pull-requests to discuss your changes with your team-members or
with the project maintainers.

## When done, condense the whole branch into a single commit

Once you are finished and everyone is satisfied with the code, you have to clean up. With `Thoughtful` you can do this by calling

```bash
thoughtful clean-history
```

(see [the cli-reference](../man/thoughtful.md) for details about the `clean-history` command)

# Rebase this commit on top of master

This step is also performed by `thoughtful clean-history`

# Merge into master (or create a pull-request)

Finally, you can merge the single-commit branch into the master (or whatever branch you like).
Since it has just been rebased, all the merge should be a fast-forward. The pre-commit hook will
not be called when you do a fast-forward, so no problems should occur here.

# tl;dr

After setting up [ghooks](https://npmjs.com/package/ghooks) and `thoughtful-release` in your dependencies and registering `thoughtful precommit` as 
pre-commit hook in your package, you can do the following:

```bash
git checkout -b feature/myfeature
# Do some coding 
git commit -a 
# Do some more coding 
git commit -a
# Condense changes and rebase onto master
thoughtful cleanup-history
# Merge single commit into master
git checkout master
git merge feature/myfeature
```







