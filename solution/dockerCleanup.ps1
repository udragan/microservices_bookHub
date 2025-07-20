Set-Location -Path $PSScriptRoot

# stop app containers
docker compose -p bookhub -f docker-compose.yml down 
docker compose -p bookhub-debug -f docker-compose.debug.yml down

# remove app images
$Prefix = "bookhub"
$images = docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | Where-Object {
    $_.Split(" ")[0] -like "$Prefix*"
}

if ($images) {
    foreach ($line in $images) {
        $imageId = $line.Split(" ")[1]
        Write-Host "\tRemoving image ID: $imageId"
        docker rmi $imageId
    }
    Write-Host "All matching images removed."
} else {
    Write-Host "No images found starting with '$Prefix'"
}

Read-Host -Prompt "Press Enter to exit"
