$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$acrName = "todoappacr$timestamp"
Write-Host "Creating Azure Container Registry: $acrName" -ForegroundColor Yellow
& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' acr create --resource-group todo-app-production-rg --name $acrName --sku Standard --location eastus
$acrName | Out-File -FilePath 'D:\code\OpenAI_SDK_Agents\13_orchestration\todo-app\phase-5\scripts\acr-name.txt' -NoNewline
Write-Host "ACR Name: $acrName" -ForegroundColor Cyan
