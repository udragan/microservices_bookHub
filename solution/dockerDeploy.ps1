Set-Location -Path $PSScriptRoot

docker compose -p bookhub -f docker-compose.yml up --build -d

Read-Host -Prompt "Press Enter to exit"
