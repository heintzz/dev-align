# DevAlign Deployment Guide

## Overview

This guide explains how to set up and use the CI/CD pipeline for DevAlign, which automatically deploys your application to AWS EC2 instances when you push to the `dev` branch.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                  (PentabyteDevAlign/DevAlign)               │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   │ Push/Merge to 'dev' branch
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Actions CI/CD                       │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Backend Workflow    │  │  Frontend Workflow   │        │
│  │  (Docker Compose)    │  │  (Nginx Static)      │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────┬─────────────────────────────┬────────────────────┘
          │                             │
          │                             │
          ▼                             ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│  Backend EC2 Instance   │  │  Frontend EC2 Instance  │
│  13.250.231.18          │  │  18.141.166.14          │
│                         │  │                         │
│  ┌──────────────────┐   │  │  ┌──────────────────┐  │
│  │  Docker Compose  │   │  │  │  Nginx Server    │  │
│  │  ├─ Backend API  │   │  │  │  (Serves React)  │  │
│  │  │  (Port 5000)  │   │  │  │                  │  │
│  │  └─ AI Backend   │   │  │  │  /api → Backend  │  │
│  │     (Port 8000)  │   │  │  │                  │  │
│  └──────────────────┘   │  │  └──────────────────┘  │
└─────────────────────────┘  └─────────────────────────┘
```

---

## Deployment Servers

### Backend EC2 Instance
- **IP**: 13.250.231.18
- **Key**: devalign-be-key.pem
- **Services**:
  - Backend API (Port 5000) - Node.js + Express
  - AI Backend (Port 8000) - Python FastAPI
- **Deployment**: Docker Compose
- **Triggers**: Changes to `Backend/`, `AI/`, `docker-compose.yml`

### Frontend EC2 Instance
- **IP**: 18.141.166.14
- **Key**: devalign-fe-key.pem
- **Services**:
  - Frontend (Port 80) - React + Vite + Nginx
- **Deployment**: Nginx static files
- **Triggers**: Changes to `Frontend/`

---

## Prerequisites

### 1. GitHub Secrets Configuration

You need to add the following secrets to your GitHub repository:

Go to: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description | Value |
|-------------|-------------|-------|
| `BACKEND_HOST` | Backend EC2 IP address | `13.250.231.18` |
| `BACKEND_SSH_KEY` | Private SSH key for backend EC2 | Contents of `devalign-be-key.pem` |
| `FRONTEND_HOST` | Frontend EC2 IP address | `18.141.166.14` |
| `FRONTEND_SSH_KEY` | Private SSH key for frontend EC2 | Contents of `devalign-fe-key.pem` |

**How to add SSH key as secret:**
```bash
# On your local machine
cat devalign-be-key.pem
# Copy the entire output including -----BEGIN and -----END lines
# Paste into GitHub Secret value
```

### 2. EC2 Instance Setup

Both EC2 instances need to be properly configured. See the **EC2 Setup Scripts** section below.

---

## How It Works

### Backend Deployment Workflow

**File**: `.github/workflows/deploy-backend.yml`

**Triggers when**:
- Push or merge to `dev` branch
- Changes detected in: `Backend/`, `AI/`, `docker-compose.yml`, or the workflow file itself

**What it does**:
1. ✅ Connects to Backend EC2 via SSH
2. 📦 Backs up current deployment
3. 📥 Pulls latest code from `dev` branch
4. ⚙️ Copies environment files (`.env`)
5. 🛑 Stops running Docker containers
6. 🔨 Builds and starts new Docker containers
7. 📊 Shows container status and logs

**Result**: Backend API running at `http://13.250.231.18:5000`

### Frontend Deployment Workflow

**File**: `.github/workflows/deploy-frontend.yml`

**Triggers when**:
- Push or merge to `dev` branch
- Changes detected in: `Frontend/` or the workflow file itself

