# Create Event Hubs (topics) in existing namespace
$ErrorActionPreference = "Stop"

$namespace = "todo-app-eventhubs-1770070048"
$resourceGroup = "todo-app-production-rg"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Creating Event Hubs (Topics)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Create Event Hubs (topics)
$topics = @(
    "task-operations",
    "task-operations-dlq",
    "alerts",
    "alerts-dlq",
    "task-modifications",
    "task-modifications-dlq"
)

Write-Host "Creating 6 Event Hubs in namespace: $namespace" -ForegroundColor Yellow
Write-Host ""

foreach ($topic in $topics) {
    Write-Host "  Creating: $topic" -ForegroundColor Gray
    & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' eventhubs eventhub create `
        --name $topic `
        --namespace-name $namespace `
        --resource-group $resourceGroup `
        --partition-count 12 `
        --retention-time-in-hours 168

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Failed to create Event Hub: $topic" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Created: $topic" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All 6 Event Hubs created successfully" -ForegroundColor Green
Write-Host ""

# Get connection string
Write-Host "Retrieving connection information..." -ForegroundColor Yellow
$connectionString = & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' eventhubs namespace authorization-rule keys list `
    --resource-group $resourceGroup `
    --namespace-name $namespace `
    --name RootManageSharedAccessKey `
    --query primaryConnectionString `
    --output tsv

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to retrieve connection string" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Connection string retrieved" -ForegroundColor Green
Write-Host ""

# Save outputs to file
$endpoint = "$namespace.servicebus.windows.net:9093"
$outputs = @{
    namespace = $namespace
    endpoint = $endpoint
    connectionString = $connectionString
    resourceGroup = $resourceGroup
    location = "eastus"
}

$outputs | ConvertTo-Json | Out-File -FilePath "eventhubs-outputs.json"

Write-Host "================================================" -ForegroundColor Green
Write-Host "Event Hubs Configuration" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Namespace:      " -NoNewline
Write-Host $namespace -ForegroundColor Cyan
Write-Host "Kafka Endpoint: " -NoNewline
Write-Host $endpoint -ForegroundColor Cyan
Write-Host "Topics:         " -NoNewline
Write-Host "6 (task-operations + alerts + task-modifications + 3 DLQs)" -ForegroundColor Cyan
Write-Host "Partitions:     " -NoNewline
Write-Host "12 per topic" -ForegroundColor Cyan
Write-Host "Retention:      " -NoNewline
Write-Host "7 days" -ForegroundColor Cyan
Write-Host ""
Write-Host "Output saved to: eventhubs-outputs.json" -ForegroundColor Yellow
Write-Host ""
