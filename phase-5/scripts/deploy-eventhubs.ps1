# Deploy Azure Event Hubs for Todo App
$ErrorActionPreference = "Stop"

# Generate unique namespace name
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$namespace = "todo-app-eventhubs-$timestamp"
$resourceGroup = "todo-app-production-rg"
$location = "eastus"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Deploying Azure Event Hubs Infrastructure" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Create Event Hubs Namespace
Write-Host "[1/3] Creating Event Hubs namespace: $namespace" -ForegroundColor Yellow
& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' eventhubs namespace create `
    --name $namespace `
    --resource-group $resourceGroup `
    --location $location `
    --sku Standard `
    --capacity 2 `
    --enable-kafka true `
    --tags Environment=production Project=TodoApp-Phase5

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create Event Hubs namespace" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Event Hubs namespace created" -ForegroundColor Green
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

Write-Host "[2/3] Creating Event Hubs (topics)..." -ForegroundColor Yellow
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
}

Write-Host "✅ All 6 Event Hubs created" -ForegroundColor Green
Write-Host ""

# Get connection string
Write-Host "[3/3] Retrieving connection information..." -ForegroundColor Yellow
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
}

$outputs | ConvertTo-Json | Out-File -FilePath "eventhubs-outputs.json"

Write-Host "================================================" -ForegroundColor Green
Write-Host "Event Hubs Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Event Hubs Namespace: " -NoNewline
Write-Host $namespace -ForegroundColor Cyan
Write-Host "Kafka Endpoint:       " -NoNewline
Write-Host $endpoint -ForegroundColor Cyan
Write-Host ""
Write-Host "Output saved to: eventhubs-outputs.json" -ForegroundColor Yellow
Write-Host ""
