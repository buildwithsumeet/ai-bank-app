# 🏦 Apex Bank (`ai-bank-app`) — Full-Stack MERN Digital Banking & AI Assistant Platform

[![Build Status](https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?logo=github-actions)](.github/workflows/ci-cd.yml)
[![Jenkins](https://img.shields.io/badge/Jenkins-Declarative_CI%2FCD-D33833?logo=jenkins&logoColor=white)](Jenkinsfile)
[![Trivy](https://img.shields.io/badge/Trivy-Security_Vulnerability_Scan-1904DA?logo=aqua)](Jenkinsfile)
[![Node.js](https://img.shields.io/badge/Node.js-v20-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB?logo=react)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-RTK-764ABC?logo=redux)](https://redux-toolkit.js.org/)
[![Redis](https://img.shields.io/badge/Redis-v7.0_Cache-DC382D?logo=redis)](https://redis.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-K8s_v1.30+-326CE5?logo=kubernetes&logoColor=white)](k8s/)
[![Kind](https://img.shields.io/badge/Kind-Multi--Node_Cluster-326CE5?logo=kubernetes&logoColor=white)](k8s/kind-config.yml)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-FF6B6B?logo=ollama)](https://ollama.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-grade, cloud-native Digital Banking Platform built with the **MERN** stack (MongoDB, Express.js, React 18, Node.js) featuring **Redux Toolkit (RTK)** state management, **Redis 7.0 In-Memory Caching** with automatic cache invalidation and token blacklisting, multi-stage **MongoDB Aggregation Pipelines** (`$facet`, `$group`, `$lookup`), an enterprise **Dual-Token Authentication (15-min Access + 7-day Refresh Token)** architecture with silent rotation, an automated **Jenkins Declarative CI/CD Pipeline** with **Trivy Vulnerability Scanning** & Docker Hub automated image publishing, an on-premise **Ollama AI Banking Assistant** (< 155 MB footprint), real-time database auto-seeding with visual progress tracking, atomic balance concurrency, interactive 16-digit virtual debit cards, and an enterprise **Kubernetes (K8s 4-Node Cluster) & DevOps / SRE** architecture.

---

## 📑 Table of Contents
1. [🏛️ Enterprise Application & Infrastructure Architecture](#️-system-architecture)
2. [✨ Key Application Features](#-key-application-features)
3. [🤖 Ollama AI Banking Chatbot (< 155 MB)](#-ollama-ai-banking-chatbot--155-mb)
4. [🌱 Database Seeding & Live Progress](#-database-seeding--live-progress)
5. [🔑 Environment Variables (.env) Full Specification](#-environment-variables-env-full-specification)
6. [🚀 Quickstart & Docker Orchestration](#-quickstart--docker-orchestration)
7. [☸️ Cloud-Native Kubernetes (K8s) Orchestration](#️-cloud-native-kubernetes-k8s-orchestration)
8. [⚡ Redis In-Memory Caching & Token Blacklist Architecture](#-redis-in-memory-caching--token-blacklist-architecture)
9. [📊 MongoDB Aggregation Pipelines (Financial Analytics)](#-mongodb-aggregation-pipelines-financial-analytics)
10. [🔐 Dual-Token Authentication (Access + Refresh Token)](#-dual-token-authentication-access--refresh-token)
11. [⚛️ Redux Toolkit (RTK) Centralized Frontend Store](#-redux-toolkit-rtk-centralized-frontend-store)
12. [🏗️ Jenkins Declarative CI/CD Pipeline (Trivy + Docker Hub)](#️-jenkins-declarative-cicd-pipeline-trivy--docker-hub)
13. [💻 Manual Local Development (Without Docker)](#-manual-local-development-without-docker)
14. [🧪 Pre-Seeded Test Credentials](#-pre-seeded-test-credentials)
15. [📖 Complete REST API Specification](#-complete-rest-api-specification)
16. [🛠️ DevOps & SRE Master Guide](#️-devops--sre-master-guide-what-devops-engineers-need)
    - [Container Topology & Microservices](#1-container-topology--microservices)
    - [macOS Port 5000 Collision Resolution](#2-macos-port-5000-collision-resolution)
    - [Health Checks & Liveness Probes](#3-health-checks--liveness-probes)
    - [CI/CD Pipeline (GitHub Actions & Jenkins)](#4-cicd-pipeline-github-actions)
    - [Production Deployment Strategies (Docker Compose & Kubernetes)](#5-production-deployment-strategies)
    - [Database Backup & Disaster Recovery](#6-database-backup--disaster-recovery)
    - [Monitoring, Logging & Observability](#7-monitoring-logging--observability)
    - [Security Hardening & SRE Checklist](#8-security-hardening--sre-checklist)
    - [On-Call Troubleshooting Runbook](#9-on-call-troubleshooting-runbook)

---

## 🏛️ Enterprise Application & Infrastructure Architecture

Apex Bank is engineered as a zero-trust, cloud-native microservices platform combining client-side reactive state, high-performance in-memory caching, atomic ledger databases, local offline AI, and automated DevSecOps pipelines:

```mermaid
graph TB
    subgraph Clients["🌐 Client & Edge Access Layer"]
        UserBrowser["👤 User Browser / Mobile Client\n(HTTPS / Port 3000 / NodePort 30000)"]
        DevOpsUser["👨‍💻 DevOps / Database Admin\n(HTTP / Port 8081)"]
    end

    subgraph WebTier["🎨 Frontend Web Tier (Container: apex-bank-frontend)"]
        Nginx["Nginx Web Server\n(Port 80 / Reverse Proxy)"]
        subgraph ReactApp["React 18 Single Page Application"]
            SPA["React UI Components & Dashboards"]
            RTK["⚛️ Redux Toolkit Central Store\n(authSlice, accountSlice, transactionSlice, uiSlice)"]
            Interceptor["🔄 Silent 401 Token Refresh Interceptor"]
        end
    end

    subgraph APITier["⚡ API & Middleware Tier (Container: apex-bank-backend)"]
        Express["Express.js REST API Engine\n(Port 5000 / Host Port 5001 / NodePort 32000)"]
        Security["🛡️ Security Middleware\n(Helmet, CORS, Rate-Limiting: 200 req/15m)"]
        AuthGuard["🔐 Dual-Token Auth Guard\n(15-min Access Token + Redis Blacklist Check)"]
        CacheHook["🔄 Cache Invalidation Engine\n(Purges on Deposit / Withdraw / Transfer)"]
    end

    subgraph CacheTier["⚡ In-Memory Caching & Session Tier (Container: apex-bank-redis)"]
        Redis[("Redis 7.0 In-Memory Engine\n(Port 6379 / Cache-Aside)")]
        RedisKeys["• user:profile:* (TTL: 10m)\n• user:accounts:* (TTL: 10m)\n• analytics:* (TTL: 15m)\n• admin:metrics (TTL: 5m)\n• blacklist:token:* (15m)\n• refresh:token:* (7d)"]
    end

    subgraph DBTier["💾 Primary Database Tier (Container: apex-bank-mongodb)"]
        MongoDB[("MongoDB 7.0 Enterprise Cluster\n(Port 27017 / Database: 'bankdb')")]
        AggPipeline["📊 Multi-Stage Aggregation Pipelines\n• $facet Financial Analytics\n• $lookup User-Account Relational Joins\n• Atomic ACID Concurrency ($inc, $gte)"]
        MongoVol[("Persistent Volume: mongo_data\n(HostPath /data/mongo - 5Gi)")]
    end

    subgraph AITier["🤖 Local AI Assistant Tier (Container: apex-bank-ollama)"]
        Ollama[("Ollama Local LLM Container\n(Port 11434 / Alpine ~70MB)")]
        ModelCache["🧠 smollm:135m Model Cache (~85MB)\n(Persistent Volume: ollama_data)"]
        AutoPuller["Ollama Puller (One-time cURL initialization)"]
    end

    subgraph AdminTier["🛠️ Database Visualizer Tier (Container: apex-bank-mongo-express)"]
        MongoExpress["Mongo-Express Interactive GUI\n(Port 8081)"]
    end

    subgraph CICDTier["🏗️ DevSecOps & Orchestration Tier"]
        Jenkins["🏗️ Jenkins Declarative Pipeline\n(Clean Slate ➔ Unit Tests ➔ Docker Build ➔ Trivy Scan ➔ Docker Hub)"]
        K8s["☸️ Kubernetes 4-Node Kind Cluster\n(1 Control-Plane + 3 Worker Nodes / apexbank Namespace)"]
    end

    %% Network flows
    UserBrowser -->|HTTP Port 3000| Nginx
    Nginx -->|Static Assets| SPA
    SPA <--> RTK
    RTK <--> Interceptor
    Nginx -->|/api/* Reverse Proxy| Express
    Express --> Security
    Security --> AuthGuard

    AuthGuard <-->|Sub-millisecond Token Blacklist & Active Refresh Check| Redis
    Express <-->|Sub-millisecond Cache-Aside Reads & Mutation Invalidations| Redis
    Redis --- RedisKeys

    Express -->|Aggregations & Atomic Transactions / Port 27017| MongoDB
    MongoDB --- AggPipeline
    MongoDB --- MongoVol

    Express -->|Financial Prompts REST / Port 11434| Ollama
    Ollama --- ModelCache
    AutoPuller -->|One-time boot pull| Ollama

    DevOpsUser -->|Port 8081| MongoExpress
    MongoExpress -->|Admin TCP 27017| MongoDB

    Jenkins -.->|Automated Builds & Scans| WebTier
    Jenkins -.->|Automated Builds & Scans| APITier
    K8s -.->|Orchestrates Pods & PVCs| WebTier
    K8s -.->|Orchestrates Pods & PVCs| APITier
    K8s -.->|Orchestrates Pods & PVCs| CacheTier
    K8s -.->|Orchestrates Pods & PVCs| DBTier
    K8s -.->|Orchestrates Pods & PVCs| AITier
```

### 📋 Full Infrastructure Port & Protocol Matrix

| Service Component | Container Name | Base Image | Internal Port | Host / NodePort | Protocol | Role & Storage Mount |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Web Client** | `apex-bank-frontend` | `nginx:alpine` | `80` | `3000` / `30000` | HTTP | Nginx reverse proxy + React 18 SPA + Redux store |
| **Backend API Engine** | `apex-bank-backend` | `node:20-alpine` | `5000` | `5001` / `32000` | HTTP | Express.js REST API, Dual-Token JWT, Aggregations |
| **Redis Cache & Session** | `apex-bank-redis` | `redis:7-alpine` | `6379` | `6379` | TCP / Redis | Sub-ms cache-aside, token blacklist, `redis_data` volume |
| **MongoDB Database** | `apex-bank-mongodb` | `mongo:7.0` | `27017` | `27017` | TCP / Mongo | Persistent ACID banking ledger, `mongo_data` volume |
| **Ollama AI Engine** | `apex-bank-ollama` | `alpine/ollama` | `11434` | `11434` | HTTP / REST | Local offline banking LLM (`smollm:135m`), `ollama_data` volume |
| **Ollama Auto-Puller** | `apex-bank-ollama-puller` | `curlimages/curl`| N/A | N/A | CLI / Script | Auto-downloads lightweight model into Ollama on startup |
| **Mongo-Express GUI** | `apex-bank-mongo-express`| `mongo-express` | `8081` | `8081` | HTTP | Interactive Web GUI database inspection visualizer |
| **Jenkins CI/CD** | Host / Container | `jenkins/jenkins` | `8080` | `8080` | HTTP | Automated Clean Slate, Unit Tests, Trivy Scan, Docker Hub push |
| **Kind K8s Cluster** | `apex-cluster` | `kindest/node` | Dynamic | `30000`/`32000` | TCP / Kubelet | 4-node cluster (1 control-plane + 3 workers, `apexbank` namespace) |

---

## ✨ Key Application Features

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- **JSON Web Tokens (JWT)**: Secure signed authentication tokens with 30-day lifecycle.
- **Bcrypt Password Security**: Passwords hashed with salted 10-round bcrypt before saving. Passwords are permanently excluded from database queries (`select: false`).
- **User Roles**: Distinct permissions for `customer` and `admin` roles with protected route middleware.

### 2. 💳 Smart Account & Virtual Card Management
- **Automated Account Provisioning**: Generates unique, non-colliding 10-digit account numbers upon registration.
- **Dynamic 16-Digit Virtual Debit Card**: Issued per account with cardholder name, expiry date, 3-digit CVV, and interactive 3D flip-to-reveal security state.
- **Multi-Account Vaults**: Supports multiple accounts per client (`Checking`, `Savings`, `Investment`).
- **One-Click Account Copy**: Instant clipboard copy button for swift transaction sharing.

### 3. ⚡ High-Integrity Financial Transactions
- **Atomic Balance Concurrency**: Money transfers, deposits, and withdrawals utilize atomic MongoDB conditional operators (`$inc`, `$gte`) to eliminate race conditions, double-spending, and negative balances during simultaneous operations.
- **Instant Beneficiary Verification**: Real-time account number lookup (`/api/accounts/lookup/:accNo`) validates the receiver's name before funds leave the account.
- **Preset Amount Chips**: Quick-select chips ($50, $100, $500, $1,000, $5,000) with projected new balance preview.
- **Immutable Transaction Ledger**: Searchable, filterable audit trail with unique transaction reference numbers (e.g. `TRF-849102-B8E1`, `DEP-391029-A7C3`) and modal receipt view.

### 4. 📊 Real-Time Financial Analytics
- Aggregated cashflow tracking (Monthly Inflow vs Outflow breakdown).
- Dynamic Net Period Savings calculation.
- Expense breakdown by category meters (`Transfer`, `Shopping`, `Utilities`, `Salary`, `Investment`).

### 5. 👑 Administrator Central
- Global bank-wide liquidity and total holdings tracker.
- System transaction volume and active customer counters.
- Client account controls: 1-click **Freeze / Unfreeze** capabilities with real-time status synchronization.
- Global immutable ledger tracking every transaction across all bank accounts.

---

## 🤖 Ollama AI Banking Chatbot (< 155 MB)

Apex Bank features an embedded, on-premise private AI Assistant accessible via the **`🤖 Chat Banking AI`** floating widget in the lower-right corner.

### 🎯 Key Highlights:
1. **Ultra-Lightweight Footprint (< 155 MB total)**:
   - Built on minimal **`alpine/ollama:latest`** (~70 MB image vs the official 2.85 GB image).
   - Pairs with the ultra-efficient **`smollm:135m`** model (~85 MB) or **`qwen2.5:0.5b`**.
   - Solves the problem of giant 3GB+ AI containers, running smoothly on low-spec hardware or free-tier cloud instances.
2. **Dual-Engine Architecture (Zero-Downtime Fallback)**:
   - **Engine A (Instant Native Financial Intelligence)**: Automatically parses user intents and queries live MongoDB user data instantly. Works 100% of the time, even when Ollama is starting up or pulling models.
   - **Engine B (Ollama Local LLM Container)**: Handles conversational synthesis, contextual questions, and budgeting advice directly on-premise with zero third-party API keys or external data leaks.
3. **Multilingual NLP (Hindi / Hinglish / English)**:
   - Full conversational understanding in conversational Hindi, Hinglish, and English.
4. **Rich Interactive UI Payloads**:
   - Returns interactive account vault cards, debit card widgets, and transaction pills directly inside the chat stream.

### 💬 Sample Queries You Can Try:
| Query Language | Example Prompt | AI Action / Response |
| :--- | :--- | :--- |
| **Hindi / Hinglish** | *"Mera account details dikhao"* | Renders active checking & savings accounts, balances, and account numbers. |
| **Hinglish** | *"Check balance"* or *"Mera kitna balance hai?"* | Displays total balance across all accounts with instant breakdown. |
| **Hindi / Hinglish** | *"Mera debit card number kya hai?"* | Fetches 16-digit debit card number, CVV, expiry date, and card status. |
| **English / Hinglish**| *"Last 5 transactions dikhao"* | Lists recent transactions with dates, categories, and inflow/outflow status. |
| **Financial Query** | *"Kya main 50,000 ka laptop khareed sakta hu?"* | Analyzes liquid balance and returns a safe purchasing recommendation. |
| **Budget Advice** | *"How can I save more money?"* | Provides categorized spending analysis and targeted saving tips. |

---

## 🌱 Database Seeding & Live Progress

Apex Bank includes an automated, resilient database seeding mechanism:

1. **Automatic Startup Seeding**: On backend boot, `db.js` verifies if users exist in MongoDB. If the database is empty, it runs the seed routine automatically.
2. **Real-Time Step-by-Step Terminal Progress**:
   ```text
   [🌱 DB Seed Progress: 5%] Connecting to MongoDB...
   [🌱 DB Seed Progress: 20%] Clearing legacy collections...
   [🌱 DB Seed Progress: 40%] Hashing passwords & provisioning users...
   [🌱 DB Seed Progress: 65%] Generating bank accounts & 16-digit cards...
   [🌱 DB Seed Progress: 85%] Generating historical financial transactions...
   [🌱 DB Seed Progress: 100%] Database successfully seeded with 4 users and 12 transactions!
   ```
3. **1-Click Web UI Reset**: Click the **"🌱 Seed / Reset User Database"** button on the Login page. It triggers the seed sequence with a live visual animated progress bar in the browser.
4. **Programmatic REST API Endpoint**:
   ```bash
   curl -X POST http://localhost:5001/api/auth/seed
   ```

---

## 🔑 Environment Variables (.env) Full Specification

The application is fully configurable via environment variables.

### 📋 Environment Variables Reference Table

| Variable Name | Default / Local Dev Value | Docker Compose Value | Production Value | Description & DevOps Guidance |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` | `production` | `production` | Node runtime mode. When `production`, Morgan dev logs are disabled and stack traces are suppressed. |
| `PORT` | `5000` | `5000` | `5000` | Internal port where Express API server listens inside the container. |
| `BACKEND_PORT` | `5001` | `5001` | `5001` | Host port mapped to backend API (`5001:5000`) to prevent macOS AirPlay port 5000 conflict. |
| `MONGO_USERNAME` | `admin` | `admin` | Custom Vault Secret | Root username for MongoDB authentication. |
| `MONGO_PASSWORD` | `adminpassword123` | `adminpassword123` | Strong Random Password | Root password for MongoDB authentication. |
| `MONGO_INITDB_DATABASE` | `bankdb` | `bankdb` | `bankdb` | Default database name initialized on container startup. |
| `MONGO_PORT` | `27017` | `27017` | `27017` | Port for MongoDB service. |
| `MONGO_URI` | `mongodb://admin:adminpassword123@localhost:27017/bankdb?authSource=admin` | `mongodb://admin:adminpassword123@mongo:27017/bankdb?authSource=admin` | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/bankdb?retryWrites=true&w=majority` | Connection URI for MongoDB with authentication credentials. |
| `JWT_SECRET` | Cryptographically random string | `supersecret_apex_bank_jwt_key_2026_super_secure` | Cryptographically random string (min 64 chars) | Cryptographic key used to sign and verify JSON Web Tokens. Must be protected and injected via secrets manager in production. |
| `OLLAMA_HOST` | `http://localhost:11434` | `http://ollama:11434` | `http://ollama:11434` (or private VPC endpoint) | Host address of Ollama inference engine. In Docker, points to internal service `ollama`. |
| `OLLAMA_MODEL` | `qwen2.5:0.5b` | `smollm:135m` | `smollm:135m` or `qwen2.5:0.5b` | LLM model name. `smollm:135m` is recommended for minimal memory (< 155 MB), `qwen2.5:0.5b` for deeper conversational answers. |
| `OLLAMA_PORT` | `11434` | `11434` | `11434` | Host port for Ollama AI engine container. |
| `FRONTEND_PORT` | `3000` | `3000` | `80` / `443` | Host port for Frontend Web UI. |
| `VITE_API_URL` | `http://localhost:5000` | *(handled via Nginx reverse proxy)* | `https://api.yourbank.com` | Base API target URL for frontend Vite development server proxy. |
| `MONGO_EXPRESS_PORT` | `8081` | `8081` | *(disabled or secured)* | Host port for Mongo-Express web database visualizer. |
| `ME_CONFIG_MONGODB_ADMINUSERNAME` | `admin` | `admin` | Custom Admin User | Admin username used by Mongo-Express to connect to MongoDB. |
| `ME_CONFIG_MONGODB_ADMINPASSWORD` | `adminpassword123` | `adminpassword123` | Custom Admin Password | Admin password used by Mongo-Express to connect to MongoDB. |

---

### 📄 `.env` File Templates

#### Backend Configuration (`backend/.env`):
```dotenv
# ==============================================================================
# APEX BANK BACKEND ENVIRONMENT CONFIGURATION (backend/.env)
# ==============================================================================

# Application Environment Mode
NODE_ENV=development

# Internal Application Port
PORT=5000

# MongoDB Credentials & Connection String
MONGO_USERNAME=admin
MONGO_PASSWORD=adminpassword123
MONGO_URI=mongodb://admin:adminpassword123@localhost:27017/bankdb?authSource=admin

# JWT Cryptographic Signing Secret
JWT_SECRET=A86niIMTaa5VO3aA6xAWiKGWZJE1bTihzkeYD7sWXym

# Local Ollama AI Engine Endpoint
OLLAMA_HOST=http://localhost:11434

# Lightweight LLM Model Identifier (smollm:135m or qwen2.5:0.5b)
OLLAMA_MODEL=qwen2.5:0.5b
```

#### Frontend Configuration (`frontend/.env.example`):
```dotenv
# ==============================================================================
# APEX BANK FRONTEND ENVIRONMENT CONFIGURATION (Vite Dev Server)
# ==============================================================================

# Target Backend URL for Vite Proxy
VITE_API_URL=http://localhost:5000
```

#### Root Docker Configuration (`.env` / `.env.example`):
```dotenv
# ==============================================================================
# DOCKER COMPOSE ORCHESTRATION ENVIRONMENT DEFAULTS (.env / .env.example)
# ==============================================================================

# 1. Database Configuration (MongoDB)
MONGO_USERNAME=admin
MONGO_PASSWORD=adminpassword123
MONGO_INITDB_DATABASE=bankdb
MONGO_PORT=27017

# 2. Backend API Configuration
NODE_ENV=production
PORT=5000
BACKEND_PORT=5001
MONGO_URI=mongodb://admin:adminpassword123@mongo:27017/bankdb?authSource=admin
JWT_SECRET=supersecret_apex_bank_jwt_key_2026_super_secure

# 3. AI / Ollama Configuration
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=smollm:135m
OLLAMA_PORT=11434

# 4. Frontend Configuration
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:5000

# 5. Mongo-Express Database Viewer Configuration
MONGO_EXPRESS_PORT=8081
ME_CONFIG_MONGODB_SERVER=mongo
ME_CONFIG_MONGODB_PORT=27017
ME_CONFIG_MONGODB_ADMINUSERNAME=admin
ME_CONFIG_MONGODB_ADMINPASSWORD=adminpassword123
ME_CONFIG_BASICAUTH=false
```

> [!WARNING]
> **Security Reminder**: Never commit production `.env` files with real secrets to public version control. Ensure `.env` is listed in `.gitignore` and inject secrets using environment variables or secret vaults in your CI/CD pipelines.

---

## 🚀 Quickstart & Docker Orchestration

The entire 5-tier architecture runs with a single command:

```bash
docker compose up --build
```

### 🌐 Access URLs & Service Ports
| Service | Host URL | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| **Banking Web UI** | [http://localhost:3000](http://localhost:3000) | `80` (Nginx) | React 18 SPA with built-in AI Chatbot |
| **Backend REST API** | [http://localhost:5001](http://localhost:5001) | `5000` (Node) | Express API, auth, accounts, and transactions |
| **Ollama AI Service** | [http://localhost:11434](http://localhost:11434) | `11434` | Minimal Alpine Ollama container (~70 MB) |
| **Mongo Express GUI**| [http://localhost:8081](http://localhost:8081) | `8081` | Visual MongoDB database management |
| **MongoDB Instance** | `localhost:27017` | `27017` | MongoDB 7.0 database engine |
| **API Health Check** | [http://localhost:5001/api/health](http://localhost:5001/api/health) | `5000` | Liveness and uptime verification endpoint |

### 🛠️ Useful Docker Commands
```bash
# Start all containers in background
docker compose up -d

# View live consolidated logs across all containers
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f ollama

# Inspect container health and resource consumption
docker compose ps
docker stats

# Stop and clean up containers
docker compose down

# Stop and purge persistent data volumes
docker compose down -v
```

---

## ☸️ Cloud-Native Kubernetes (K8s) Orchestration

The entire Apex Bank platform is architected for enterprise cloud-native orchestration with **Kubernetes (K8s v1.30+)**. It includes a full 13-manifest GitOps specification supporting high-availability, declarative state, persistent volumes for MongoDB and Ollama AI, unified secrets/config management, and zero-downtime rolling updates.

```
       +--------------------------------------------------------------------------+
       |              ☸️ Kind Multi-Node Cluster: apex-cluster (v1.30+)           |
       |  +------------------+  +------------------+  +------------------------+  |
       |  |  control-plane   |  |     worker 1     |  |   worker 2 & worker 3  |  |
       |  +------------------+  +------------------+  +------------------------+  |
       |                              Namespace: `apexbank`                       |
       +--------------------------------------------------------------------------+
```

### 🏛️ Kubernetes Cluster Architecture

```mermaid
graph TB
    subgraph Client["External Traffic / Browser"]
        User["User Browser"]
    end

    subgraph Cluster["☸️ Kubernetes Cluster (Namespace: apexbank)"]
        subgraph Ingress["Services & Ingress Layer"]
            FESvc["frontend-service\nNodePort: 30000\nPort: 80"]
            BESvc["backend\nNodePort: 32000\nPort: 5000"]
            MongoSvc["mongo\nClusterIP\nPort: 27017"]
            OllamaSvc["ollama\nClusterIP\nPort: 11434"]
        end

        subgraph Workloads["Workload Deployments"]
            FEPod["frontend-deployment\n(Nginx + React 18 SPA)"]
            BEPod["backend-deployment\n(Express.js API Engine)"]
            MongoPod["mongo-deployment\n(MongoDB 7.0 Engine)"]
            OllamaPod["ollama-deployment\n(Ollama AI Assistant)"]
        end

        subgraph Config["Configuration & Security"]
            CM["ConfigMap\nmongo-config"]
            SEC["Secret\nbankapi-secret"]
        end

        subgraph Storage["Persistent Storage"]
            MongoPVC["PVC: mongo-pvc\n(5Gi Standard)"]
            OllamaPVC["PVC: ollama-pvc\n(5Gi Standard)"]
            MongoPV["PV: mongo-pv\n(/data/mongo)"]
            OllamaPV["PV: ollama-pv\n(/data/ollama)"]
        end
    end

    User -->|Port 30000 / localhost| FESvc
    User -->|Port 32000 / API Direct| BESvc
    FESvc --> FEPod
    FEPod -->|Reverse Proxy /api/*| BESvc
    BESvc --> BEPod
    BEPod -->|TCP 27017| MongoSvc
    BEPod -->|HTTP 11434| OllamaSvc
    MongoSvc --> MongoPod
    OllamaSvc --> OllamaPod

    CM -.->|envFrom| BEPod
    CM -.->|envFrom| FEPod
    SEC -.->|envFrom| BEPod
    SEC -.->|envFrom| MongoPod

    MongoPod --- MongoPVC
    MongoPVC --- MongoPV
    OllamaPod --- OllamaPVC
    OllamaPVC --- OllamaPV
```

---

### 📦 Kubernetes Manifest Inventory (`k8s/`)

The repository includes 13 production-ready Kubernetes manifests located under the [`k8s/`](k8s/) directory:

| Manifest | Kind | API Version | Namespace | Description |
| :--- | :--- | :--- | :--- | :--- |
| [`k8s/kind-config.yml`](k8s/kind-config.yml) | `Cluster` | `kind.x-k8s.io/v1alpha4` | N/A | Multi-node cluster definition (1 control-plane + 3 workers) |
| [`k8s/persistentVolume.yml`](k8s/persistentVolume.yml) | `PersistentVolume` | `v1` | Cluster | 5Gi HostPath volumes for MongoDB (`/data/mongo`) & Ollama (`/data/ollama`) |
| [`k8s/persistentVolumeClaim.yml`](k8s/persistentVolumeClaim.yml) | `PersistentVolumeClaim` | `v1` | `apexbank` | PVC storage claims binding workloads to persistent volumes |
| [`k8s/configMap.yml`](k8s/configMap.yml) | `ConfigMap` | `v1` | `apexbank` | Shared environment config, ports, hostnames, and Mongo connection strings |
| [`k8s/secret.yaml`](k8s/secret.yaml) | `Secret` | `v1` | `apexbank` | Base64 encoded secrets (JWT secret, Mongo root admin credentials) |
| [`k8s/mongo-deployment.yml`](k8s/mongo-deployment.yml) | `Deployment` | `apps/v1` | `apexbank` | MongoDB database engine with mounted volume and credentials |
| [`k8s/mongo-service.yml`](k8s/mongo-service.yml) | `Service` | `v1` | `apexbank` | Internal ClusterIP DNS endpoint `mongo:27017` |
| [`k8s/ollama-deployment.yml`](k8s/ollama-deployment.yml) | `Deployment` | `apps/v1` | `apexbank` | Ollama AI container with mounted model cache volume |
| [`k8s/ollama-service.yml`](k8s/ollama-service.yml) | `Service` | `v1` | `apexbank` | Internal ClusterIP DNS endpoint `ollama:11434` |
| [`k8s/backend-deployment.yml`](k8s/backend-deployment.yml) | `Deployment` | `apps/v1` | `apexbank` | Express API pods using `buildwithsumeet/apex-bank-backend:latest` |
| [`k8s/backend-service.yml`](k8s/backend-service.yml) | `Service` | `v1` | `apexbank` | NodePort service exposing backend API on port `32000` (`5000` target) |
| [`k8s/frontend-deployment.yml`](k8s/frontend-deployment.yml) | `Deployment` | `apps/v1` | `apexbank` | React 18 SPA Nginx pods using `buildwithsumeet/apex-bank-frontend:latest` |
| [`k8s/frontend-service.yml`](k8s/frontend-service.yml) | `Service` | `v1` | `apexbank` | NodePort service exposing Web UI on port `30000` (`80` target) |

---

### 🚀 Step-by-Step Kubernetes Deployment Runbook

#### 1. Spin Up Multi-Node Cluster with Kind
Create a 4-node cluster using [`k8s/kind-config.yml`](k8s/kind-config.yml):
```bash
# Create Kind 4-node cluster
kind create cluster --config k8s/kind-config.yml --name apex-cluster

# Verify all 4 nodes are Ready
kubectl get nodes
# NAME                         STATUS   ROLES           AGE   VERSION
# apex-cluster-control-plane   Ready    control-plane   1m    v1.30.0
# apex-cluster-worker          Ready    <none>          1m    v1.30.0
# apex-cluster-worker2         Ready    <none>          1m    v1.30.0
# apex-cluster-worker3         Ready    <none>          1m    v1.30.0
```

#### 2. Create Isolated Namespace
```bash
kubectl create namespace apexbank
```

#### 3. Load Docker Images into Kind (Local Development)
```bash
# Build images if not already built
docker build -t buildwithsumeet/apex-bank-backend:latest ./backend
docker build -t buildwithsumeet/apex-bank-frontend:latest ./frontend

# Load images into Kind nodes
kind load docker-image buildwithsumeet/apex-bank-backend:latest --name apex-cluster
kind load docker-image buildwithsumeet/apex-bank-frontend:latest --name apex-cluster
```

#### 4. Apply Kubernetes Manifests in Order
Deploy storage, configuration, secrets, and microservices in sequence:
```bash
# Step A: Apply Storage (PV & PVC)
kubectl apply -f k8s/persistentVolume.yml
kubectl apply -f k8s/persistentVolumeClaim.yml

# Step B: Apply ConfigMap & Secrets
kubectl apply -f k8s/configMap.yml
kubectl apply -f k8s/secret.yaml

# Step C: Deploy Database & AI Microservices
kubectl apply -f k8s/mongo-service.yml
kubectl apply -f k8s/mongo-deployment.yml
kubectl apply -f k8s/ollama-service.yml
kubectl apply -f k8s/ollama-deployment.yml

# Step D: Deploy Application Backend & Frontend
kubectl apply -f k8s/backend-service.yml
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/frontend-service.yml
kubectl apply -f k8s/frontend-deployment.yml
```

#### 5. Verify Pods & Services Status
```bash
kubectl get pods -n apexbank -o wide
```
**Expected Output:**
```
NAME                                   READY   STATUS    RESTARTS   AGE
backend-deployment-7dc674df9d-x4wlr    1/1     Running   0          5m
frontend-deployment-567db9c8f4-gvkpw   1/1     Running   0          5m
mongo-deployment-5cf4847f54-9nhhv      1/1     Running   0          5m
ollama-deployment-668fdf544d-bgnrh     1/1     Running   0          5m
```

```bash
kubectl get svc -n apexbank
```
**Expected Output:**
```
NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
backend            NodePort    10.96.140.82    <none>        5000:32000/TCP   5m
frontend-service   NodePort    10.96.220.15    <none>        80:30000/TCP     5m
mongo              ClusterIP   10.96.91.231    <none>        27017/TCP        5m
ollama             ClusterIP   10.96.185.12    <none>        11434/TCP        5m
```

---

### 🌐 Accessing the Application in Kubernetes

Depending on your cluster network setup (Kind vs. Cloud K8s / MetalLB):

#### Option A: Port-Forwarding (Recommended for Local Dev)
Forward the services directly to your localhost:
```bash
# Forward Frontend Web UI to localhost:3000
kubectl port-forward svc/frontend-service 3000:80 -n apexbank

# Forward Backend API to localhost:5000 (or 5001 to avoid macOS collision)
kubectl port-forward svc/backend 5001:5000 -n apexbank

# Forward MongoDB to localhost:27017 (for Compass/mongosh)
kubectl port-forward svc/mongo 27017:27017 -n apexbank

# Forward Ollama AI to localhost:11434
kubectl port-forward svc/ollama 11434:11434 -n apexbank
```

#### Option B: Direct NodePort Access
If your Kind nodes expose port mappings to host or you are using Minikube / bare metal:
- **Frontend Web UI**: `http://<node-ip>:30000`
- **Backend API**: `http://<node-ip>:32000/api/health`

---

### 🛠️ Kubernetes SRE & Operations Cheat Sheet

| Task | Command |
| :--- | :--- |
| **View Live Logs** | `kubectl logs -f deployment/backend-deployment -n apexbank` |
| **Inspect Pod Details** | `kubectl describe pod -l app=backend -n apexbank` |
| **Execute Shell in Pod** | `kubectl exec -it deployment/backend-deployment -n apexbank -- sh` |
| **Seed Database in K8s** | `kubectl exec -it deployment/backend-deployment -n apexbank -- npm run seed` |
| **Restart Workloads** | `kubectl rollout restart deployment/backend-deployment -n apexbank` |
| **Check PVC Storage Binding** | `kubectl get pvc,pv -n apexbank` |
| **Check Resource Usage** | `kubectl top pods -n apexbank` |
| **Scale Workload** | `kubectl scale deployment/backend-deployment --replicas=3 -n apexbank` |
| **Delete All K8s Resources** | `kubectl delete -f k8s/ -n apexbank` |

---

## ⚡ Redis In-Memory Caching & Token Blacklist Architecture

Apex Bank uses an enterprise-grade **Redis 7.0 In-Memory Data Store** connected via `ioredis` for sub-millisecond query performance, multi-tiered read caching, atomic session tracking, and instant JWT revocation.

```
+---------------------------------------------------------------------------------------+
|                                REDIS CACHE-ASIDE PATTERN                              |
|                                                                                       |
|   Client Request ---> [Express Backend] ---> Check Redis Cache (ioredis)              |
|                                                      |                                |
|                        +-----------------------------+-----------------------------+  |
|                        |                                                           |  |
|                  Cache HIT (~1ms)                                           Cache MISS|
|                        |                                                           |  |
|                        v                                                           v  |
|           Return Cached JSON Payload                                 Query MongoDB Cluster|
|                                                                                    |  |
|                                                              Save to Redis with TTL|
|                                                                                    |  |
|                                                                 Return Fresh Data  |
+---------------------------------------------------------------------------------------+
```

### 🗝️ Redis Key Namespace & TTL Matrix

| Cache Key Pattern | TTL (Seconds) | Data Type | Purpose & Invalidation Strategy |
| :--- | :--- | :--- | :--- |
| `user:profile:{userId}` | `600s` (10 min) | JSON String | Current user profile details & primary account summary. |
| `user:accounts:{userId}` | `600s` (10 min) | JSON String | User accounts array with balances & 16-digit virtual card info. |
| `analytics:{userId}` | `900s` (15 min) | JSON String | Aggregated financial metrics, monthly cashflows, category breakdown. |
| `admin:metrics` | `300s` (5 min) | JSON String | Bank-wide liquidity holdings, transaction volume, active users count. |
| `refresh:token:{token}` | `604800s` (7 days) | String (UUID) | Active refresh tokens allowed to rotate into new access tokens. |
| `blacklist:token:{token}` | `900s` (15 min) | String (`'revoked'`) | Revoked access tokens blacklisted upon user logout. |

### 🔄 Automatic Cache Invalidation on Mutations
Whenever a balance-altering mutation takes place:
- **Deposit (`/api/transactions/deposit`)**: Purges `user:profile:{userId}`, `user:accounts:{userId}`, `analytics:{userId}`, and `admin:metrics`.
- **Withdrawal (`/api/transactions/withdraw`)**: Purges account and analytics caches for the withdrawing user.
- **Transfer (`/api/transactions/transfer`)**: Atomically invalidates both the **sender's** and **recipient's** profile and analytics caches, plus system admin statistics.

### 🛡️ High-Availability Graceful Fallback
If the Redis container is paused, recovering, or temporarily unreachable, the `backend/src/config/redis.js` client automatically switches to **Database-Only Fallback Mode**. The backend logs a warning and routes queries directly to MongoDB without crashing or dropping banking requests.

---

## 📊 MongoDB Aggregation Pipelines (Financial Analytics)

Traditional banking architectures that fetch all raw transactions into application memory and run JavaScript `.forEach()` loops suffer severe memory bloat and latency spikes when handling thousands of transactions.

Apex Bank delegates all multi-dimensional calculations directly to the **MongoDB Database Engine** using optimized multi-stage aggregation pipelines:

### 1. Customer Financial Pulse Pipeline (`$facet`, `$project`, `$group`)
In `backend/src/controllers/transactionController.js`, `getTransactionAnalytics` executes a single aggregation query featuring 4 parallel computational branches:

```javascript
const aggregationResult = await Transaction.aggregate([
  // Stage 1: Filter user transactions by account ID and status
  {
    $match: {
      $or: [
        { senderAccount: { $in: accountIds } },
        { recipientAccount: { $in: accountIds } },
      ],
      status: 'COMPLETED',
    },
  },
  // Stage 2: Parallel multi-faceted analytical compute
  {
    $facet: {
      // Facet A: Inflow vs Outflow & Net Savings
      summary: [
        {
          $project: {
            amount: 1,
            isIncome: { $or: [...] },
            isExpense: { $or: [...] },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: { $cond: [{ $eq: ['$isIncome', true] }, '$amount', 0] } },
            totalExpense: { $sum: { $cond: [{ $eq: ['$isExpense', true] }, '$amount', 0] } },
            count: { $sum: 1 },
          },
        },
      ],

      // Facet B: Category Spending Breakdown
      categoryBreakdown: [
        { $match: { isExpense: true } },
        { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { totalAmount: -1 } },
      ],

      // Facet C: Monthly Cashflow Trend (YYYY-MM)
      monthlyTrend: [
        {
          $group: {
            _id: { month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } },
            volume: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.month': -1 } },
        { $limit: 6 },
      ],

      // Facet D: High-Value Transactions Alert
      highValueAlerts: [
        { $match: { amount: { $gte: 1000 } } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
      ],
    },
  },
]);
```

### 2. Admin Enterprise User-Account Relational Join (`$lookup`)
In `backend/src/controllers/adminController.js`, `getAllUsers` uses a single `$lookup` aggregation to join users with their accounts, eliminating N+1 database queries:

```javascript
const usersWithAccounts = await User.aggregate([
  { $sort: { createdAt: -1 } },
  { $project: { password: 0 } },
  {
    $lookup: {
      from: 'accounts',
      localField: '_id',
      foreignField: 'user',
      as: 'accounts',
    },
  },
  {
    $addFields: {
      totalBalance: { $sum: '$accounts.balance' },
    },
  },
]);
```

---

## 🔐 Dual-Token Authentication (Access + Refresh Token)

Apex Bank replaces monolithic single-token models with a hardened **Dual-Token Architecture**:

```
+------------------------------------------------------------------------------------------+
|                        DUAL-TOKEN LIFECYCLE & ROTATION FLOW                              |
|                                                                                          |
| 1. Login / Register:                                                                     |
|    Client <======== Returns Access Token (15m) & Refresh Token (7d) =======> Backend     |
|                                                                                |         |
|                                                     Persist in Redis ----------+         |
|                                                                                          |
| 2. API Request with Expired Access Token:                                                |
|    Client ---- GET /api/accounts (Bearer ExpiredToken) ---> Backend [401 Unauthorized]   |
|                                                                                          |
| 3. Silent Background Refresh Interceptor:                                                |
|    Client ---- POST /api/auth/refresh { refreshToken } ---> Backend                      |
|                                                               |                          |
|                                    1. Validate token in Redis v                          |
|                                    2. Revoke old refresh token                           |
|                                    3. Issue NEW Access Token (15m) + Rotated Refresh (7d)|
|    Client <--- HTTP 200 { new accessToken, new refreshToken } <--------------------------+
|                                                                                          |
| 4. Automatic Replay:                                                                     |
|    Client ---- GET /api/accounts (Bearer NewAccessToken) -> HTTP 200 Success             |
|                                                                                          |
| 5. Logout & Revocation:                                                                  |
|    Client ---- POST /api/auth/logout ---------------------> Redis Blacklist              |
|                                                             (Blacklist token for 15m)    |
+------------------------------------------------------------------------------------------+
```

### Key Security Benefits:
1. **Short Attack Window**: Access tokens expire in **15 minutes**. If intercepted, the token expires quickly.
2. **Refresh Token Rotation**: Every time a refresh token is used, it is revoked in Redis and replaced with a newly generated one. If an attacker replays an old refresh token, it is rejected immediately.
3. **Instant Blacklisting**: When a user clicks **Logout**, the backend writes the access token into the Redis blacklist (`blacklist:token:<token>`) with a TTL matching its expiration. Any subsequent requests using that token are rejected with HTTP 401.

---

## ⚛️ Redux Toolkit (RTK) Centralized Frontend Store

The React 18 client is backed by a modular, predictable **Redux Toolkit** store located under [`frontend/src/store/`](frontend/src/store/):

```
frontend/src/store/
 ├── index.js                  # Root Redux store configuration
 └── slices/
      ├── authSlice.js         # User identity, tokens (access + refresh), auth state
      ├── accountSlice.js      # Active bank account, accounts list, balance tracking
      ├── transactionSlice.js  # Ledger history, analytics data, new transaction feeds
      └── uiSlice.js           # Modal visibility (Transfer, Deposit, AI Assistant), tabs
```

### ⚡ Client-Side Silent Refresh Interceptor
In [`frontend/src/api/client.js`](frontend/src/api/client.js), the `fetchWithAuth()` wrapper transparently captures `401 Unauthorized` responses:
1. Automatically calls `POST /api/auth/refresh`.
2. Updates `localStorage` and dispatches `updateAccessToken()` to Redux.
3. Automatically retries and resolves the original failed API call without user intervention.
4. Manages a concurrent request queue so multiple simultaneous 401s trigger only **one** token refresh.

---

## 🏗️ Jenkins Declarative CI/CD Pipeline (Trivy + Docker Hub)

Apex Bank includes a battle-tested, production-ready Jenkins Declarative Pipeline defined in [`Jenkinsfile`](file:///Users/sumeetsingh/Desktop/practice/project1/Jenkinsfile). It automates the complete lifecycle: workspace hygiene, multi-tier unit testing, multi-container Docker image compilation, **Aqua Security Trivy** vulnerability scanning, and authenticated Docker Hub image publishing.

```
       +-----------------------------------------------------------------------------------------+
       |                         🏗️ JENKINS DECLARATIVE PIPELINE LIFECYCLE                        |
       |                                                                                         |
       |  [Clean Slate] ---> [Git Checkout] ---> [Unit Testing] ---> [Docker Build]              |
       |    deleteDir()        origin/main       frontend+backend    backend + frontend          |
       |                                                                   |                     |
       |                                                                   v                     |
       |  [Post Actions] <--- [Docker Hub Push] <------------------- [Trivy Scan]                |
       |   Status alert       Authenticated publish                   CVE Vulnerability Check    |
       +-----------------------------------------------------------------------------------------+
```

### 🌊 Jenkins Pipeline Stage Flowchart

```mermaid
graph LR
    A["1. Clean Slate\n(deleteDir)"] --> B["2. Git Pull\n(main branch)"]
    B --> C["3. Unit Testing\n(npm lint + npm test\nfrontend & backend)"]
    C --> D["4. Docker Build\n(apex-bank-backend:latest\napex-bank-frontend:latest)"]
    D --> E["5. Trivy Security Scan\n(Vulnerability CVE analysis)"]
    E --> F["6. Docker Hub Push\n(withCredentials: dockerhub-creds\nTag & Push to Registry)"]
    F --> G["7. Post Actions\n(Success / Failure / Always)"]
```

---

### 📦 Stage-by-Stage Implementation Breakdown

| Stage | Name in Jenkinsfile | Commands / Action | Validation Gate / Purpose |
| :--- | :--- | :--- | :--- |
| **Stage 1** | `Clean Slate` | `deleteDir()` | Purges stale cache, node_modules, and previous build residue to ensure deterministic builds. |
| **Stage 2** | `Git Pull` | `git branch: 'main', url: 'https://github.com/buildwithsumeet/ai-bank-app.git'` | Checks out the latest commit on the production branch. |
| **Stage 3** | `Unit Testing` | `dir('frontend') { npm install && npm run lint && npm test }`<br>`dir('backend') { npm install && npm run lint && npm test }` | **Quality Gate**: Runs syntax linting and unit tests on both tiers. Fails pipeline immediately if any test fails. |
| **Stage 4** | `Docker Image Building` | `docker build -t apex-bank-backend:latest .`<br>`docker build -t apex-bank-frontend:latest .` | Multi-stage Docker builds compiling production React SPA (Nginx) and Node.js 20 backend engine. |
| **Stage 5** | `Docker Image Testing Trivy` | `trivy image apex-bank-backend:latest`<br>`trivy image apex-bank-frontend:latest` | **Security Gate**: Analyzes OS packages, npm dependencies, and binaries for known CVE vulnerabilities. |
| **Stage 6** | `Docker Image Pushing` | `withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', ...)])`<br>`docker login`<br>`docker push "$DOCKER_USERNAME/apex-bank-backend:latest"`<br>`docker push "$DOCKER_USERNAME/apex-bank-frontend:latest"`<br>`docker logout` | Securely authenticates with Docker Hub credentials, tags release images, pushes to public/private registry, and logs out. |
| **Post** | `post { success / failure / always }` | `echo 'Pipeline completed successfully!'` | Logs audit records and notifies DevOps teams of build status. |

---

### 📜 Complete Jenkins Declarative Pipeline Script (`Jenkinsfile`)

```groovy
pipeline {
    agent any

    environment {
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
    }

    stages {
        stage('Clean Slate') {
            steps {
                echo 'Resetting workspace...'
                deleteDir()
            }
        }

        stage('Git Pull') {
            steps {
                echo 'Starting Git checkout...'
                git branch: 'main',
                    url: 'https://github.com/buildwithsumeet/ai-bank-app.git'
                echo 'Git checkout successful!'
            }
        }

        stage('Unit Testing') {
            steps {
                echo 'Running unit testing...'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run lint'
                    sh 'npm test'
                }
                dir('backend') {
                    sh 'npm install'
                    sh 'npm run lint'
                    sh 'npm test'
                }
                echo 'Unit testing passed!'
            }
        }

        stage('Docker Image Building') {
            steps {
                echo 'Building Docker images...'
                dir('backend') {
                    sh 'docker build -t apex-bank-backend:latest .'
                }
                dir('frontend') {
                    sh 'docker build -t apex-bank-frontend:latest .'
                }
                echo 'Docker images built successfully!'
            }
        }

        stage("Docker Image Testing Trivy") {
            steps {
                echo "Scanning Docker images with Trivy..."
                sh 'trivy image apex-bank-backend:latest'
                sh 'trivy image apex-bank-frontend:latest'
            }
        }

        stage('Docker Image Pushing') {
            steps {
                echo 'Pushing Docker images to Docker Hub...'
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        set +x
                        echo "$DOCKER_PASSWORD" | docker login \
                            --username "$DOCKER_USERNAME" \
                            --password-stdin
                    '''

                    sh '''
                        docker tag apex-bank-backend:latest \
                            "$DOCKER_USERNAME/apex-bank-backend:latest"
                        docker push \
                            "$DOCKER_USERNAME/apex-bank-backend:latest"
                    '''

                    sh '''
                        docker tag apex-bank-frontend:latest \
                            "$DOCKER_USERNAME/apex-bank-frontend:latest"
                        docker push \
                            "$DOCKER_USERNAME/apex-bank-frontend:latest"
                    '''

                    sh 'docker logout'
                    echo 'Docker images pushed successfully!'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
        always {
            echo 'Pipeline execution finished.'
        }
    }
}
```

---

### ⚙️ Jenkins Server Configuration Guide

#### 1. Required Jenkins Plugins
Install the following plugins via **Manage Jenkins** ➡️ **Plugins** ➡️ **Available Plugins**:
- `Pipeline` (Workflow Aggregator)
- `Git Plugin`
- `Credentials Binding Plugin`
- `Docker Pipeline`

#### 2. Configure Docker Hub Credentials
1. Navigate to **Manage Jenkins** ➡️ **Credentials** ➡️ **System** ➡️ **Global credentials**.
2. Click **Add Credentials**:
   - **Kind**: `Username with password`
   - **Scope**: `Global`
   - **Username**: Your Docker Hub username (e.g. `buildwithsumeet`)
   - **Password**: Your Docker Hub Personal Access Token (PAT)
   - **ID**: `dockerhub-creds` *(must match credentialsId in Jenkinsfile)*
3. Click **Create**.

#### 3. Create Pipeline Job
1. In Jenkins dashboard, click **New Item** ➡️ Select **Pipeline** ➡️ Name it `apex-bank-pipeline`.
2. Scroll to the **Pipeline** section:
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/buildwithsumeet/ai-bank-app.git`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`
3. Under **Build Triggers**, select **GitHub hook trigger for GITScm polling** for automated builds on push.
4. Click **Save** and trigger **Build Now**!

---

## 💻 Manual Local Development (Without Docker)

If you prefer running services directly on your host machine:

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `localhost:27017`
- **Ollama** *(Optional)*: Installed on host (`ollama run qwen2.5:0.5b` or `ollama run smollm:135m`)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo accounts, cards, and transactions
npm run dev      # Launches Express server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Launches Vite dev server on http://localhost:3000
```

---

## 🧪 Pre-Seeded Test Credentials

Use these credentials to test customer and admin experiences (or click the 1-click test credentials on the login screen):

| Role | Name | Email | Password | Starting Balances |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Admin** | Bank Administrator | `admin@apexbank.com` | `password123` | System oversight & freeze controls |
| 👤 **Customer** | Alice Johnson | `alice@example.com` | `password123` | Checking: **$14,250.75** / Savings: **$38,500.00** |
| 👤 **Customer** | Bob Martinez | `bob@example.com` | `password123` | Checking: **$8,640.50** |
| 👤 **Customer** | Charlie Davis | `charlie@example.com` | `password123` | Checking: **$5,120.00** |

---

## 📖 Complete REST API Specification

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer & auto-provision account | No |
| `POST` | `/api/auth/login` | Authenticate with email/password & get JWT | No |
| `GET` | `/api/auth/profile` | Retrieve logged-in user profile | Bearer Token |
| `POST` | `/api/auth/seed` | Trigger immediate database reset & re-seed | No (Dev/Demo) |

### 2. Bank Accounts (`/api/accounts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounts` | Fetch all accounts owned by current user | Bearer Token |
| `POST` | `/api/accounts` | Create new account (`checking`, `savings`, `investment`) | Bearer Token |
| `GET` | `/api/accounts/:id` | Fetch specific account details | Bearer Token |
| `GET` | `/api/accounts/lookup/:accNo` | Verify recipient account number & get holder name | Bearer Token |

### 3. Transactions (`/api/transactions`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions/deposit` | Credit funds to specified account | Bearer Token |
| `POST` | `/api/transactions/withdraw` | Debit cash from specified account | Bearer Token |
| `POST` | `/api/transactions/transfer` | Atomic money transfer to another account number | Bearer Token |
| `GET` | `/api/transactions/history` | Paginated, filtered transaction history | Bearer Token |
| `GET` | `/api/transactions/analytics` | Inflow/outflow stats & categorized metrics | Bearer Token |

### 4. AI Financial Assistant (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ai/status` | Check Ollama container connectivity & active model | Bearer Token |
| `POST` | `/api/ai/chat` | Send prompt; returns intent data + conversational advice | Bearer Token |

### 5. Administration (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | System holdings, transaction volume, and user count | Bearer (Admin) |
| `GET` | `/api/admin/users` | List all users with nested accounts | Bearer (Admin) |
| `PUT` | `/api/admin/accounts/:id/status` | Freeze (`frozen`) or unfreeze (`active`) account | Bearer (Admin) |
| `GET` | `/api/admin/transactions` | Global bank-wide transaction audit trail | Bearer (Admin) |

### 6. Health & Diagnostics
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime, timestamp, and health verification | No |

---

## 🛠️ DevOps & SRE Master Guide (What DevOps Engineers Need)

This section provides comprehensive technical documentation, deployment manifests, security protocols, and on-call operational runbooks for DevOps, Platform, and SRE teams.

---

### 1. Container Topology & Microservices

The application is orchestrated via 5 microservices on an isolated Docker bridge network (`bank-network`):

```
+-------------------------------------------------------------------------------+
|                             Docker Bridge: bank-network                       |
|                                                                               |
|   +-----------------------+                    +--------------------------+   |
|   |  apex-bank-frontend   |                    |    apex-bank-backend     |   |
|   |  (Nginx Alpine :80)   |--- /api/ proxy --->|  (Node.js 20 Alpine :5000)|   |
|   +-----------------------+                    +--------------------------+   |
|        ^ Host Port 3000                             |          |              |
|                                            TCP 27017|          |HTTP 11434    |
|                                                     v          v              |
|                                            +------------+ +---------------+   |
|                                            |  MongoDB   | | apex-ollama   |   |
|                                            |  7.0:27017 | | Alpine :11434 |   |
|                                            +------------+ +---------------+   |
|                                                   ^                           |
|                                          TCP 27017|                           |
|                                                   |                           |
|                                            +---------------+                  |
|                                            | mongo-express |                  |
|                                            |  GUI :8081    |                  |
|                                            +---------------+                  |
+-------------------------------------------------------------------------------+
```

#### Detailed Container Matrix:
| Container Name | Base Image | Internal Port | Host Port | Memory Limit (Rec.) | Volume Mount |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `apex-bank-frontend` | `nginx:alpine` | `80` | `3000` | 128 MB | None (stateless SPA) |
| `apex-bank-backend` | `node:20-alpine` | `5000` | `5001` | 512 MB | None (stateless API) |
| `apex-bank-mongodb` | `mongo:7.0` | `27017` | `27017` | 1 GB | `mongo_data:/data/db` |
| `apex-bank-ollama` | `alpine/ollama:latest` | `11434` | `11434` | 1 GB | `ollama_data:/root/.ollama` |
| `apex-bank-mongo-express` | `mongo-express:latest`| `8081` | `8081` | 256 MB | None |

---

### 2. macOS Port 5000 Collision Resolution
On macOS Monterey, Ventura, Sonoma, and Sequoia, **AirPlay Receiver (`ControlCenter`)** listens on port 5000 by default:
```bash
sudo lsof -i :5000
# COMMAND      PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
# ControlCe    548 user   19u  IPv4 0x...       0t0      TCP *:commplex-main (LISTEN)
```
**DevOps Solution**:
- Inside Docker, the backend listens on port `5000`.
- The container host port is mapped to **`5001:5000`** in `docker-compose.yml`.
- Frontend Nginx uses Docker internal DNS (`http://backend:5000/api/`), remaining unaffected by host port mappings.

---

### 3. Health Checks & Liveness Probes

#### MongoDB Ping Probe:
Defined in `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

#### Backend API Liveness Probe:
Defined in `backend/Dockerfile`:
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1
```

---

### 4. CI/CD Pipeline (GitHub Actions)

A complete continuous integration workflow is configured at [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml):

```yaml
name: CI/CD Pipeline - Apex Bank App

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    name: Backend Syntax & Verification
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm', cache-dependency-path: backend/package-lock.json }
      - run: cd backend && npm ci && node --check src/server.js

  test-frontend:
    name: Frontend Build & Verification
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm', cache-dependency-path: frontend/package-lock.json }
      - run: cd frontend && npm ci && npm run build

  docker-build-test:
    name: Docker Build Validation
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - run: docker compose build --parallel
```

#### Jenkins Declarative Pipeline with Trivy & Docker Hub:
A complete production pipeline with workspace hygiene, multi-tier testing, **Trivy Vulnerability Scanning**, and authenticated Docker Hub publishing is configured in [`Jenkinsfile`](./Jenkinsfile). For full stage breakdown, diagram, and Jenkins server setup, see [Section 12: Jenkins Declarative CI/CD Pipeline](#️-jenkins-declarative-cicd-pipeline-trivy--docker-hub).


#### Running Lint & Unit Tests Locally:
```bash
# Backend Syntax Lint & Unit Tests
cd backend
npm run lint    # Scans all 19 JavaScript ESM files with zero external dependencies
npm test        # Runs unit tests (Account generator, 16-digit card, JWT tokens)

# Frontend JSX Lint & Unit Tests
cd frontend
npm run lint    # Scans all 15 React JSX components with esbuild
npm test        # Validates client API contract & currency masking utilities
npm run build   # Production Vite compilation
```

---

### 🧪 Playwright End-to-End (E2E) & Multi-Tier Testing Suites

The repository includes a unified, automated testing architecture powered by **Microsoft Playwright**. It tests all three system layers: **Frontend User Interface**, **Backend REST APIs**, and **Docker Container Infrastructure** with an interactive visual UI dashboard.

```
frontend/e2e/
 ├── 🎨 frontend.spec.js   # 8 E2E UI Tests (Login, Demo Fill, Register, Cards, Modals, AI Chatbot, Admin)
 ├── ⚙️ backend.spec.js    # 6 REST API Tests (Liveness probe, JWT auth guards, Login API, Helmet security)
 └── 🐳 docker.spec.js     # 5 Container Health Tests (Nginx:3000, Backend:5001, MongoExpress:8081, Ollama:11434)
```

#### 🖥️ Interactive Visual Test Dashboard & Execution Commands:

```bash
cd frontend

# 1. 🌟 Launch Playwright Interactive GUI Dashboard (Live DOM, Time-Travel, Runner UI)
npm run test:ui

# 2. 📊 View Interactive Web HTML Test Report
npm run test:report

# 3. 🚀 Run All Test Suites Headless (19 Multi-Tier Test Cases)
npm run test:e2e

# 4. 🎯 Run Individual Test Suites
npm run test:frontend   # Runs Frontend UI journey test cases
npm run test:backend    # Runs Backend API & Security test cases
npm run test:docker     # Runs Docker Containers & Port health check cases
```

---

### 5. Production Deployment Strategies

#### Strategy A: Single-Host Production (`docker-compose.prod.yml`)
For production single-VM deployments (AWS EC2, Hetzner, DigitalOcean Droplet), use HTTPS termination via Nginx & Let's Encrypt:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    restart: always
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/bankdb
      - JWT_SECRET=${PROD_JWT_SECRET}
      - OLLAMA_HOST=http://ollama:11434
      - OLLAMA_MODEL=smollm:135m
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
```

#### Strategy B: Kubernetes (K8s) Production Architecture
For high-availability clusters (AWS EKS, GCP GKE), deploy using Kubernetes manifests:

```yaml
# apex-bank-backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apex-backend
  labels:
    app: apex-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: apex-backend
  template:
    metadata:
      labels:
        app: apex-backend
    spec:
      containers:
      - name: backend
        image: buildwithsumeet/ai-bank-backend:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: apex-config
        - secretRef:
            name: apex-secrets
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 15
          periodSeconds: 20
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "1000m"
            memory: "512Mi"
```

#### 📁 Kubernetes Manifest Inventory (`k8s/`):
| Manifest File | Kind / API Version | Scope | Purpose |
| :--- | :--- | :--- | :--- |
| [`k8s/kind-config.yml`](k8s/kind-config.yml) | `Cluster` (`kind.x-k8s.io/v1alpha4`) | Cluster | 4-Node local Kind cluster setup (1 control-plane + 3 workers). |
| [`k8s/configMap.yml`](k8s/configMap.yml) | `ConfigMap` (`v1`) | `apexbank` | Application environment configuration & cluster service URIs. |
| [`k8s/secret.yaml`](k8s/secret.yaml) | `Secret` (`v1`) | `apexbank` | Base64-encoded credentials (JWT secrets, Mongo root auth). |
| [`k8s/persistentVolume.yml`](k8s/persistentVolume.yml) | `PersistentVolume` (`v1`) | Cluster | 5Gi HostPath storage volumes for MongoDB and Ollama AI. |
| [`k8s/persistentVolumeClaim.yml`](k8s/persistentVolumeClaim.yml) | `PersistentVolumeClaim` (`v1`) | `apexbank` | Storage claims bound to `mongo-pv` and `ollama-pvc`. |
| [`k8s/mongo-deployment.yml`](k8s/mongo-deployment.yml) | `Deployment` (`apps/v1`) | `apexbank` | MongoDB database container deployment with PVC mount. |
| [`k8s/mongo-service.yml`](k8s/mongo-service.yml) | `Service` (`v1`) | `apexbank` | ClusterIP internal DNS endpoint for MongoDB (`mongo:27017`). |
| [`k8s/ollama-deployment.yml`](k8s/ollama-deployment.yml) | `Deployment` (`apps/v1`) | `apexbank` | Ollama AI local engine with persistent volume mount. |
| [`k8s/ollama-service.yml`](k8s/ollama-service.yml) | `Service` (`v1`) | `apexbank` | ClusterIP internal endpoint for Ollama AI (`ollama:11434`). |
| [`k8s/backend-deployment.yml`](k8s/backend-deployment.yml) | `Deployment` (`apps/v1`) | `apexbank` | Node.js Express Backend API pods with Secret and ConfigMap bindings. |
| [`k8s/backend-service.yml`](k8s/backend-service.yml) | `Service` (`v1`) | `apexbank` | NodePort service exposing backend (`backend:5000`, NodePort: 32000). |
| [`k8s/frontend-deployment.yml`](k8s/frontend-deployment.yml) | `Deployment` (`apps/v1`) | `apexbank` | React 18 SPA Nginx pods serving on port 80. |
| [`k8s/frontend-service.yml`](k8s/frontend-service.yml) | `Service` (`v1`) | `apexbank` | NodePort service exposing Web UI on port 80 (NodePort: 30000). |

#### 🚀 Deploying to Kubernetes:
```bash
# 1. Create Namespace
kubectl create namespace apexbank

# 2. Deploy Storage, Configs, and Secrets
kubectl apply -f k8s/persistentVolume.yml
kubectl apply -f k8s/persistentVolumeClaim.yml
kubectl apply -f k8s/configMap.yml
kubectl apply -f k8s/secret.yaml

# 3. Deploy Databases & AI Services
kubectl apply -f k8s/mongo-service.yml
kubectl apply -f k8s/mongo-deployment.yml
kubectl apply -f k8s/ollama-service.yml
kubectl apply -f k8s/ollama-deployment.yml

# 4. Deploy Backend & Frontend Applications
kubectl apply -f k8s/backend-service.yml
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/frontend-service.yml
kubectl apply -f k8s/frontend-deployment.yml
```

---

### 6. Database Backup & Disaster Recovery

#### Automated Daily MongoDB Backup Script (`backup.sh`):
```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="bankdb_backup_${TIMESTAMP}.gz"

mkdir -p ${BACKUP_DIR}

echo "Starting automated MongoDB backup..."
docker exec apex-bank-mongodb mongodump \
  --db=bankdb \
  --archive \
  --gzip > "${BACKUP_DIR}/${FILENAME}"

echo "Backup created successfully: ${BACKUP_DIR}/${FILENAME}"

# Retain only last 7 days of backups
find ${BACKUP_DIR} -type f -name "bankdb_backup_*.gz" -mtime +7 -delete
echo "Pruned backups older than 7 days."
```

#### Database Restore Script:
```bash
#!/bin/bash
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore.sh <path-to-backup.gz>"
  exit 1
fi

echo "Restoring MongoDB from $BACKUP_FILE..."
docker exec -i apex-bank-mongodb mongorestore \
  --db=bankdb \
  --archive \
  --gzip \
  --drop < "$BACKUP_FILE"

echo "Database restored successfully."
```

---

### 7. Monitoring, Logging & Observability

#### 1. Structured Logging & Log Rotation
Prevent Docker container logs from filling disk space by configuring the JSON file log driver in `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

#### 2. Prometheus Scrape Configuration (`prometheus.yml`):
```yaml
scrape_configs:
  - job_name: 'apex-bank-backend'
    metrics_path: '/api/health'
    static_configs:
      - targets: ['apex-bank-backend:5000']
```

---

### 8. Security Hardening & SRE Checklist

- [x] **Non-Root User Execution**: Backend & Frontend containers run with unprivileged users.
- [x] **Network Isolation**: Only Frontend (`3000`) and Backend (`5001`) host ports are accessible; MongoDB and Ollama remain on the internal `bank-network` bridge.
- [x] **API Rate Limiting**: Throttles brute force requests (200 requests / 15 minutes per IP).
- [x] **HTTP Security Headers**: `helmet` enforces X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, and XSS filtering.
- [x] **Password Protection**: Passwords salted and hashed with bcrypt (10 rounds); omitted from Mongoose responses via `select: false`.
- [x] **Atomic Concurrency**: Balances are updated via atomic conditional queries (`$inc` and `$gte`) to eliminate double-spending.
- [x] **CORS Configuration**: Restricts origin and method parameters to trusted endpoints in production.

---

### 9. On-Call Troubleshooting Runbook

| Symptom | Probable Cause | Remediation Step |
| :--- | :--- | :--- |
| `bind: address already in use 0.0.0.0:5000` | macOS ControlCenter AirPlay Receiver listening on port 5000. | Check `docker-compose.yml`. Host port is mapped to `5001:5000`. Access backend on `http://localhost:5001`. |
| `Could not resolve host: github.com` during push | Sandbox / Network isolation active. | Run terminal commands with `BypassSandbox: true` or verify host internet connectivity. |
| `mongo: ping failed` / `ECONNREFUSED` | MongoDB container still initializing. | Inspect logs with `docker compose logs mongo`. Verify healthcheck status via `docker compose ps`. |
| Ollama model pull slow or timing out | Initial model download in progress. | The application includes a dual-engine fallback! The AI chatbot responds with live banking data immediately, even while Ollama is pulling. |
| Container killed (Exit Code 137) | Out Of Memory (OOM) killer triggered. | Increase Docker Desktop memory allocation to at least 4 GB (Ollama + MongoDB). |

---

## 📄 License
This project is open-source and distributed under the **MIT License**.

Built with ❤️ by **[buildwithsumeet](https://github.com/buildwithsumeet)**. Contributions, stars, and pull requests are warmly welcome!
