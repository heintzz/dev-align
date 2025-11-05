# EC2 Setup Troubleshooting Guide

## Common Issues and Fixes

### Issue 1: Docker Permission Denied

**Error:**
```
permission denied while trying to connect to the Docker daemon socket
```

**Cause:** User not in docker group

**Fix:**
```bash
# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# IMPORTANT: Logout and login again for changes to take effect
exit

# SSH back in
ssh -i devalign-be-key.pem ubuntu@13.250.231.18

# Verify docker works without sudo
docker ps
docker compose version
```

---

### Issue 2: Repository Already Exists

**Error:**
```
fatal: destination path 'DevAlign' already exists and is not an empty directory
```

**Cause:** Repository was already cloned before

**Fix Option 1 - Update Existing Repository (Recommended):**
```bash
cd /var/www/backend/DevAlign

# Discard any local changes
git reset --hard

# Pull latest changes
git fetch origin dev
git checkout dev
git pull origin dev
```

**Fix Option 2 - Fresh Clone:**
```bash
cd /var/www/backend

# Remove existing directory
rm -rf DevAlign

# Clone again
git clone -b dev https://github.com/PentabyteDevAlign/DevAlign.git
```

---

### Issue 3: Environment Files Not Found

**Error:**
```
cp: cannot stat '/var/www/backend/.env.backend': No such file or directory
```

**Fix:**
```bash
# Create Backend environment file
sudo nano /var/www/backend/.env.backend

# Paste this template and fill in your values:
PORT=5000
CLIENT_URL=http://18.141.166.14
BASE_AI_URL=http://ai-backend:8000
JWT_SECRET=Q5z2fcaLrS_XtTGqtxNsM5mUZy6PdMDibR-MJqhYkkoPTW0zXEvUs14UdpS6lqhvjiScvFA7jvBfWexvHChUNA
MONGO_URI=mongodb+srv://dev-align-database:HgspLtpdcHOIm5Pv@capstone-cluster.t8phj3m.mongodb.net/dev-align?retryWrites=true&w=majority
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SERVICE=gmail
EMAIL_USER=muhammadhasnan033@gmail.com
EMAIL_PASS=rqdf uduy fpio uwld

# Save: Ctrl+X, then Y, then Enter

# Create AI environment file
sudo nano /var/www/backend/.env.ai

# Paste this template:
LLM_MODEL_CV=openai/gpt-oss-20b
LLM_BASE_URL_CV=https://mlapi.run/074881af-991b-4237-b58a-5e8a39b225f4/v1
EMBEDDING_MODEL=openai/text-embedding-3-small
EMBEDDING_MODEL_BASE_URL=https://mlapi.run/b54ff33e-6d14-42df-93f9-0f1132160ee8/v1
LLM_MODEL_ROSTER=openai/gpt-4.1-nano
LLM_BASE_URL_ROSTER=https://mlapi.run/e95d2ecf-dadc-4050-8ed3-ca30687a5f8a/v1
LLM_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjE4NjcyODksIm5iZiI6MTc2MTg2NzI4OSwia2V5X2lkIjoiZDRhYTE0NjQtZmU5Yy00YjgyLWE1YmEtZDZlZmNlYjM1NmM1In0.OaxLixmaS_hXZj__fcgXqAxAiC5cnO6_qxklLj7rxMQ
MONGO_URI=mongodb+srv://dev-align-database:HgspLtpdcHOIm5Pv@capstone-cluster.t8phj3m.mongodb.net/dev-align?retryWrites=true&w=majority

# Save: Ctrl+X, then Y, then Enter
```

---

### Issue 4: Missing Module 'swagger-jsdoc'

**Error:**
```
Error: Cannot find module 'swagger-jsdoc'
```

**Cause:** Swagger packages were in `devDependencies` but are needed at runtime

**Fix:**
This has been fixed in the repository. The packages have been moved to `dependencies`.

If you still see this error:
```bash
cd /var/www/backend/DevAlign

# Pull latest changes (includes the fix)
git pull origin dev

# Rebuild containers
docker compose down
docker compose up -d --build

# Or manually install if needed
cd Backend
npm install
```

