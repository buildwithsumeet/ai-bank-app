#!/usr/bin/env bash
# ==============================================================================
# ☸️ Apex Bank - Automated Kubernetes (Kind) Cluster Deployment Runbook
# ==============================================================================
set -euo pipefail

CLUSTER_NAME="apex-cluster"
NAMESPACE="apexbank"

echo "================================================================="
echo "🚀 [DevOps] Initiating Apex Bank Kubernetes Deployment Automation"
echo "================================================================="

# 1. Check Kind installation
if ! command -v kind &> /dev/null; then
    echo "❌ Error: 'kind' is not installed. Please install Kind: https://kind.sigs.k8s.io/"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ Error: 'kubectl' is not installed. Please install kubectl: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# 2. Check if cluster already exists
if kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
    echo "✅ Kind multi-node cluster '${CLUSTER_NAME}' already exists."
else
    echo "☸️ Creating 4-node Kind cluster '${CLUSTER_NAME}' using k8s/kind-config.yml..."
    kind create cluster --config k8s/kind-config.yml --name "${CLUSTER_NAME}"
fi

# 3. Create isolated namespace
echo "📦 Ensuring namespace '${NAMESPACE}' exists..."
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

# 4. Load local Docker images into Kind nodes
echo "🐳 Building & loading Docker images into Kind nodes..."
docker build -t buildwithsumeet/apex-bank-backend:latest ./backend
docker build -t buildwithsumeet/apex-bank-frontend:latest ./frontend

kind load docker-image buildwithsumeet/apex-bank-backend:latest --name "${CLUSTER_NAME}"
kind load docker-image buildwithsumeet/apex-bank-frontend:latest --name "${CLUSTER_NAME}"

# 5. Apply Persistent Storage (PV & PVC)
echo "💾 Applying Persistent Volumes & Claims..."
kubectl apply -f k8s/persistentVolume.yml
kubectl apply -f k8s/persistentVolumeClaim.yml

# 6. Apply ConfigMaps and Secrets
echo "🔑 Applying ConfigMaps and Secrets..."
kubectl apply -f k8s/configMap.yml
kubectl apply -f k8s/secret.yaml

# 7. Deploy Databases & In-Memory Cache
echo "⚡ Deploying MongoDB and Redis instances..."
kubectl apply -f k8s/mongo-service.yml
kubectl apply -f k8s/mongo-deployment.yml
kubectl apply -f k8s/redis-service.yml
kubectl apply -f k8s/redis-deployment.yml

# 8. Deploy Local AI Services
echo "🤖 Deploying Ollama AI Engine..."
kubectl apply -f k8s/ollama-service.yml
kubectl apply -f k8s/ollama-deployment.yml

# 9. Deploy Backend & Frontend Microservices
echo "🌐 Deploying Backend API and Frontend Web Client..."
kubectl apply -f k8s/backend-service.yml
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/frontend-service.yml
kubectl apply -f k8s/frontend-deployment.yml

# 10. Wait for Workload Rollouts
echo "⏳ Waiting for pod deployments to achieve Ready state..."
kubectl rollout status deployment/redis-deployment -n "${NAMESPACE}" --timeout=120s
kubectl rollout status deployment/mongo-deployment -n "${NAMESPACE}" --timeout=120s
kubectl rollout status deployment/backend-deployment -n "${NAMESPACE}" --timeout=120s
kubectl rollout status deployment/frontend-deployment -n "${NAMESPACE}" --timeout=120s

echo "================================================================="
echo "🎉 [Success] All Apex Bank Kubernetes Workloads are 1/1 Running!"
echo "================================================================="
kubectl get pods -n "${NAMESPACE}" -o wide
echo ""
kubectl get svc -n "${NAMESPACE}"
echo "================================================================="
