Set-Location -Path $PSScriptRoot

docker compose -p bookhub-debug -f docker-compose.debug.yml up --build -d

Read-Host -Prompt "Press Enter to exit"
