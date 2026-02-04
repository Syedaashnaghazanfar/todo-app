$topics = @('task-operations-dlq', 'alerts', 'alerts-dlq', 'task-modifications', 'task-modifications-dlq')
foreach ($topic in $topics) {
    Write-Host "Creating: $topic..." -NoNewline
    & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' eventhubs eventhub create --name $topic --namespace-name todo-app-eventhubs-1770070048 --resource-group todo-app-production-rg --partition-count 12 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host ' OK' -ForegroundColor Green
    } else {
        Write-Host ' FAILED' -ForegroundColor Red
    }
}