**What it does**:
1. ✅ Connects to Frontend EC2 via SSH
2. 📦 Backs up current deployment
3. 📥 Pulls latest code from `dev` branch
4. ⚙️ Copies production environment file (`.env.production`)
5. 📦 Installs npm dependencies
6. 🔨 Builds production bundle (`npm run build`)
7. 📋 Deploys build to Nginx directory
8. 🔄 Reloads Nginx

**Result**: Frontend running at `http://18.141.166.14`

---

## Environment Files

### Backend Environment Variables

**Location on EC2**: `/var/www/backend/.env.backend`

```env
PORT=5000
CLIENT_URL=http://18.141.166.14
BASE_AI_URL=http://ai-backend:8000
JWT_SECRET=your-jwt-secret
MONGO_URI=your-mongodb-connection-string
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note**: `BASE_AI_URL=http://ai-backend:8000` uses Docker internal networking (container name)

### AI Backend Environment Variables

**Location on EC2**: `/var/www/backend/.env.ai`

```env
LLM_MODEL_CV=openai/gpt-oss-20b
LLM_BASE_URL_CV=https://mlapi.run/your-endpoint/v1
EMBEDDING_MODEL=openai/text-embedding-3-small
EMBEDDING_MODEL_BASE_URL=https://mlapi.run/your-endpoint/v1
LLM_MODEL_ROSTER=openai/gpt-4.1-nano
LLM_BASE_URL_ROSTER=https://mlapi.run/your-endpoint/v1
LLM_API_KEY=your-api-key
MONGO_URI=your-mongodb-connection-string
```

### Frontend Environment Variables

**Location on EC2**: `/var/www/frontend/.env.production`

```env
VITE_API_URL=http://13.250.231.18:5000
```

**Note**: This file is used during build time by Vite. The API URL points to the backend EC2 instance.

---

## How to Deploy

### Automatic Deployment (Recommended)

Simply push or merge your changes to the `dev` branch:

```bash
# Make your changes
git add .
git commit -m "Your commit message"

# Push to dev branch
git push origin dev
```

**What happens next:**
1. GitHub Actions automatically detects the push
2. Determines which services changed (Backend, Frontend, or both)
3. Runs the appropriate deployment workflow(s)
4. Shows deployment progress in GitHub Actions tab
5. Deployment completes in 2-5 minutes

### Monitor Deployment Progress

1. Go to your GitHub repository
2. Click on **Actions** tab
3. You'll see running/completed workflows
4. Click on a workflow to see detailed logs

---

## Manual Deployment (Fallback)

If you need to deploy manually or troubleshoot:

### Backend (SSH to 13.250.231.18)

```bash
# SSH to backend server
ssh -i devalign-be-key.pem ubuntu@13.250.231.18

# Navigate to deployment directory
cd /var/www/backend/DevAlign

# Pull latest changes
git pull origin dev

# Copy environment files
cp /var/www/backend/.env.backend Backend/.env
cp /var/www/backend/.env.ai AI/.env

# Restart containers
docker compose down
docker compose up -d --build

# Check status
docker compose ps
docker compose logs -f backend
```

### Frontend (SSH to 18.141.166.14)

```bash
# SSH to frontend server
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14

# Navigate to deployment directory
cd /var/www/frontend/DevAlign/Frontend

# Pull latest changes
git pull origin dev

# Copy environment file
cp /var/www/frontend/.env.production .env.production

# Build
npm install
npm run build

# Deploy to Nginx
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

---

## Troubleshooting

### Backend Issues

**Problem**: Containers not starting

```bash
# SSH to backend EC2
ssh -i devalign-be-key.pem ubuntu@13.250.231.18

# Check container logs
cd /var/www/backend/DevAlign
docker compose logs backend
docker compose logs ai-backend

# Restart containers
docker compose restart
```

**Problem**: Port 5000 not accessible

```bash
# Check if containers are running
docker compose ps

# Check port binding
sudo netstat -tulpn | grep 5000

# Check EC2 Security Group - ensure port 5000 is open
```

### Frontend Issues

**Problem**: Website not loading

```bash
# SSH to frontend EC2
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

