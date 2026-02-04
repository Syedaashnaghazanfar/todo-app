#!/bin/bash
# Azure CLI Setup and Deployment Helper
# Makes it easy to use Azure CLI on Windows

# Azure CLI path
AZ_CLI="/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd"

# Function to run Azure CLI commands
az() {
    "$AZ_CLI" "$@"
}

# Export the function
export -f az

echo "✅ Azure CLI helper loaded!"
echo ""
echo "You can now use 'az' command directly:"
echo "  az account show"
echo "  az group list"
echo "  az login"
echo ""
echo "Your current subscription:"
az account show --query "{Name:name, ID:id, State:state}" --output table
echo ""
echo "Available regions (showing top 10):"
az account list-locations --query "[?metadata.regionType=='Physical'].{Name:name, DisplayName:displayName}" --output table | head -11
