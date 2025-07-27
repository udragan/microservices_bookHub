Set-Location -Path $PSScriptRoot

docker compose -p bookhub-dev -f docker-compose-dev-storage.yml --env-file .env.dev up --build -d

Read-Host -Prompt "Press Enter to exit"
