#!/usr/bin/env bash
# ==============================================================================
# 🩺 Apex Bank - Multi-Tier SRE Health & Observability Audit Script
# ==============================================================================
set -euo pipefail

echo "================================================================="
echo "🩺 [SRE Telemetry] Apex Bank Multi-Tier Health & Liveness Audit"
echo "================================================================="

# 1. Check Docker Containers
echo "🐳 Checking Docker Containers Status..."
if command -v docker &> /dev/null && docker info &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "apex-|NAMES" || echo "No active apex containers found."
else
    echo "⚠️ Docker daemon is not active or not installed."
fi
echo ""

# 2. Check Kubernetes Pods & Services
echo "☸️ Checking Kubernetes Status in namespace 'apexbank'..."
if command -v kubectl &> /dev/null; then
    if kubectl get namespace apexbank &> /dev/null; then
        kubectl get pods -n apexbank -o wide
        echo ""
        kubectl get svc -n apexbank
    else
        echo "ℹ️ Kubernetes namespace 'apexbank' is not currently active."
    fi
else
    echo "ℹ️ kubectl CLI not found."
fi
echo ""

# 3. Probe Endpoints
echo "🌐 Probing Application Endpoints..."

check_endpoint() {
    local name="$1"
    local url="$2"
    local expected="$3"
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$url" 2>/dev/null || true)
    if [ -z "$status" ] || [ "$status" = "000" ]; then
        echo "  ✖ [DOWN/UNREACHABLE] $name ($url) -> Connection Refused (000)"
    elif [ "$status" = "$expected" ]; then
        echo "  ✔ [HEALTHY] $name ($url) -> HTTP $status"
    else
        echo "  ⚠️ [UNEXPECTED STATUS] $name ($url) -> HTTP $status (Expected $expected)"
    fi
}

check_redis() {
    local host="${REDIS_HOST:-localhost}"
    local port="${REDIS_PORT:-6379}"
    if command -v redis-cli &> /dev/null; then
        if redis-cli -h "$host" -p "$port" ping 2>/dev/null | grep -q "PONG"; then
            echo "  ✔ [HEALTHY] Redis In-Memory Cache ($host:$port) -> PONG"
            return
        fi
    fi
    # Fallback TCP socket probe
    if nc -z -w 1 "$host" "$port" 2>/dev/null; then
        echo "  ✔ [HEALTHY] Redis In-Memory Cache ($host:$port) -> TCP Socket Open"
    else
        echo "  ✖ [DOWN/UNREACHABLE] Redis In-Memory Cache ($host:$port) -> Offline"
    fi
}

check_endpoint "Frontend Web Client (Port 3000)" "http://localhost:3000" "200"
check_endpoint "Backend API Health Probe (Port 5001)" "http://localhost:5001/api/health" "200"
check_endpoint "Backend Host Probe (Port 5000)" "http://localhost:5000/api/health" "200"
check_redis
check_endpoint "Mongo-Express GUI (Port 8081)" "http://localhost:8081" "200"
check_endpoint "Ollama AI Assistant (Port 11434)" "http://localhost:11434/api/tags" "200"

echo ""
echo "================================================================="
echo "✅ SRE Telemetry Audit Complete!"
echo "================================================================="
