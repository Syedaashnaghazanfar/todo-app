# Create Event Hubs topics (simplified)
$namespace = "todo-app-eventhubs-1770070048"
$resourceGroup = "todo-app-production-rg"

$topics = @("task-operations", "task-operations-dlq", "alerts", "alerts-dlq", "task-modifications", "task-modifications-dlq")

Write-Host "Creating 6 Event Hubs..." -ForegroundColor Yellow

foreach ($topic in $topics) {
    Write-Host "  $topic..." -NoNewline
    & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' eventhubs eventhub create --name $topic --namespace-name $namespace --resource-group $resourceGroup --partition-count 12 --message-retention 7 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host " FAILED" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Endpoint: $namespace.servicebus.windows.net:9093" -ForegroundColor Cyan
