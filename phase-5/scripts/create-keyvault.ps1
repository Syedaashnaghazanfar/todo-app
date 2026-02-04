$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$keyVault = "todo-app-kv-$timestamp"
Write-Host "Creating Key Vault: $keyVault" -ForegroundColor Yellow

& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' keyvault create `
    --name $keyVault `
    --resource-group todo-app-production-rg `
    --location eastus `
    --sku standard

if ($LASTEXITCODE -eq 0) {
    Write-Host "Key Vault created successfully!" -ForegroundColor Green
    $keyVault | Out-File -FilePath 'D:\code\OpenAI_SDK_Agents\13_orchestration\todo-app\phase-5\scripts\keyvault-name.txt' -NoNewline

    # Store Event Hubs connection string
    Write-Host "Storing Event Hubs connection string in Key Vault..." -ForegroundColor Yellow
    $connStr = & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' eventhubs namespace authorization-rule keys list `
        --resource-group todo-app-production-rg `
        --namespace-name todo-app-eventhubs-1770070048 `
        --name RootManageSharedAccessKey `
        --query primaryConnectionString `
        --output tsv

    & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' keyvault secret set `
        --vault-name $keyVault `
        --name eventhubs-connection-string `
        --value $connStr

    Write-Host "Connection string stored in Key Vault" -ForegroundColor Green
    Write-Host "Key Vault Name: $keyVault" -ForegroundColor Cyan
} else {
    Write-Host "Failed to create Key Vault" -ForegroundColor Red
}
