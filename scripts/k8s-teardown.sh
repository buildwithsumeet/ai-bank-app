#!/usr/bin/env bash
# ==============================================================================
# ☸️ Apex Bank - Kubernetes Teardown & Purge Runbook
# ==============================================================================
set -euo pipefail

CLUSTER_NAME="apex-cluster"
NAMESPACE="apexbank"

echo "🛑 [DevOps] Initiating Kubernetes Teardown for '${CLUSTER_NAME}'..."

if kubectl get namespace "${NAMESPACE}" &> /dev/null; then
    echo "🗑️ Deleting all workloads in namespace '${NAMESPACE}'..."
    kubectl delete -f k8s/ -n "${NAMESPACE}" --ignore-not-found=true || true
    kubectl delete namespace "${NAMESPACE}" --ignore-not-found=true || true
fi

echo "🧹 Deleting Kind cluster '${CLUSTER_NAME}'..."
kind delete cluster --name "${CLUSTER_NAME}" || true

echo "✅ Teardown complete. Environment cleaned up!"
