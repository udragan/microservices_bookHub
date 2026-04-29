#!/bin/bash

#Set-Location -Path $PSScriptRoot
cd "$(dirname "$(realpath "$0")")"
echo "$PWD"

podman compose -p bookhub-dev -f docker-compose-dev-storage.yml --env-file ../.env.dev up --build -d

#Read-Host -Prompt "Press Enter to exit"
