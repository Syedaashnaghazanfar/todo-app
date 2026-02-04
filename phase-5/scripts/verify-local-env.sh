#!/bin/bash
# Verify Phase V Local Development Environment
#
# This script performs comprehensive health checks for the local development environment:
# 1. Verifies all pods are running
# 2. Checks Dapr components are configured
# 3. Validates Kafka topics exist
# 4. Tests service endpoints respond
#
# Usage: ./scripts/verify-local-env.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

echo ""
echo "=========================================="
echo "🔍 Phase V Environment Verification"
echo "=========================================="
echo ""

#
# Check 1: Verify kubectl connectivity
#
echo -e "${BLUE}📋 Check 1: Kubernetes Connectivity${NC}"
if kubectl cluster-info &>/dev/null; then
    echo -e "  ${GREEN}✅${NC} kubectl can connect to cluster"
else
    echo -e "  ${RED}❌${NC} kubectl cannot connect to cluster"
    echo "     Make sure Minikube is running: minikube status"
    OVERALL_STATUS=1
fi
echo ""

#
# Check 2: Verify all pods are running
#
echo -e "${BLUE}📋 Check 2: Pod Status${NC}"
echo ""

# Get pod list
PODS=$(kubectl get pods --no-headers 2>/dev/null || echo "")

if [ -z "$PODS" ]; then
    echo -e "  ${RED}❌${NC} No pods found in the cluster"
    echo "     Run './scripts/dev-up.sh' to deploy services"
    OVERALL_STATUS=1
else
    # Check each pod
    TOTAL_PODS=0
    RUNNING_PODS=0
    FAILED_PODS=0

    while IFS= read -r line; do
        POD_NAME=$(echo "$line" | awk '{print $1}')
        POD_STATUS=$(echo "$line" | awk '{print $3}')
        POD_READY=$(echo "$line" | awk '{print $2}')

        TOTAL_PODS=$((TOTAL_PODS + 1))

        if [ "$POD_STATUS" = "Running" ] && echo "$POD_READY" | grep -q "^[1-9]/"; then
            echo -e "  ${GREEN}✅${NC} $POD_NAME: $POD_STATUS ($POD_READY)"
            RUNNING_PODS=$((RUNNING_PODS + 1))
        else
            echo -e "  ${RED}❌${NC} $POD_NAME: $POD_STATUS ($POD_READY)"
            FAILED_PODS=$((FAILED_PODS + 1))
            OVERALL_STATUS=1

            # Show recent logs for failed pods
            echo "     Recent logs:"
            kubectl logs "$POD_NAME" --tail=5 2>&1 | sed 's/^/       /'
        fi
    done <<< "$PODS"

    echo ""
    echo "  Summary: $RUNNING_PODS/$TOTAL_PODS pods running"

    if [ $FAILED_PODS -gt 0 ]; then
        echo -e "  ${YELLOW}⚠️${NC}  $FAILED_PODS pod(s) have issues. Check logs above."
    fi
fi
echo ""

#
# Check 3: Verify Dapr components
#
echo -e "${BLUE}📋 Check 3: Dapr Components${NC}"
echo ""

EXPECTED_COMPONENTS=("pubsub-kafka" "jobs-api" "secretstore" "statestore")
COMPONENTS_FOUND=0

for component in "${EXPECTED_COMPONENTS[@]}"; do
    if kubectl get component "$component" &>/dev/null; then
        echo -e "  ${GREEN}✅${NC} $component component exists"
        COMPONENTS_FOUND=$((COMPONENTS_FOUND + 1))
    else
        echo -e "  ${RED}❌${NC} $component component not found"
        OVERALL_STATUS=1
    fi
done

echo ""
echo "  Summary: $COMPONENTS_FOUND/${#EXPECTED_COMPONENTS[@]} Dapr components configured"
echo ""

#
# Check 4: Verify Kafka topics
#
echo -e "${BLUE}📋 Check 4: Kafka Topics${NC}"
echo ""

# Check if Kafka pod exists
if ! kubectl get pod kafka-0 &>/dev/null; then
    echo -e "  ${RED}❌${NC} Kafka pod (kafka-0) not found"
    echo "     Kafka may not be deployed yet"
    OVERALL_STATUS=1
