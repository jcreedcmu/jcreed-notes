#!/bin/bash

# Usage:
# ./workstation-deploy.sh -i ~/.keys/keyfile.pem user@1.2.3.4

set -x

rm -f public/js/app-prod.js

cd ui
lein with-profile prod cljsbuild once
cd ..

scp -i $1 public/js/app-prod.js $2:jcreed-notes/public/js/app.js
ssh -i $1 $2 "cd jcreed-notes && git pull && sudo ./deploy.sh"
