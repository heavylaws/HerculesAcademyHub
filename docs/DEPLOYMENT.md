# PeakForm Athletics (Hercules Academy) — Production Deployment Manual

This guide documents the procedures for deploying PeakForm Athletics to production, including containerization, Google Cloud Run, Vercel, and the Convex reactive backend.

---

## 1. System Architecture Overview

PeakForm Athletics consists of two decoupled components:
1. **Frontend Client**: React 19 Single-Page Application (Vite, TailwindCSS, Recharts, Lucide Icons).
2. **Backend Engine**: Convex Serverless Reactive Database & Mutations with Hercules Auth OIDC verification and OpenAI video biomechanics pipeline.

```
                    ┌────────────────────────┐
                    │      Browser User      │
                    └───────────┬────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
       ┌───────────────────┐         ┌───────────────────┐
       │   Frontend SPA    │         │  Hercules Auth    │
       │ (Cloud Run / Nginx│         │   (OIDC Server)   │
       │   or Vercel CDN)  │         └─────────┬─────────┘
       └─────────┬─────────┘                   │
                 │ WebSockets & Queries        │ JWT Verification
                 ▼                             ▼
       ┌─────────────────────────────────────────────────┐
       │             Convex Cloud Deployment             │
       │    (Documents, Realtime Subscriptions, AI)     │
       └─────────────────────────────────────────────────┘
```

---

## 2. Environment Variables Checklist

### Frontend Variables (Embedded during `vite build`)

| Variable | Description | Example Production Value |
| :--- | :--- | :--- |
| `VITE_LOCAL_DEV` | Must be set to `false` in production | `false` |
| `VITE_CONVEX_URL` | Production Convex deployment URL | `https://peakform-production.convex.cloud` |
| `VITE_HERCULES_OIDC_AUTHORITY` | Production OIDC issuer URL | `https://01m1maqj19rrqvx7arxzrp6hdc.hercules-auth.com` |
| `VITE_HERCULES_OIDC_CLIENT_ID` | Registered Client ID | `01M1MAQJ35TDC0XSZFK4F5FCFQ` |
| `VITE_HERCULES_WEBSITE_ID` | Site identification tag | `peakform-athletics` |

### Convex Backend Variables (`npx convex env set <KEY> <VAL>`)

| Variable | Description |
| :--- | :--- |
| `HERCULES_OIDC_AUTHORITY` | Same issuer URL for JWT cryptographic verification |
| `HERCULES_OIDC_CLIENT_ID` | Client ID matching frontend audience |
| `HERCULES_API_KEY` | API token for OpenAI biomechanics video analysis |

---

## 3. Option A: Container Deployment (Docker / Google Cloud Run)

### Local Docker Verification
Test the production container locally:
```bash
# 1. Build container image
docker build -t peakform-athletics:local .

# 2. Run container on port 8080
docker run -d -p 8080:80 --name peakform peakform-athletics:local

# 3. Test health check
curl http://localhost:8080/healthz
# Returns: healthy
```

### Google Cloud Run Deployment
Deploy via automated script:

**On Linux/macOS:**
```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
chmod +x scripts/deploy-cloudrun.sh
./scripts/deploy-cloudrun.sh
```

**On Windows (PowerShell):**
```powershell
.\scripts\deploy-cloudrun.ps1 -ProjectId "your-gcp-project-id" -Region "us-central1"
```

---

## 4. Option B: Vercel Zero-Config Deployment

The repository includes a production-ready `vercel.json` with SPA routing and HTTP cache headers:

1. Import the repository into your Vercel Dashboard.
2. Configure **Build Command**: `npm run build` or `pnpm build`.
3. Set **Output Directory**: `dist`.
4. Add the frontend environment variables from Section 2.
5. Deploy.

---

## 5. Convex Backend Production Deployment

To publish database schemas, indexes, and serverless mutations to Convex production:

```bash
# 1. Log in to Convex CLI
npx convex login

# 2. Deploy to production environment
npx convex deploy

# 3. Set production backend environment keys
npx convex env set HERCULES_OIDC_AUTHORITY https://01m1maqj19rrqvx7arxzrp6hdc.hercules-auth.com
npx convex env set HERCULES_OIDC_CLIENT_ID 01M1MAQJ35TDC0XSZFK4F5FCFQ
npx convex env set HERCULES_API_KEY "your-ai-gateway-key"
```

---

## 6. OIDC Redirect URI Whitelist

After deploying the frontend (e.g. `https://peakform.app`), register the callback URL in Hercules Auth console:
* `https://peakform.app/auth/callback`
* `https://peakform.app/`