else
    EXPECTED_TOPICS=("task-operations" "alerts" "task-modifications" "task-operations-dlq" "alerts-dlq" "task-modifications-dlq")
    TOPICS_FOUND=0

    # Get list of topics from Kafka
    TOPICS=$(kubectl exec -it kafka-0 -- kafka-topics.sh --list --bootstrap-server localhost:9092 2>/dev/null | tr -d '\r' || echo "")

    if [ -z "$TOPICS" ]; then
        echo -e "  ${RED}❌${NC} Could not retrieve topic list from Kafka"
        echo "     Kafka may not be ready yet"
        OVERALL_STATUS=1
    else
        for topic in "${EXPECTED_TOPICS[@]}"; do
            if echo "$TOPICS" | grep -q "^$topic$"; then
                echo -e "  ${GREEN}✅${NC} $topic topic exists"
                TOPICS_FOUND=$((TOPICS_FOUND + 1))
            else
                echo -e "  ${RED}❌${NC} $topic topic not found"
                OVERALL_STATUS=1
            fi
        done

        echo ""
        echo "  Summary: $TOPICS_FOUND/${#EXPECTED_TOPICS[@]} topics exist"
    fi
fi
echo ""

#
# Check 5: Verify service endpoints
#
echo -e "${BLUE}📋 Check 5: Service Endpoints${NC}"
echo ""

SERVICES=("frontend" "backend-api")
SERVICES_REACHABLE=0

for service in "${SERVICES[@]}"; do
    if kubectl get svc "$service" &>/dev/null; then
        # Get service port
        PORT=$(kubectl get svc "$service" -o jsonpath='{.spec.ports[0].port}')
        echo -e "  ${GREEN}✅${NC} $service service exists (port $PORT)"
        SERVICES_REACHABLE=$((SERVICES_REACHABLE + 1))

        # Note: We can't directly curl without port-forwarding, so we just check existence
        echo "     To access: kubectl port-forward svc/$service $PORT:$PORT"
    else
        echo -e "  ${RED}❌${NC} $service service not found"
        OVERALL_STATUS=1
    fi
done

echo ""
echo "  Summary: $SERVICES_REACHABLE/${#SERVICES[@]} services exist"
echo ""

#
# Check 6: Verify Dapr system pods
#
echo -e "${BLUE}📋 Check 6: Dapr System${NC}"
echo ""

DAPR_PODS=("dapr-operator" "dapr-sidecar-injector" "dapr-sentry" "dapr-placement-server")
DAPR_RUNNING=0

for pod_name in "${DAPR_PODS[@]}"; do
    if kubectl get pods -n dapr-system -l "app=$pod_name" --no-headers 2>/dev/null | grep -q "Running"; then
        echo -e "  ${GREEN}✅${NC} $pod_name is running"
        DAPR_RUNNING=$((DAPR_RUNNING + 1))
    else
        echo -e "  ${RED}❌${NC} $pod_name is not running"
        OVERALL_STATUS=1
    fi
done

echo ""
echo "  Summary: $DAPR_RUNNING/${#DAPR_PODS[@]} Dapr system components running"
echo ""

#
# Final Summary
#
echo "=========================================="
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Environment Ready!${NC}"
    echo ""
    echo "All checks passed. Your Phase V environment is ready to use."
    echo ""
    echo "Next steps:"
    echo "  1. Port-forward services:"
    echo "     kubectl port-forward svc/frontend 3000:3000"
    echo "     kubectl port-forward svc/backend-api 8000:8000"
    echo ""
    echo "  2. Access the application:"
    echo "     Frontend: http://localhost:3000"
    echo "     Backend API: http://localhost:8000/docs"
else
    echo -e "${RED}❌ Issues Found${NC}"
    echo ""
    echo "Some checks failed. Review the output above for details."
    echo ""
    echo "Common fixes:"
    echo "  - Run './scripts/dev-up.sh' if services aren't deployed"
    echo "  - Check pod logs: kubectl logs <pod-name>"
    echo "  - Restart Minikube: minikube stop && minikube start"
    echo ""
    echo "For more help, see docs/TROUBLESHOOTING.md"
fi
echo "=========================================="
echo ""

exit $OVERALL_STATUS
