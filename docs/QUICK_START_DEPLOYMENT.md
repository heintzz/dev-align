# DevAlign CI/CD Quick Start Guide

## 🎯 Goal

Automatically deploy DevAlign to AWS EC2 whenever you push to the `dev` branch.

---

## ⚡ Quick Setup (5 Steps)

### Step 1: Setup EC2 Instances (One-time)

#### Backend EC2 (13.250.231.18)

```bash
# SSH to backend server
ssh -i devalign-be-key.pem ubuntu@13.250.231.18

# Download and run setup script
wget https://raw.githubusercontent.com/PentabyteDevAlign/DevAlign/dev/scripts/setup-backend-ec2.sh
sudo bash setup-backend-ec2.sh

# Create environment files
sudo nano /var/www/backend/.env.backend
# Paste your backend environment variables

sudo nano /var/www/backend/.env.ai
# Paste your AI backend environment variables

# Copy env files and start services
cd /var/www/backend/DevAlign
cp /var/www/backend/.env.backend Backend/.env
cp /var/www/backend/.env.ai AI/.env
docker compose up -d --build

# Verify
docker compose ps
```

#### Frontend EC2 (18.141.166.14)

```bash
# SSH to frontend server
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14

# Download and run setup script
wget https://raw.githubusercontent.com/PentabyteDevAlign/DevAlign/dev/scripts/setup-frontend-ec2.sh
sudo bash setup-frontend-ec2.sh

# Create environment file
sudo nano /var/www/frontend/.env.production
# Add: VITE_API_URL=http://13.250.231.18:5000

# Build and deploy
cd /var/www/frontend/DevAlign/Frontend
cp /var/www/frontend/.env.production .env.production
npm install
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx

# Verify
curl http://18.141.166.14
```

### Step 2: Add GitHub Secrets

Go to: `GitHub Repository → Settings → Secrets and variables → Actions`

Add these 4 secrets:

| Secret Name | Value |
|-------------|-------|
| `BACKEND_HOST` | `13.250.231.18` |
| `BACKEND_SSH_KEY` | Contents of `devalign-be-key.pem` file |
| `FRONTEND_HOST` | `18.141.166.14` |
| `FRONTEND_SSH_KEY` | Contents of `devalign-fe-key.pem` file |

**To get SSH key contents:**
```bash
cat devalign-be-key.pem
# Copy everything including -----BEGIN and -----END lines
```

### Step 3: Push Workflows to GitHub

```bash
# Make sure you're on feat/cicd branch
git checkout feat/cicd

# Add the workflow files
git add .github/workflows/
git add docs/
git add scripts/
git commit -m "Setup CI/CD pipeline for auto-deployment"
git push origin feat/cicd

# Merge to dev branch to activate CI/CD
git checkout dev
git merge feat/cicd
git push origin dev
```

### Step 4: Test Deployment

Make a simple change and push to dev:

```bash
# Make a small change (e.g., add a comment in Backend/index.js)
git add .
git commit -m "Test CI/CD pipeline"
git push origin dev
```

### Step 5: Monitor Deployment

1. Go to GitHub → Your Repository → **Actions** tab
2. You'll see the deployment workflow running
3. Click on it to see real-time logs
4. Wait 2-5 minutes for deployment to complete

**Verify deployment:**
- Backend: http://13.250.231.18:5000
- Frontend: http://18.141.166.14

---

## 🔄 How to Deploy (After Setup)

Simply push to dev branch:

```bash
git add .
git commit -m "Your changes"
git push origin dev
```

**That's it!** GitHub Actions will automatically:
- ✅ Detect what changed (Backend, Frontend, or both)
- ✅ Deploy to the appropriate EC2 instance(s)
- ✅ Show deployment progress in Actions tab
- ✅ Complete in 2-5 minutes

---

## 🎯 What Gets Deployed When

| You Change | Triggers | Result |
|-----------|----------|--------|
| `Backend/**` | Backend workflow | Backend API + AI Backend redeploy with Docker |
| `AI/**` | Backend workflow | Backend API + AI Backend redeploy with Docker |
| `Frontend/**` | Frontend workflow | Frontend rebuilds and redeploys to Nginx |
| Both | Both workflows | Both services redeploy (runs in parallel) |

---

## 📊 Checking Deployment Status

### Via GitHub (Recommended)

1. Go to GitHub → Actions tab
2. See running/completed workflows
3. Green ✓ = success, Red ✗ = failed
4. Click for detailed logs

### Via SSH

**Backend:**
```bash
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
cd /var/www/backend/DevAlign
docker compose ps
docker compose logs -f backend
```

**Frontend:**
```bash
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
```

---

## 🐛 Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**
1. Go to Actions tab
2. Click the failed workflow
3. Expand the failed step
4. Read error message

**Common Issues:**

| Error | Solution |
|-------|----------|
| SSH connection failed | Verify GitHub secrets are correct |
| Permission denied | Check SSH key permissions |
| Docker build failed | Check Dockerfile and dependencies |
| npm build failed | Check for TypeScript/build errors |
| Port already in use | Restart EC2 or kill the process |

### Backend Not Working

```bash
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
cd /var/www/backend/DevAlign

# Check containers
docker compose ps

# View logs
docker compose logs backend
docker compose logs ai-backend

# Restart
docker compose restart
```

### Frontend Not Working

```bash
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14

# Check Nginx
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

### Rollback to Previous Version

```bash
# Backend
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
cd /var/www/backend
rm -rf DevAlign
mv DevAlign-backup DevAlign
cd DevAlign
docker compose up -d

# Frontend
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
cd /var/www/frontend
rm -rf DevAlign
mv DevAlign-backup DevAlign
cd DevAlign/Frontend
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

---

## 🔒 Security Checklist

- ✅ GitHub Secrets configured (SSH keys)
- ✅ Environment files NOT in Git (`.env` in `.gitignore`)
- ✅ EC2 Security Groups configured (ports 22, 80, 5000, 8000)
- ✅ SSH keys stored securely (not in repository)
- ✅ Firewall enabled on EC2 (UFW)

---

## 📚 Documentation

- **Full Deployment Guide**: [docs/DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Backend Setup Script**: [scripts/setup-backend-ec2.sh](../scripts/setup-backend-ec2.sh)
- **Frontend Setup Script**: [scripts/setup-frontend-ec2.sh](../scripts/setup-frontend-ec2.sh)

---

## 🎉 Summary

**Before CI/CD:**
1. SSH to EC2 ❌
2. Pull code manually ❌
3. Build manually ❌
4. Restart services ❌
5. Repeat for each server ❌

**After CI/CD:**
1. Push to `dev` branch ✅
2. Everything else is automatic! ✅

**Result:**
- ⚡ 10x faster deployments
- 🎯 Zero manual steps
- 🐛 Fewer human errors
- 📊 Deployment history in GitHub
- 🔄 Easy rollbacks

---

**Happy Deploying! 🚀**
