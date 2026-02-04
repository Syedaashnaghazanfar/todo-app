Write-Host "Creating AKS cluster with default Kubernetes version (10-15 minutes)..." -ForegroundColor Yellow
Write-Host ""

& 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' aks create `
    --resource-group todo-app-production-rg `
    --name todo-app-aks-prod `
    --location eastus `
    --node-count 3 `
    --node-vm-size Standard_DS2_v2 `
    --enable-managed-identity `
    --generate-ssh-keys `
    --network-plugin azure `
    --tags Environment=production Project=TodoApp-Phase5

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "AKS cluster created successfully!" -ForegroundColor Green

    # Get the version that was installed
    $version = & 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd' aks show `
        --resource-group todo-app-production-rg `
        --name todo-app-aks-prod `
        --query currentKubernetesVersion `
        --output tsv
    Write-Host "Kubernetes Version: $version" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "AKS cluster creation failed" -ForegroundColor Red
}