**Note:** The fix moved these packages from `devDependencies` to `dependencies`:
- `swagger-jsdoc`
- `swagger-ui-express`
- `nodemon`

---

## Complete Fix for Your Current Issue

Based on your screenshot, here's the exact sequence of commands:

```bash
# 1. Exit current SSH session
exit

# 2. SSH back to apply docker group changes
ssh -i devalign-be-key.pem ubuntu@13.250.231.18

# 3. Navigate to backend directory
cd /var/www/backend

# 4. The DevAlign directory already exists, so just update it
cd DevAlign
git fetch origin dev
git reset --hard origin/dev
git pull origin dev

# 5. Copy environment files to the right locations
cp /var/www/backend/.env.backend Backend/.env
cp /var/www/backend/.env.ai AI/.env

# 6. Now try Docker Compose (should work without sudo)
docker compose up -d --build

# 7. Check status
docker compose ps

# 8. View logs
docker compose logs -f
```

---

## Step-by-Step Recovery Script

If you want to start fresh, use this complete recovery script:

```bash
#!/bin/bash
# Run this on Backend EC2

echo "🔧 Fixing Backend EC2 Setup..."

# Fix Docker permissions
echo "1. Adding user to docker group..."
sudo usermod -aG docker ubuntu

echo "⚠️  You need to logout and login for docker group to take effect"
echo "After re-login, run the commands below:"
echo ""
echo "cd /var/www/backend/DevAlign"
echo "git pull origin dev"
echo "cp /var/www/backend/.env.backend Backend/.env"
echo "cp /var/www/backend/.env.ai AI/.env"
echo "docker compose up -d --build"
echo "docker compose ps"
```

---

## Verify Everything Works

After applying the fixes:

```bash
# 1. Check Docker works without sudo
docker ps

# 2. Check repository is up to date
cd /var/www/backend/DevAlign
git status
git log -1

# 3. Check environment files exist
ls -la /var/www/backend/.env.backend
ls -la /var/www/backend/.env.ai

# 4. Check environment files are copied to project
ls -la Backend/.env
ls -la AI/.env

# 5. Start services
docker compose up -d --build

# 6. Check containers are running
docker compose ps

# 7. Check logs
docker compose logs backend
docker compose logs ai-backend

# 8. Test endpoints
curl http://localhost:5000/api/health
curl http://localhost:8000/health
```

---

## Quick Reference Commands

```bash
# Docker management (no sudo needed after fix)
docker compose ps                    # Check status
docker compose logs -f               # View logs
docker compose restart               # Restart all
docker compose down                  # Stop all
docker compose up -d                 # Start all
docker compose up -d --build         # Rebuild and start

# Repository management
cd /var/www/backend/DevAlign
git status                           # Check status
git pull origin dev                  # Update code
git log -1                           # Last commit

# Environment files
cat /var/www/backend/.env.backend    # View backend env
cat /var/www/backend/.env.ai         # View AI env
nano /var/www/backend/.env.backend   # Edit backend env
nano /var/www/backend/.env.ai        # Edit AI env
```

---

## Prevention Tips

1. **Always logout/login after adding user to docker group**
2. **Keep environment files in `/var/www/backend/`** - not in the repository
3. **Use `git pull` instead of `git clone`** if directory exists
4. **Check `docker ps`** before running docker compose commands

---

## If Nothing Works - Nuclear Option

Complete reset (use as last resort):

```bash
# Stop everything
cd /var/www/backend/DevAlign
docker compose down 2>/dev/null || true

# Clean Docker
docker system prune -a -f

# Remove repository
cd /var/www/backend
rm -rf DevAlign

# Fresh clone
git clone -b dev https://github.com/PentabyteDevAlign/DevAlign.git

# Copy environment files
cp /var/www/backend/.env.backend DevAlign/Backend/.env
cp /var/www/backend/.env.ai DevAlign/AI/.env

# Start services
cd DevAlign
docker compose up -d --build
```

---

**Last Updated**: 2025-11-05
