# 🏦 Banking Workflow Automation System

> **Enterprise-grade workflow automation platform for banking operations.** A production-ready system enabling secure loan processing, sophisticated risk assessment, and comprehensive audit trails with role-based access control.

[![FastAPI](https://img.shields.io/badge/FastAPI-v0.104+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Workflow Lifecycle](#-workflow-lifecycle)
- [Tech Stack](#-tech-stack)
- [RBAC & Permissions](#-rbac--permissions)
- [Quick Start](#-quick-start)
- [Docker Deployment](#-docker-deployment)
- [Local Development](#-local-development)
- [API Documentation](#-api-documentation)
- [Environment Configuration](#-environment-configuration)
- [Database Migrations](#-database-migrations)
- [Security](#-security)
- [Production Deployment](#-production-deployment)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

## 🎯 Project Overview

The Banking Workflow Automation System is a sophisticated, microservices-ready backend platform designed to streamline loan processing workflows in financial institutions. Built on proven technologies, it provides:

- **Stateful Workflow Engine**: Automated multi-stage loan processing with defined state transitions
- **Rules-Driven Processing**: Configurable business rules (salary thresholds, DTI ratios, employment verification)
- **Risk Assessment**: Algorithmic risk scoring (LOW/MEDIUM/HIGH) with adjustable weightings
- **RBAC Security**: Four role-based permission levels (Maker, Checker, Approver, Admin)
- **Comprehensive Audit Trail**: Immutable event logging for regulatory compliance
- **Real-Time Notifications**: User-facing notifications for workflow state changes
- **RESTful API**: OpenAPI 3.0 specification with interactive Swagger documentation

**Ideal for:** Financial institutions, fintech platforms, loan originators, and backend engineering portfolios.

---

## ✨ Key Features

### Loan Processing Workflow
- Multi-stage approval process with automated state transitions
- Applicant validation (national ID, salary verification)
- Business rule enforcement (DTI, LTS ratios, employment checks)
- Risk assessment with configurable scoring algorithms

### Security & Access Control
- JWT-based authentication with token refresh mechanism
- Role-based authorization (Maker, Checker, Approver, Admin)
- Granular permission enforcement on all endpoints
- Password hashing with bcrypt

### Operations & Compliance
- Immutable audit trail with user attribution and timestamps
- Real-time user notifications for key workflow events
- Administrative user management and role assignment
- Dashboard KPI metrics (approval rates, average processing time)

### Developer Experience
- Auto-generated API documentation (Swagger UI, ReDoc)
- Async database operations for high throughput
- Comprehensive error handling with standard HTTP status codes
- Structured logging for debugging and monitoring

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Application                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Auth API    │  │  Loan API    │  │ Dashboard API│  │
│  │  /auth/*     │  │  /loans/*    │  │ /dashboard/* │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Service Layer (Business Logic)           │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ • UserService          • WorkflowEngine          │   │
│  │ • LoanService          • RulesEngine             │   │
│  │ • RiskService          • NotificationService     │   │
│  │ • AuditService         • ValidationService       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ SQLAlchemy   │  │    JWT       │  │   RBAC       │  │
│  │     ORM      │  │ Auth & Token │  │  Decorators  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │     PostgreSQL Database (15+)        │
        ├──────────────────────────────────────┤
        │ • Users              • Notifications │
        │ • LoanRequests       • AuditLogs     │
        │ • WorkflowStates     • RiskScores    │
        └──────────────────────────────────────┘
```

### Core Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **API Gateway** | Route and validate requests | FastAPI + Pydantic |
| **Authentication** | Token generation and validation | JWT + bcrypt |
| **Workflow Engine** | State machine for loan processing | SQLAlchemy + custom SM |
| **Rules Engine** | Business rule evaluation | Python + rule registry |
| **Risk Assessment** | Risk scoring algorithm | Weighted scoring model |
| **Database** | Persistent storage | PostgreSQL + Alembic |
| **Notifications** | Event-driven user alerts | In-app + extensible |
| **Audit System** | Compliance logging | Immutable audit trail |

---

## 📊 Workflow Lifecycle

### State Diagram

```
     INITIATED
         │
         ▼
     VALIDATED ◄─────── (validation fails → stuck at INITIATED)
         │
         ▼
   RULE_CHECKED ◄────── (rules fail → stuck at VALIDATED)
         │
         ▼
  RISK_ASSESSED ◄────── (automatic scoring)
         │
         ├─────────────────┐
         ▼                 ▼
      APPROVED          REJECTED
      (Final)           (Final)
```

### Workflow Transitions

| From | To | Trigger | Conditions |
|------|----|---------|----|
| **INITIATED** | VALIDATED | Submit loan | National ID and salary verified |
| **VALIDATED** | RULE_CHECKED | Auto-advance | Passes all business rules (DTI, LTS, employment) |
| **RULE_CHECKED** | RISK_ASSESSED | Auto-advance | Risk score computed |
| **RISK_ASSESSED** | APPROVED | Approver action | Manual approval with reason |
| **RISK_ASSESSED** | REJECTED | Approver action | Manual rejection with reason |

### Business Rules Engine

When a loan transitions to **RULE_CHECKED**, the following rules are evaluated:

- **Minimum Salary**: `monthly_salary >= 5,000`
- **Debt-to-Income (DTI)**: `(loan_amount / loan_tenure_months) / monthly_salary <= 0.30`
- **Loan-to-Salary (LTS)**: `loan_amount / monthly_salary <= 60`
- **Employment Status**: Must be `EMPLOYED` or `SELF_EMPLOYED`
- **Loan Tenure**: Between 12 and 360 months

### Risk Scoring Model

Risk score is computed as a weighted sum:

```
Risk Score = (
    0.25 × DTI_Risk +
    0.25 × LTS_Risk +
    0.20 × Salary_Risk +
    0.15 × Tenure_Risk +
    0.15 × Employment_Risk
)

Risk Level:
  - LOW:    0.00 - 0.33
  - MEDIUM: 0.34 - 0.66
  - HIGH:   0.67 - 1.00
```

---

## 🔧 Tech Stack

### Backend Framework
- **FastAPI** (v0.104+) — Modern async web framework with automatic OpenAPI documentation
- **Pydantic v2** — Data validation and serialization
- **Python 3.11+** — Language runtime

### Database & ORM
- **PostgreSQL 15+** — Relational database
- **SQLAlchemy 2.0** — Async ORM with declarative models
- **Alembic** — Database schema migrations

### Authentication & Security
- **JWT (PyJWT)** — Token-based authentication
- **bcrypt** — Password hashing
- **python-jose** — Cryptographic operations

### Infrastructure
- **Docker & Docker Compose** — Containerization and orchestration
- **Gunicorn** — ASGI application server
- **pgAdmin** — PostgreSQL management UI

### Development Tools
- **pytest** — Testing framework
- **uvicorn** — Development server with hot reload
- **black, flake8** — Code formatting and linting

---

## 👥 RBAC & Permissions

The system implements a four-tier role-based access control model:

| Role | Description | Capabilities |
|------|-------------|---|
| **MAKER** | Loan originator | Create new loan requests; view own loans; receive notifications |
| **CHECKER** | Loan reviewer | View all loans; access dashboard; view audit trails; cannot approve |
| **APPROVER** | Loan decision maker | View all loans; approve/reject loans; access dashboard; view audit trails |
| **ADMIN** | System administrator | Full access: create users, manage roles, view all data, system configuration |

### Permission Matrix

| Endpoint | MAKER | CHECKER | APPROVER | ADMIN |
|----------|-------|---------|----------|-------|
| `POST /loans` | ✅ | ❌ | ❌ | ✅ |
| `GET /loans` (own) | ✅ | ❌ | ❌ | ❌ |
| `GET /loans` (all) | ❌ | ✅ | ✅ | ✅ |
| `POST /loans/{id}/action` | ❌ | ❌ | ✅ | ✅ |
| `GET /dashboard/stats` | ❌ | ✅ | ✅ | ✅ |
| `GET /audit/logs` | ❌ | ✅ | ✅ | ✅ |
| `POST /users` | ❌ | ❌ | ❌ | ✅ |
| `GET /users` | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (for containerized deployment)
- **Git** (to clone the repository)
- **PostgreSQL 15+** (if running locally without Docker)
- **Python 3.11+** (if running locally without Docker)

### Clone the Repository

```bash
git clone https://github.com/marwan-yasser644/banking-workflow.git
cd banking-workflow
```

---

## 🐳 Docker Deployment

### Step 1: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `SECRET_KEY` — Change to a random 64-character string
- `POSTGRES_USER` and `POSTGRES_PASSWORD` — Strong credentials
- `DATABASE_URL` — PostgreSQL connection string (auto-configured if using Docker)

### Step 2: Build and Start Services

```bash
docker compose up --build -d
```

This starts:
- **API Service** on port 8000
- **PostgreSQL** on port 5432
- **pgAdmin** on port 5050

### Step 3: Run Database Migrations

```bash
docker compose exec api alembic upgrade head
```

### Step 4: Seed Initial Data

```bash
docker compose exec api python scripts/seed.py
```

### Step 5: Access the System

| Service | URL | Credentials |
|---------|-----|-------------|
| **API** | http://localhost:8000 | — |
| **Swagger Docs** | http://localhost:8000/docs | — |
| **ReDoc** | http://localhost:8000/redoc | — |
| **Health Check** | http://localhost:8000/health | — |
| **pgAdmin** | http://localhost:5050 | `admin@bank.com` / `PgAdminPass2024!` |

### Default Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@1234` |
| Maker | `maker1` | `Maker@1234` |
| Checker | `checker1` | `Checker@1234` |
| Approver | `approver1` | `Approver@1234` |

> ⚠️ **Change these credentials in production.**

### Stop Services

```bash
docker compose down
```

### View Logs

```bash
docker compose logs -f api
docker compose logs -f postgres
```

---

## 💻 Local Development

### Without Docker

#### 1. Create Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Configure PostgreSQL

Install PostgreSQL 15+ locally, then create a database:

```bash
psql -U postgres -c "CREATE DATABASE banking_workflow;"
psql -U postgres -c "CREATE USER bank_user WITH PASSWORD 'bank_password';"
psql -U postgres -c "ALTER USER bank_user WITH ENCRYPTED PASSWORD 'bank_password';"
```

#### 4. Configure Environment

```bash
cp .env.example .env
```

Update `.env`:
```env
DATABASE_URL=postgresql+asyncpg://bank_user:bank_password@localhost:5432/banking_workflow
DEBUG=true
```

#### 5. Run Migrations

```bash
alembic upgrade head
```

#### 6. Seed Test Data

```bash
python scripts/seed.py
```

#### 7. Start Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The server will watch for file changes and auto-reload.

---

## 🗂️ Project Structure

```
banking-workflow/
│
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py              # Authentication endpoints
│   │       │   ├── users.py             # User CRUD (Admin only)
│   │       │   ├── loans.py             # Loan workflow endpoints
│   │       │   ├── notifications.py     # Notification endpoints
│   │       │   ├── audit.py             # Audit trail endpoints
│   │       │   └── dashboard.py         # Analytics & KPI endpoints
│   │       └── router.py                # API router configuration
│   │
│   ├── core/
│   │   ├── config.py                    # Settings & env configuration
│   │   └── security.py                  # JWT, RBAC, hashing utilities
│   │
│   ├── db/
│   │   └── session.py                   # Async SQLAlchemy setup
│   │
│   ├── models/
│   │   └── models.py                    # ORM models (User, LoanRequest, etc.)
│   │
│   ├── schemas/
│   │   └── schemas.py                   # Pydantic request/response schemas
│   │
│   ├── services/
│   │   ├── user_service.py              # User business logic
│   │   ├── loan_service.py              # Loan business logic
│   │   ├── workflow_engine.py           # State machine implementation
│   │   ├── validation_service.py        # Input validation logic
│   │   ├── rules_engine.py              # Business rules evaluation
│   │   ├── risk_service.py              # Risk scoring algorithm
│   │   ├── notification_service.py      # Notification dispatch
│   │   └── audit_service.py             # Audit logging
│   │
│   └── main.py                          # FastAPI application entry point
│
├── alembic/
│   ├── versions/
│   │   └── 0001_initial.py              # Initial schema migration
│   ├── env.py                           # Alembic environment config
│   ├── script.py.mako                   # Migration template
│   └── alembic.ini                      # Alembic configuration
│
├── scripts/
│   ├── seed.py                          # Populate test data
│   └── init_db.sql                      # SQL initialization (optional)
│
├── Dockerfile                            # Container image definition
├── docker-compose.yml                    # Multi-container orchestration
├── gunicorn.conf.py                      # Production server config
├── requirements.txt                      # Python dependencies
├── .env.example                          # Environment template
├── .gitignore                            # Git ignore rules
├── README.md                             # This file
└── LICENSE                               # MIT license

```

---

## 🔌 API Documentation

### Authentication

#### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maker1",
    "password": "Maker@1234"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### Get Current User

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "id": 1,
  "username": "maker1",
  "email": "maker@bank.com",
  "role": "MAKER",
  "is_active": true
}
```

### Loan Management

#### Create Loan Request (Maker)

```bash
curl -X POST http://localhost:8000/api/v1/loans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "John Doe",
    "national_id": "29901011234567",
    "email": "john@example.com",
    "phone": "+201001234567",
    "monthly_salary": 12000,
    "employment_type": "EMPLOYED",
    "loan_amount": 150000,
    "loan_tenure_months": 60,
    "loan_purpose": "Home renovation"
  }'
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "applicant_name": "John Doe",
  "national_id": "29901011234567",
  "status": "INITIATED",
  "loan_amount": 150000,
  "loan_tenure_months": 60,
  "risk_score": null,
  "risk_level": null,
  "created_at": "2026-05-12T10:30:00Z",
  "created_by": "maker1"
}
```

#### Get Loan Details

```bash
curl -X GET http://localhost:8000/api/v1/loans/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### List All Loans (Checker/Approver/Admin only)

```bash
curl -X GET "http://localhost:8000/api/v1/loans?status=RISK_ASSESSED&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Approve or Reject Loan (Approver)

```bash
curl -X POST http://localhost:8000/api/v1/loans/1/action \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "APPROVE",
    "reason": "All criteria met. Risk level acceptable."
  }'
```

**Response:**
```json
{
  "id": 1,
  "status": "APPROVED",
  "approved_at": "2026-05-12T11:00:00Z",
  "approved_by": "approver1",
  "approval_reason": "All criteria met. Risk level acceptable."
}
```

### Dashboard & Analytics

#### Get Dashboard Statistics

```bash
curl -X GET http://localhost:8000/api/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "total_loans": 50,
  "approved_count": 30,
  "rejected_count": 10,
  "pending_count": 10,
  "approval_rate": 0.75,
  "average_processing_days": 3.2,
  "risk_distribution": {
    "LOW": 25,
    "MEDIUM": 15,
    "HIGH": 10
  }
}
```

### Audit & Compliance

#### Get Audit Trail

```bash
curl -X GET "http://localhost:8000/api/v1/audit/logs?entity_type=LOAN&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "entity_type": "LOAN",
      "entity_id": 1,
      "action": "CREATED",
      "changes": {
        "status": ["INITIATED"]
      },
      "user": "maker1",
      "timestamp": "2026-05-12T10:30:00Z"
    }
  ],
  "total": 50,
  "page": 1
}
```

---

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Application
APP_NAME=Banking Workflow System
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-change-in-production

# Database
DATABASE_URL=postgresql+asyncpg://bank_user:bank_password@localhost:5432/banking_workflow
POSTGRES_USER=bank_user
POSTGRES_PASSWORD=bank_password
POSTGRES_DB=banking_workflow
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Security
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# pgAdmin (Development)
PGADMIN_DEFAULT_EMAIL=admin@bank.com
PGADMIN_DEFAULT_PASSWORD=PgAdminPass2024!

# Logging
LOG_LEVEL=INFO
```

### Environment Variables Explained

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | — | JWT signing key (MUST be random and strong) |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT expiration time |
| `DEBUG` | `false` | Enable/disable debug mode |
| `ALLOWED_ORIGINS` | `localhost:3000` | CORS allowed origins (comma-separated) |

---

## 🗄️ Database Migrations

### Using Alembic

#### View Current Version

```bash
alembic current
```

#### Apply All Pending Migrations

```bash
alembic upgrade head
```

#### Apply Specific Number of Migrations

```bash
alembic upgrade +2
```

#### Rollback One Migration

```bash
alembic downgrade -1
```

#### Create New Migration

```bash
alembic revision --autogenerate -m "add_email_to_users"
```

Review the generated migration in `alembic/versions/` before applying.

#### View Migration History

```bash
alembic history
```

---

## 🔐 Security

### Authentication & Authorization

- **JWT Tokens**: All endpoints (except login, health check) require a valid JWT token in the `Authorization` header
- **Token Format**: `Authorization: Bearer <token>`
- **Token Expiration**: Configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 60 minutes)
- **Password Hashing**: bcrypt with 12 salt rounds

### RBAC Implementation

- Permissions are enforced at the endpoint level using FastAPI dependencies
- Role checks are performed on every request
- Unauthorized requests return `403 Forbidden`

### Data Protection

- Passwords are never logged or returned in API responses
- Sensitive data (national IDs) should use encryption in production
- Audit trail logs all user actions for compliance

### Production Security Checklist

- [ ] **Secret Key**: Generate a random 64-character key:
  ```bash
  openssl rand -hex 32
  ```
- [ ] **Passwords**: Change all default credentials in `.env`
- [ ] **Debug Mode**: Set `DEBUG=false`
- [ ] **Environment**: Set `APP_ENV=production`
- [ ] **HTTPS**: Enable TLS/SSL (use Nginx or load balancer)
- [ ] **Database SSL**: Use SSL connection to PostgreSQL
- [ ] **CORS**: Restrict `ALLOWED_ORIGINS` to your frontend domain only
- [ ] **pgAdmin**: Disable in production or restrict to VPN/internal network
- [ ] **Logs**: Configure proper logging infrastructure (e.g., ELK, Datadog)
- [ ] **Backups**: Set up automated PostgreSQL backups
- [ ] **Monitoring**: Enable error tracking (e.g., Sentry)
- [ ] **Firewall**: Only expose ports 80 (HTTP) and 443 (HTTPS)

---

## 🌐 Production Deployment

### VPS/Linux Server Deployment

#### Prerequisites

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git curl
sudo usermod -aG docker $USER
newgrp docker
```

#### Deploy Application

```bash
# Clone repository
git clone https://github.com/marwan-yasser644/banking-workflow.git /opt/banking-workflow
cd /opt/banking-workflow

# Configure environment
cp .env.example .env
nano .env  # Edit with strong credentials

# Start services
docker compose -f docker-compose.yml up -d --build

# Run migrations
docker compose run --rm api alembic upgrade head

# Seed initial data
docker compose exec api python scripts/seed.py

# Verify
curl http://localhost:8000/health
```

### Systemd Service (Auto-start on Reboot)

Create `/etc/systemd/system/banking-workflow.service`:

```ini
[Unit]
Description=Banking Workflow Automation System
After=docker.service
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/opt/banking-workflow
ExecStart=/usr/bin/docker compose up
ExecStop=/usr/bin/docker compose down
Restart=always
RestartSec=10s
User=root

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable banking-workflow
sudo systemctl start banking-workflow
```

### Nginx Reverse Proxy (HTTPS)

Create `/etc/nginx/sites-available/banking-workflow`:

```nginx
upstream banking_workflow_backend {
    server 127.0.0.1:8000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy Configuration
    location / {
        proxy_pass http://banking_workflow_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 60s;
    }

    # Health check endpoint (no logging)
    location /health {
        proxy_pass http://banking_workflow_backend;
        access_log off;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/banking-workflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

### Database Backup Strategy

Automated daily backups:

```bash
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/banking_workflow_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR
docker compose exec -T postgres pg_dump -U bank_user banking_workflow | gzip > $BACKUP_FILE
find $BACKUP_DIR -type f -mtime +30 -delete  # Keep last 30 days
EOF

chmod +x /usr/local/bin/backup-db.sh
```

Add to crontab:

```bash
0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 📈 Monitoring & Logging

### Application Logs

View logs from all services:

```bash
docker compose logs -f
```

View specific service logs:

```bash
docker compose logs -f api
docker compose logs -f postgres
```

### Health Check Endpoint

```bash
curl http://localhost:8000/health
```

### Recommended Monitoring Setup

- **Metrics**: Prometheus + Grafana for system and application metrics
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana) or Datadog
- **Error Tracking**: Sentry for exception monitoring
- **Uptime**: Uptime Robot or similar for endpoint monitoring

---

## 🚧 Future Improvements

- [ ] **Loan Refinancing**: Support loan modification and refinancing requests
- [ ] **Bulk Operations**: Batch loan creation and approval workflows
- [ ] **Advanced Analytics**: Machine learning-based risk prediction
- [ ] **Webhook Events**: Event-driven integrations with external systems
- [ ] **Multi-Currency Support**: Handle loans in multiple currencies
- [ ] **Document Management**: Upload and store loan documents (KYC, income proof)
- [ ] **Email Notifications**: SMTP integration for email alerts
- [ ] **SMS Notifications**: Twilio integration for SMS notifications
- [ ] **GraphQL API**: GraphQL endpoint alongside REST API
- [ ] **Rate Limiting**: API rate limiting per user/role
- [ ] **Caching**: Redis caching for frequently accessed data
- [ ] **Microservices**: Refactor into microservices architecture
- [ ] **Mobile App**: Native iOS/Android mobile application
- [ ] **Blockchain Integration**: Immutable audit trail via distributed ledger
- [ ] **API Keys**: API key authentication for third-party integrations

---

## 📸 Screenshots Placeholder

> Screenshots showcasing the Swagger UI, dashboard, and API responses will be added here in future versions.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Marwan Yasser**

- GitHub: [@marwan-yasser644](https://github.com/marwan-yasser644)
- Email: [contact@marwan.dev](contact:marawanyasser644@gmail.com)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please feel free to check the [issues page](../../issues) or open a pull request.

---

## ⭐ Show Your Support

If this project helped you, please consider giving it a star! ⭐

---

**Built with ❤️ for modern banking systems**
