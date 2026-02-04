# Create Event Hubs topics
$ErrorActionPreference = "Stop"

$namespace = "todo-app-eventhubs-1770070048"
$resourceGroup = "todo-app-production-rg"

$topics = @(
    "task-operations",
    "task-operations-dlq",
    "alerts",
    "alerts-dlq",
    "task-modifications",
    "task-modifications-dlq"
)

Write-Host "Creating 6 Event Hubs..." -ForegroundColor Yellow

foreach ($topic in $topics) {
    Write-Host "  Creating: $topic" -ForegroundColor Gray
    & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' eventhubs eventhub create --name $topic --namespace-name $namespace --resource-group $resourceGroup --partition-count 12 --retention-time-in-hours 168

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Done: $topic" -ForegroundColor Green
    } else {
        Write-Host "  Failed: $topic" -ForegroundColor Red
    }
}

$endpoint = "$namespace.servicebus.windows.net:9093"
Write-Host ""
Write-Host "Event Hubs Endpoint: $endpoint" -ForegroundColor Cyan
