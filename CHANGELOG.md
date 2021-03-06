# Release-Notes

<a name="current-release"></a>
# Version 1.0.0 (Sun, 24 Feb 2019 12:59:54 GMT)

Docs:
* [d97db3b](https://github.com/nknapp/thoughtful-release/commit/d97db3b) docs: document THOUGHTFUL_CHANGELOG_EDITOR variable - Nils Knappmeier

Refactor
* [f5b0f34](https://github.com/nknapp/thoughtful-release/commit/f5b0f34) refactor: rename q-child-process to promised-child-process - Nils Knappmeier
* [2f19859](https://github.com/nknapp/thoughtful-release/commit/2f19859) refactor: replace Q by native promises - Nils Knappmeier
* [b531bf2](https://github.com/nknapp/thoughtful-release/commit/b531bf2) refactor: use fs-extra instead of m-io - Nils Knappmeier

Test/Chore: 
* [78bf866](https://github.com/nknapp/thoughtful-release/commit/78bf866) test: run travis with Node 8... - Nils Knappmeier
* [e1c6d31](https://github.com/nknapp/thoughtful-release/commit/e1c6d31) test: remove loud-rejection, activate trace and clarify - Nils Knappmeier
* [9de3805](https://github.com/nknapp/thoughtful-release/commit/9de3805) test: ignore "difficult to test" code in coverage - Nils Knappmeier
* [40bd2f7](https://github.com/nknapp/thoughtful-release/commit/40bd2f7) chore: various chore, drop support for pre-LTS node - Nils Knappmeier
* [c4f077a](https://github.com/nknapp/thoughtful-release/commit/c4f077a) chore: Update copyright notice - Nils Knappmeier
* [5736162](https://github.com/nknapp/thoughtful-release/commit/5736162) chore(package): update dependencies - greenkeeper[bot]
* [9107402](https://github.com/nknapp/thoughtful-release/commit/9107402) chore: use "eslint-env mocha" where needed - Nils Knappmeier

Breaking changes:
* Drop support for pre-LTS node. In the future, only LTS and active versions of NodeJS will be supported

# Version 0.3.1 (Tue, 20 Dec 2016 09:10:33 GMT)

* [d5ba1d9](https://github.com/nknapp/thoughtful-release/commit/d5ba1d9) Apply code style, fix node versions in TravisCI setup - Nils Knappmeier
* [4d5f0ae](https://github.com/nknapp/thoughtful-release/commit/4d5f0ae) Use "m-io/fs" instead of "q-io/fs" - Nils Knappmeier
* [81fe9a6](https://github.com/nknapp/thoughtful-release/commit/81fe9a6) Closes #3: Not Working on Windows - Nils Knappmeier


# Version 0.3.0 (Sun, 07 Feb 2016 00:06:51 GMT)

* [8a165ec](https://github.com/nknapp/thoughtful-release/commit/8a165ec) Let TravisCI install standard via pretest script. Use standard@5 - Nils Knappmeier
* [625339b](https://github.com/nknapp/thoughtful-release/commit/625339b) Generate changelog on version bumps with "thoughtful" - Nils Knappmeier
* [ecc0eec](https://github.com/nknapp/thoughtful-release/commit/ecc0eec) Ability to update changelog during version bump. - Nils Knappmeier



# Version 0.2.3 (Thu, 28 Jan 2016 23:51:08 GMT)

* [2eafc06](https://github.com/nknapp/thoughtful-release/commit/2eafc06) Minor documenation typos fixed - Nils Knappmeier
* [700b2bc](https://github.com/nknapp/thoughtful-release/commit/700b2bc) Add tests and istanbul hints to extend test coverage - Nils Knappmeier
* [5c205fb](https://github.com/nknapp/thoughtful-release/commit/5c205fb) Show commit editor when cleaning single-commit branches - Nils Knappmeier
* [ce025fc](https://github.com/nknapp/thoughtful-release/commit/ce025fc) This time real: Link from README to substack's presentation - Nils Knappmeier



# Version 0.2.2 (Wed, 27 Jan 2016 19:08:36 GMT)

* [339c898](https://github.com/nknapp/thoughtful-release/commit/339c898) Link from README to substack's presentation - Nils Knappmeier

# Version 0.2.1 (Tue, 26 Jan 2016 19:51:15 GMT)

* [3571898](https://github.com/nknapp/thoughtful-release/commit/3571898) Remove io.js builds in travis - Nils Knappmeier
* [e25d21f](https://github.com/nknapp/thoughtful-release/commit/e25d21f) Support for git 1.8 (no "rebase --forkpoint") - Nils Knappmeier
* [2541d57](https://github.com/nknapp/thoughtful-release/commit/2541d57) Add "thought run -a" as pre-commit hook - Nils Knappmeier
* [da92856](https://github.com/nknapp/thoughtful-release/commit/da92856) Correct link to cli reference - Nils Knappmeier



# Version 0.2.0 (Fri, 22 Jan 2016 23:28:03 GMT)

* [5471354](https://github.com/nknapp/thoughtful-release/commit/5471354) Update jsdoc for q-child-process file - Nils Knappmeier
* [61d952a](https://github.com/nknapp/thoughtful-release/commit/61d952a) Update documentation - Nils Knappmeier
* [0488679](https://github.com/nknapp/thoughtful-release/commit/0488679) Added command "cleanup-history" - Nils Knappmeier
* [40ccc22](https://github.com/nknapp/thoughtful-release/commit/40ccc22) Fix travis configuration for coverage tests - Nils Knappmeier
* [11e16cb](https://github.com/nknapp/thoughtful-release/commit/11e16cb) [Breaking change] Locked branches are now disabled via THOUGHTFUL_LOCKED_BRANCHES=false - Nils Knappmeier
* [bc763df](https://github.com/nknapp/thoughtful-release/commit/bc763df) Add "files"-property to package.json - Nils Knappmeier
* [49461f8](https://github.com/nknapp/thoughtful-release/commit/49461f8) Remove sinon.js from devDependencies - Nils Knappmeier
* [74f0e87](https://github.com/nknapp/thoughtful-release/commit/74f0e87) Replace lodash-dependency by per method builds - Nils Knappmeier
* [fb33874](https://github.com/nknapp/thoughtful-release/commit/fb33874) Use 'Date.prototype.toUTCString()' to format dates for changelogs - Nils Knappmeier
* [63cda43](https://github.com/nknapp/thoughtful-release/commit/63cda43) Dev: Run git pre-commit hook with "ghooks" - Nils Knappmeier


# Version 0.1.0 (2016-01-04)

* [c19a23e](https://github.com/nknapp/thoughtful-release/commit/c19a23e) Added command 'precommit' to execute check for locked branches (breaking change) - Nils Knappmeier



# Version 0.0.3 (2016-01-02)

* [c7489f2](https://github.com/nknapp/thoughtful-release/commit/c7489f2) [Fix] Documentation typos - Nils Knappmeier



# Version 0.0.2 (2016-01-02)

* [bba6da6](https://github.com/nknapp/thoughtful-release/commit/bba6da6) Meaningful output after "thoughtful changelog" - Nils Knappmeier
* [e3edb2e](https://github.com/nknapp/thoughtful-release/commit/e3edb2e) Throw error if release-spec is invalid (e.g. "bugfix" is invalid, "patch" must be used instead) - Nils Knappmeier
* [6063a2d](https://github.com/nknapp/thoughtful-release/commit/6063a2d) Fix exception in 'updateChangelog' - Nils Knappmeier
* [e3371d1](https://github.com/nknapp/thoughtful-release/commit/e3371d1) Test-Cases: Clear THOUGHTFUL_GIT_CMD after each test - Nils Knappmeier
* [4488111](https://github.com/nknapp/thoughtful-release/commit/4488111) [Add] Add method 'run' to 'Git'-object as shortcut to run git in the working-dir - Nils Knappmeier
* [cc1947a](https://github.com/nknapp/thoughtful-release/commit/cc1947a) [Fix] Call to "git" must inherit environment from parent process - Nils Knappmeier
* [6f70f04](https://github.com/nknapp/thoughtful-release/commit/6f70f04) [Fix] Correct use of `commander` for parsing CLI options - Nils Knappmeier
* [3b9e8ce](https://github.com/nknapp/thoughtful-release/commit/3b9e8ce) Documentation update for current features - Nils Knappmeier
* [a7cec86](https://github.com/nknapp/thoughtful-release/commit/a7cec86) [Thought] Added scripts to run thought on version-bumps - Nils Knappmeier
* [53fdd75](https://github.com/nknapp/thoughtful-release/commit/53fdd75) [Fix] Make "thoughtful.js" executable and add it as "bin" in package.json - Nils Knappmeier



# Version 0.0.1 (2015-12-31)

* Initial release
