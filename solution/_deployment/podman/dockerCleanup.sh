#!/bin/bash

cd "$(dirname "$(realpath "$0")")"

# stop app containers
podman compose -p bookhub -f docker-compose.yml --env-file ../.env down 
podman compose -p bookhub-dev -f docker-compose-dev-storage.yml --env-file ../.env.dev down

podman compose -p bookhub-debug -f docker-compose.yml -f docker-compose-debug.yml --env-file ../.env down 

# Remove app images
PREFIX="bookhub"

# Get the list of images, filter by prefix, and extract the IDs
# We use awk to print the second column (the ID)
IMAGES=$(podman images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep "^$PREFIX" | awk '{print $2}' | tr -d '\r')

if [ -n "$IMAGES" ]; then
    # Use a loop to iterate through each image ID
    echo "$IMAGES" | while read -r imageId; do
        if [ -n "$imageId" ]; then
            echo "	Removing image ID: $imageId"
            podman rmi "$imageId"
        fi
    done
    echo "All matching images removed."
else
    echo "No images found starting with '$PREFIX'"
fi

