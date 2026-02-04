# Finalize Phase V Azure Deployment
# Run this script after AKS cluster is created

$ErrorActionPreference = "Stop"

$aksName = "todo-app-aks-prod"
$acrName = "todoappacr1770071982"
$resourceGroup = "todo-app-production-rg"
$keyVault = "todo-app-kv-1770071807"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase V Deployment Finalization" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Configure kubectl
Write-Host "[1/4] Configuring kubectl access..." -ForegroundColor Yellow
& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' aks get-credentials `
    --resource-group $resourceGroup `
    --name $aksName `
    --overwrite-existing

Write-Host "✅ kubectl configured" -ForegroundColor Green
Write-Host ""

# Step 2: Verify cluster
Write-Host "[2/4] Verifying AKS cluster..." -ForegroundColor Yellow
kubectl get nodes
Write-Host "✅ Cluster verified" -ForegroundColor Green
Write-Host ""

# Step 3: Attach ACR to AKS
Write-Host "[3/4] Integrating ACR with AKS..." -ForegroundColor Yellow
& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' aks update `
    --resource-group $resourceGroup `
    --name $aksName `
    --attach-acr $acrName

Write-Host "✅ ACR integrated" -ForegroundColor Green
Write-Host ""

# Step 4: Grant AKS access to Key Vault
Write-Host "[4/4] Granting AKS access to Key Vault..." -ForegroundColor Yellow
$aksIdentity = & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' aks show `
    --resource-group $resourceGroup `
    --name $aksName `
    --query identityProfile.kubeletidentity.objectId `
    --output tsv

& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' role assignment create `
    --role "Key Vault Secrets User" `
    --assignee $aksIdentity `
    --scope "/subscriptions/c234e4f0-b567-4119-9ac6-a64d7eb52173/resourceGroups/$resourceGroup/providers/Microsoft.KeyVault/vaults/$keyVault"

Write-Host "✅ Key Vault access granted" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Finalized!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Install Dapr: dapr init --kubernetes --wait" -ForegroundColor Cyan
Write-Host "2. Deploy application via Helm" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cluster Endpoint:" -ForegroundColor Yellow
kubectl config view --minify --output json | ConvertFrom-Json | Select-Object -ExpandProperty clusters | Select-Object -ExpandProperty cluster | Select-Object -ExpandProperty server
Write-Host ""
