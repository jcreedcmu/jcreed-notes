#!/bin/bash

# Usage:
# ./workstation-deploy.sh -i ~/.keys/keyfile.pem user@1.2.3.4
# put credentials and remote ip in args
ssh $@ "cd jcreed-notes && git pull && sudo ./deploy.sh"
