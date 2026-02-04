Write-Host 'Granting Key Vault Secrets Officer role...' -ForegroundColor Yellow
$userId = & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' ad signed-in-user show --query id --output tsv
& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' role assignment create `
    --role 'Key Vault Secrets Officer' `
    --assignee $userId `
    --scope '/subscriptions/c234e4f0-b567-4119-9ac6-a64d7eb52173/resourceGroups/todo-app-production-rg/providers/Microsoft.KeyVault/vaults/todo-app-kv-1770071807'

Write-Host 'Permissions granted. Waiting 30 seconds for propagation...' -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Now store the connection string
Write-Host 'Storing Event Hubs connection string...' -ForegroundColor Yellow
$connStr = & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' eventhubs namespace authorization-rule keys list `
    --resource-group todo-app-production-rg `
    --namespace-name todo-app-eventhubs-1770070048 `
    --name RootManageSharedAccessKey `
    --query primaryConnectionString `
    --output tsv

& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' keyvault secret set `
    --vault-name todo-app-kv-1770071807 `
    --name eventhubs-connection-string `
    --value $connStr

Write-Host 'Connection string stored successfully!' -ForegroundColor Green
