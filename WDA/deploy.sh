#!/bin/sh

cd $1

mkdir -p deploy/js/control
mkdir -p deploy/js/model
mkdir -p deploy/js/view

#Rename JS file with MD5 hash
find js/control -type f -exec bash -c 'cp $1 "deploy/${1%.*}.$(md5 -q $1).${1##*.}"' bash {} \;
find js/model/ -type f -exec bash -c 'cp $1 "deploy/${1%.*}.$(md5 -q $1).${1##*.}"' bash {} \;
find js/view/ -type f -exec bash -c 'cp $1 "deploy/${1%.*}.$(md5 -q $1).${1##*.}"' bash {} \;

#Replace script in index.html
start=$(grep -n -m 1 "BEGIN REPLACE WITH DEPLOY VERSION" "index.html" | cut -d: -f1)
stop=$(grep -n -m 1 "END REPLACE WITH DEPLOY VERSION" "index.html" | cut -d: -f1)

touch index-deploy.html
head -n "$start" index.html >> index-deploy.html

find deploy/js/model -type f -exec bash -c 'echo "<script src=\"$1\"></script>" >> index-deploy.html' bash {} \;
find deploy/js/control -type f -exec bash -c 'echo "<script src=\"$1\"></script>" >> index-deploy.html' bash {} \;
find deploy/js/view -type f -exec bash -c 'echo "<script src=\"$1\"></script>" >> index-deploy.html' bash {} \;

tail -n +"$stop" index.html >> index-deploy.html

#Replace script in history.html
start=$(grep -n -m 1 "BEGIN REPLACE WITH DEPLOY VERSION" "history.html" | cut -d: -f1)
stop=$(grep -n -m 1 "END REPLACE WITH DEPLOY VERSION" "history.html" | cut -d: -f1)

touch history-deploy.html
head -n "$start" history.html >> history-deploy.html

find deploy/js/model -type f -exec bash -c 'echo "<script src=\"$1\"></script>" >> history-deploy.html' bash {} \;
find deploy/js/control -type f -exec bash -c 'echo "<script src=\"$1\"></script>" >> history-deploy.html' bash {} \;
find deploy/js/view -type f -exec bash -c 'echo "<script src=\"$1\"></script>" >> history-deploy.html' bash {} \;

tail -n +"$stop" history.html >> history-deploy.html

#Replace script in compare.html
start=$(grep -n -m 1 "BEGIN REPLACE WITH DEPLOY VERSION" "compare.html" | cut -d: -f1)
stop=$(grep -n -m 1 "END REPLACE WITH DEPLOY VERSION" "compare.html" | cut -d: -f1)

touch compare-deploy.html
head -n "$start" compare.html >> compare-deploy.html

find deploy/js/model -type f -exec bash -c 'echo "<script src=\"$1\"></script>" >> compare-deploy.html' bash {} \;
find deploy/js/control -type f -exec bash -c 'echo "<script src=\"$1\"></script>" >> compare-deploy.html' bash {} \;
find deploy/js/view -type f -exec bash -c 'echo "<script src=\"$1\"></script>" >> compare-deploy.html' bash {} \;

tail -n +"$stop" compare.html >> compare-deploy.html