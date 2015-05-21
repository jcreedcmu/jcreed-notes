# verbose
set -x

# stop, rm all existing docker containers
PROCS=$(docker ps -a -q)
if [ -n "$PROCS" ]; then
    docker stop $PROCS
    docker rm $PROCS
fi
docker build -t jcreed/node-app .

# remove all dangling images
IMGS=$(docker images -q --filter "dangling=true")
if [ -n "$IMGS" ]; then
    docker rmi $IMGS
fi

# Run the app
docker run -p=80:80 -e "PORT=80" -e "DATADIR=/var/data" \
       -v /home/ubuntu/data:/var/data:ro \
       --name jcreed-notes jcreed/node-app > docker.out &
