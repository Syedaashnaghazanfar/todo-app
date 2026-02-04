Write-Host 'Getting AKS credentials...' -ForegroundColor Yellow
& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' aks get-credentials `
    --resource-group todo-app-production-rg `
    --name todo-app-aks-prod `
    --overwrite-existing

Write-Host ''
Write-Host 'Verifying cluster access...' -ForegroundColor Yellow
kubectl get nodes
Write-Host ''
Write-Host 'AKS cluster is ready!' -ForegroundColor Green
