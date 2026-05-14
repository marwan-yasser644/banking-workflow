# Banking Workflow Automation System

Production-ready banking workflow system built with FastAPI, PostgreSQL, SQLAlchemy, and JWT authentication.

---

## Project Structure

```
banking-workflow/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py          # JWT login, /me
│   │       │   ├── users.py         # User CRUD (Admin only)
│   │       │   ├── loans.py         # Loan request lifecycle
│   │       │   ├── notifications.py # User notifications
│   │       │   ├── audit.py         # Audit trail
│   │       │   └── dashboard.py     # KPI stats
│   │       └── router.py
│   ├── core/
│   │   ├── config.py                # Settings from .env
│   │   └── security.py              # JWT, RBAC, password hashing
│   ├── db/
│   │   └── session.py               # Async SQLAlchemy engine
│   ├── models/
│   │   └── models.py                # ORM models (User, LoanRequest, ...)
│   ├── schemas/
│   │   └── schemas.py               # Pydantic v2 schemas
│   ├── services/
│   │   ├── user_service.py
│   │   ├── loan_service.py
│   │   ├── workflow_engine.py       # State machine
│   │   ├── validation_service.py    # Input validation
│   │   ├── rules_engine.py          # Business rules
│   │   ├── risk_service.py          # Risk scoring
│   │   ├── notification_service.py
│   │   └── audit_service.py
│   └── main.py                      # FastAPI app entry point
├── alembic/
│   ├── versions/
│   │   └── 0001_initial.py          # Initial migration
│   ├── env.py
│   └── script.py.mako
├── scripts/
│   ├── seed.py                      # Seed users + test data
│   └── init_db.sql                  # PostgreSQL init
├── Dockerfile
├── docker-compose.yml
├── gunicorn.conf.py
├── requirements.txt
├── alembic.ini
└── .env.example
```

---

## Workflow States

```
INITIATED → VALIDATED → RULE_CHECKED → RISK_ASSESSED → APPROVED
                                                      ↘ REJECTED
```

- **INITIATED → VALIDATED**: Validates national ID, salary, loan parameters
- **VALIDATED → RULE_CHECKED**: Runs business rules (min salary, DTI, LTS ratio, employment)
- **RULE_CHECKED → RISK_ASSESSED**: Computes risk score (LOW/MEDIUM/HIGH)
- **RISK_ASSESSED → APPROVED/REJECTED**: Manual action by Approver/Admin

Transitions run **automatically** when a loan is submitted.

---

## Roles & Permissions

| Role     | Create Loan | View All | Approve/Reject | Manage Users | Dashboard |
|----------|-------------|----------|----------------|--------------|-----------|
| MAKER    | ✅          | Own only | ❌             | ❌           | ❌        |
| CHECKER  | ❌          | ✅        | ❌             | ❌           | ✅        |
| APPROVER | ❌          | ✅        | ✅             | ❌           | ✅        |
| ADMIN    | ✅          | ✅        | ✅             | ✅           | ✅        |

---

## Quick Start — Docker (Local)

### 1. Clone & configure

```bash
git clone <repo>
cd banking-workflow
cp .env.example .env
# Edit .env and change SECRET_KEY and passwords
```

### 2. Build & start all services

```bash
docker compose up --build -d
```

### 3. Run migrations

```bash
docker compose run --rm migrate
```

### 4. Seed initial data

```bash
docker compose exec api python scripts/seed.py
```

### 5. Access the system

| Service  | URL                          |
|----------|------------------------------|
| API      | http://localhost:8000        |
| Swagger  | http://localhost:8000/docs   |
| ReDoc    | http://localhost:8000/redoc  |
| pgAdmin  | http://localhost:5050        |
| Health   | http://localhost:8000/health |

### Default Credentials

| Role     | Username  | Password      |
|----------|-----------|---------------|
| Admin    | admin     | Admin@1234    |
| Maker    | maker1    | Maker@1234    |
| Checker  | checker1  | Checker@1234  |
| Approver | approver1 | Approver@1234 |

pgAdmin: admin@bank.com / PgAdminPass2024!

---

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "maker1", "password": "Maker@1234"}'
```

### Create Loan Request (Maker)
```bash
TOKEN="<your_token>"
curl -X POST http://localhost:8000/api/v1/loans/ \
  -H "Authorization: Bearer $TOKEN" \
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

### Approve Loan (Approver)
```bash
curl -X POST http://localhost:8000/api/v1/loans/1/action \
  -H "Authorization: Bearer $APPROVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "APPROVE", "reason": "All criteria met"}'
```

### Dashboard Stats (Admin/Checker/Approver)
```bash
curl http://localhost:8000/api/v1/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## VPS / Linux Server Deployment

### Prerequisites
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER
newgrp docker
```

### Deploy
```bash
git clone <repo> /opt/banking-workflow
cd /opt/banking-workflow
cp .env.example .env
# IMPORTANT: Set strong SECRET_KEY and passwords in .env
nano .env

docker compose -f docker-compose.yml up -d --build
docker compose run --rm migrate
docker compose exec api python scripts/seed.py
```

### Systemd Service (Optional)
```bash
cat > /etc/systemd/system/banking-workflow.service << EOF
[Unit]
Description=Banking Workflow System
After=docker.service
Requires=docker.service

[Service]
WorkingDirectory=/opt/banking-workflow
ExecStart=/usr/bin/docker compose up
ExecStop=/usr/bin/docker compose down
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl enable banking-workflow
systemctl start banking-workflow
```

### Nginx Reverse Proxy (Production)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

---

## Security Best Practices (Production Checklist)

- [ ] Change `SECRET_KEY` to a random 64-char string: `openssl rand -hex 32`
- [ ] Change all default passwords in `.env`
- [ ] Set `DEBUG=false` and `APP_ENV=production`
- [ ] Use HTTPS (TLS) via Nginx + Let's Encrypt
- [ ] Restrict `ALLOWED_ORIGINS` to your frontend domain
- [ ] Disable pgAdmin in production or restrict its port
- [ ] Use PostgreSQL connection with SSL in production
- [ ] Set up regular DB backups
- [ ] Configure firewall: only expose ports 80/443
- [ ] Enable `PGADMIN` only from internal network or VPN

---

## Development (Local without Docker)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Set up PostgreSQL locally and create .env
export DATABASE_URL="postgresql+asyncpg://user:pass@localhost:5432/banking_workflow"

alembic upgrade head
python scripts/seed.py

uvicorn app.main:app --reload --port 8000
```

---

## Running Migrations

```bash
# Apply all migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "describe_change"

# Rollback one step
alembic downgrade -1

# View current version
alembic current
```
#