**Problem**: API calls failing

```bash
# Check if backend is accessible from frontend server
curl http://13.250.231.18:5000/api/health

# Check Nginx proxy configuration
sudo cat /etc/nginx/sites-available/default
```

### Deployment Workflow Issues

**Problem**: GitHub Actions failing

1. Check the Actions tab in GitHub for error logs
2. Common issues:
   - SSH connection failed → Check GitHub secrets
   - Permission denied → Check SSH key and EC2 permissions
   - Build failed → Check code for errors

**Problem**: Changes not deploying

```bash
# Verify webhook triggers
# Check .github/workflows/*.yml paths match your changes

# Force redeploy by pushing to dev
git commit --allow-empty -m "Trigger deployment"
git push origin dev
```

---

## Monitoring

### Check Backend Health

```bash
# Test backend API
curl http://13.250.231.18:5000/api/health

# Check Docker logs
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
docker compose logs -f --tail=100 backend
```

### Check Frontend Health

```bash
# Test frontend
curl http://18.141.166.14

# Check Nginx logs
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
sudo tail -f /var/log/nginx/access.log
```

### Check CI/CD Pipeline

1. Go to GitHub Actions tab
2. Recent deployments are listed
3. Green checkmark = successful
4. Red X = failed (click for logs)

---

## Rollback

If a deployment fails or causes issues:

### Automatic Rollback

The deployment scripts automatically create backups:

```bash
# Backend rollback
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
cd /var/www/backend
rm -rf DevAlign
mv DevAlign-backup DevAlign
cd DevAlign
docker compose up -d

# Frontend rollback
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
cd /var/www/frontend
rm -rf DevAlign
mv DevAlign-backup DevAlign
cd DevAlign/Frontend
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

### Git-based Rollback

```bash
# Revert to previous commit on dev branch
git revert HEAD
git push origin dev

# This will trigger a new deployment with the previous code
```

---

## Security Best Practices

1. **Never commit `.env` files** to the repository
2. **Store sensitive data** in EC2 instances only (`/var/www/*/`)
3. **Rotate SSH keys** periodically
4. **Use GitHub Secrets** for all sensitive values
5. **Keep EC2 Security Groups** restricted to necessary ports
6. **Enable EC2 monitoring** and CloudWatch logs
7. **Use HTTPS** in production (setup SSL certificates)

---

## Performance Tips

1. **Docker Image Caching**: Images are cached between deployments for faster builds
2. **npm Cache**: Node modules are cached to speed up installs
3. **Parallel Deployments**: Backend and Frontend can deploy simultaneously if both changed
4. **Incremental Builds**: Only changed services rebuild

---

## Cost Optimization

1. **Stop EC2 instances** when not in use (development/testing)
2. **Use EC2 auto-shutdown** during non-working hours
3. **Monitor data transfer** costs
4. **Clean up old Docker images**: `docker image prune -a`

---

## Next Steps

### Production Readiness

1. **Setup Domain Names**: Use Route 53 or your DNS provider
2. **Enable HTTPS**: Install SSL certificates (Let's Encrypt)
3. **Setup Load Balancer**: For high availability
4. **Configure Monitoring**: CloudWatch, Datadog, etc.
5. **Setup Backup Strategy**: Database and file backups
6. **Implement Blue-Green Deployment**: Zero-downtime deployments

### Scaling

1. **Add Auto Scaling Groups** for backend
2. **Setup RDS** for managed MongoDB
3. **Use CloudFront** for frontend CDN
4. **Implement Redis** for caching
5. **Setup separate environments**: dev, staging, production

---

## Support

For issues or questions:

1. Check the **Troubleshooting** section above
2. Review **GitHub Actions logs** for deployment errors
3. SSH to EC2 instances and check application logs
4. Contact DevOps team for infrastructure issues

---

**Last Updated**: 2025-11-05
**Branch**: feat/cicd
**Version**: 1.0.0
