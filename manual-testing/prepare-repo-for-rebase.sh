#!/usr/bin/env bash


# Show the difference between 
#   rebasing on master 
# and 
#   squashing on the fork-point and then rebasing on master

# Go here
cd "$(readlink -f "$(dirname "$0")")"

# Create and go to the testing-ground
rm -rf tmp
mkdir -p tmp
cd tmp

git init
echo initial content > file1.txt
echo initial content> file2.txt
git add file1.txt file2.txt && git commit -a -m "Initial checkin" || exit 1

git branch branch1 

echo changed in master > file1.txt 
echo changed in master > file2.txt 
git add file1.txt file2.txt
git commit -a -m "changed in master" || exit 1

git checkout branch1
echo changed in branch1 > file1.txt && git add file1.txt && git commit -a -m "changed in branch1" || exit 1
echo changed again in branch1 > file1.txt && git add file1.txt && git commit -a -m "changed again in branch1" || exit 1
echo changed in branch1 > file2.txt && git add file2.txt && git commit -a -m "changed file2 in branch1" || exit 1
echo changed again in branch1 > file2.txt && git add file2.txt && git commit -a -m "changed file2 again in branch1" || exit 1


## No try 
# git rebase -i master

## Then execut the script again and try 
# git rebase -i "$( git merge-base HEAD master)"
# git rebase master 
