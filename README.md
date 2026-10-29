# 🏦 Apex Bank (`ai-bank-app`) — Full-Stack MERN Digital Banking & AI Assistant Platform

[![Build Status](https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?logo=github-actions)](.github/workflows/ci-cd.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v20-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-FF6B6B?logo=ollama)](https://ollama.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-grade, containerized Digital Banking Platform built with the **MERN** stack (MongoDB, Express.js, React 18, Node.js) featuring an on-premise **Ollama AI Banking Assistant** (< 155 MB footprint), real-time database auto-seeding with visual progress tracking, atomic balance concurrency, interactive 16-digit virtual debit cards, and an enterprise **DevOps / SRE** architecture.

---

## 📑 Table of Contents
1. [System Architecture](#-system-architecture)
2. [Key Application Features](#-key-application-features)
3. [🤖 Ollama AI Banking Chatbot (< 155 MB)](#-ollama-ai-banking-chatbot--155-mb)
4. [🌱 Database Seeding & Live Progress](#-database-seeding--live-progress)
5. [🔑 Environment Variables (.env) Full Specification](#-environment-variables-env-full-specification)
6. [🚀 Quickstart & Docker Orchestration](#-quickstart--docker-orchestration)
7. [💻 Manual Local Development (Without Docker)](#-manual-local-development-without-docker)
8. [🧪 Pre-Seeded Test Credentials](#-pre-seeded-test-credentials)
9. [📖 Complete REST API Specification](#-complete-rest-api-specification)
10. [🛠️ DevOps & SRE Master Guide](#️-devops--sre-master-guide-what-devops-engineers-need)
    - [Container Topology & Microservices](#1-container-topology--microservices)
    - [macOS Port 5000 Collision Resolution](#2-macos-port-5000-collision-resolution)
    - [Health Checks & Liveness Probes](#3-health-checks--liveness-probes)
    - [CI/CD Pipeline (GitHub Actions)](#4-cicd-pipeline-github-actions)
    - [Production Deployment Strategies (Docker Compose & Kubernetes)](#5-production-deployment-strategies)
    - [Database Backup & Disaster Recovery](#6-database-backup--disaster-recovery)
    - [Monitoring, Logging & Observability](#7-monitoring-logging--observability)
    - [Security Hardening & SRE Checklist](#8-security-hardening--sre-checklist)
    - [On-Call Troubleshooting Runbook](#9-on-call-troubleshooting-runbook)

---

## 🏛️ System Architecture

```mermaid
graph TD
    User["End User / Browser"] -->|Port 3000| Nginx["Frontend Nginx Web Server (React 18 SPA)"]
    Nginx -->|/api/* Reverse Proxy| Backend["Express.js API Engine (Port 5000)"]
    Nginx -->|/* Static Assets| ClientApp["Vite Optimized SPA + AI Chatbot Widget"]
    
    Backend -->|Mongoose ODM / TCP 27017| Mongo[("MongoDB 7.0 Cluster ('bankdb')")]
    Backend -->|REST API / TCP 11434| Ollama[("Ollama Container (alpine/ollama ~70MB)")]
    OllamaPuller["Ollama Puller (curl)"] -->|One-time boot pull| Ollama
    
    AdminUser["DevOps / DB Admin"] -->|Port 8081| MongoExpress["Mongo-Express GUI Visualizer"]
    MongoExpress --> Mongo
```

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

#### Jenkins Declarative Pipeline (`Jenkinsfile`):
A ready-to-run Declarative Pipeline script is provided in [`Jenkinsfile`](./Jenkinsfile) for Jenkins CI/CD servers:

```groovy
pipeline {
    agent any

    stages {
        stage('Git Pull') {
            steps {
                git branch: 'main', url: 'https://github.com/buildwithsumeet/ai-bank-app.git'
            }
        }
        stage('Backend - Install & Lint') {
            steps {
                dir('backend') {
                    sh 'npm ci || npm install'
                    sh 'npm run lint'
                }
            }
        }
        stage('Backend - Test') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
        stage('Frontend - Install & Lint') {
            steps {
                dir('frontend') {
                    sh 'npm ci || npm install'
                    sh 'npm run lint'
                }
            }
        }
        stage('Frontend - Test & Build') {
            steps {
                dir('frontend') {
                    sh 'npm test'
                    sh 'npm run build'
                }
            }
        }
        stage('Docker - Build & Validate') {
            steps {
                sh 'docker compose config'
                sh 'docker compose build'
            }
        }
    }
}
```

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
