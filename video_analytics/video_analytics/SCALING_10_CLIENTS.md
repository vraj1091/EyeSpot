# Scalable Setup for 10 Clients (Minimum Cost)

This project already supports company-based multi-tenancy (`company_id` on users/cameras), so the cheapest scalable setup is:

- One shared backend
- One shared frontend
- One shared PostgreSQL database
- 10 isolated client companies inside the same app

## 1) What Was Added

- `docker-compose.prod.yml` for production deployment
- `frontend/nginx.prod.conf` to serve UI and proxy API
- `production.env.example` and `backend/env.example` for production variables
- `backend/provision_clients.py` for bulk onboarding clients from CSV
- `backend/clients_10_example.csv` template for 10 clients
- Company management routes are no longer public in production usage (superadmin/auth required)

## 2) Minimum-Cost Architecture

Use one VM (example: 8 vCPU / 16 GB RAM) with Docker:

- `postgres` container (persistent volume)
- `backend` container (FastAPI + detection services)
- `frontend` container (nginx static host)

This avoids per-client servers and keeps monthly cost low.

## 3) First-Time Deployment

From project root:

1. Copy env template:
   - `copy production.env.example .env`
2. Update `.env`:
   - `POSTGRES_PASSWORD` (strong)
   - `SECRET_KEY` (strong)
   - `CORS_ORIGINS` with your frontend domain(s)
3. Start stack:
   - `docker compose -f docker-compose.prod.yml --env-file .env up -d --build`

## 4) Create/Seed Superadmin

Use your existing script inside backend container (example):

- `docker compose -f docker-compose.prod.yml exec backend python create_superadmin.py`

Then login as superadmin from frontend.

## 5) Onboard 10 Clients in One Shot

1. Edit `backend/clients_10_example.csv` with real company/admin details.
2. Run:
   - `docker compose -f docker-compose.prod.yml exec backend python provision_clients.py --csv clients_10_example.csv`

This creates:
- One company per row
- One admin user per company
- Feature toggles per company from CSV

## 6) Security/Isolation Notes

- Company management APIs now require authentication; write operations require superadmin.
- Non-superadmin users can only access their own company data.
- `ALLOW_PUBLIC_COMPANY_BOOTSTRAP` is set to `false` in production compose.
- CORS is restricted by `CORS_ORIGINS` in production.

## 7) Scale Without Big Cost Increase

- Keep single shared deployment up to ~10 clients.
- Increase VM size before splitting services.
- Add a second backend replica only when API latency becomes noticeable.
- Keep heavy optional detections (criminal/shoplifting) disabled per client unless needed.

## 8) Recommended Operations

- Daily DB backup (logical dump)
- Monitoring:
  - `GET /health`
  - container restart counts
  - CPU and RAM usage
- Rotate admin passwords and store credentials securely

