# DevAlign EC2 Setup Scripts

This directory contains automated setup scripts for DevAlign EC2 instances.

---

## 📁 Scripts

### 1. setup-backend-ec2.sh

**Purpose**: Sets up Backend EC2 instance (13.250.231.18)

**What it does:**
- ✅ Updates system packages
- ✅ Installs Docker and Docker Compose
- ✅ Creates deployment directory structure
- ✅ Clones repository
- ✅ Configures firewall (UFW)
- ✅ Sets up log rotation
- ✅ Creates helpful aliases

**How to use:**
```bash
# SSH to backend EC2
ssh -i devalign-be-key.pem ubuntu@13.250.231.18

# Download script
wget https://raw.githubusercontent.com/PentabyteDevAlign/DevAlign/dev/scripts/setup-backend-ec2.sh

# Run with sudo
sudo bash setup-backend-ec2.sh
```

**After running:**
1. Create environment files:
   ```bash
   sudo nano /var/www/backend/.env.backend
   sudo nano /var/www/backend/.env.ai
   ```

2. Start services:
   ```bash
   cd /var/www/backend/DevAlign
   cp /var/www/backend/.env.backend Backend/.env
   cp /var/www/backend/.env.ai AI/.env
   docker compose up -d --build
   ```

---

### 2. setup-frontend-ec2.sh

**Purpose**: Sets up Frontend EC2 instance (18.141.166.14)

**What it does:**
- ✅ Updates system packages
- ✅ Installs Node.js 18.x LTS
- ✅ Installs and configures Nginx
- ✅ Creates deployment directory structure
- ✅ Clones repository
- ✅ Configures firewall (UFW)
- ✅ Sets up log rotation
- ✅ Creates helpful aliases

**How to use:**
```bash
# SSH to frontend EC2
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14

# Download script
wget https://raw.githubusercontent.com/PentabyteDevAlign/DevAlign/dev/scripts/setup-frontend-ec2.sh

# Run with sudo
sudo bash setup-frontend-ec2.sh
```

**After running:**
1. Create environment file:
   ```bash
   sudo nano /var/www/frontend/.env.production
   # Add: VITE_API_URL=http://13.250.231.18:5000
   ```

2. Build and deploy:
   ```bash
   cd /var/www/frontend/DevAlign/Frontend
   cp /var/www/frontend/.env.production .env.production
   npm install
   npm run build
   sudo cp -r dist/* /var/www/html/
   sudo systemctl reload nginx
   ```

---

## 🚀 Quick Setup (Both Servers)

### Step 1: Backend EC2
```bash
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
wget https://raw.githubusercontent.com/PentabyteDevAlign/DevAlign/dev/scripts/setup-backend-ec2.sh
sudo bash setup-backend-ec2.sh
```

### Step 2: Frontend EC2
```bash
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
wget https://raw.githubusercontent.com/PentabyteDevAlign/DevAlign/dev/scripts/setup-frontend-ec2.sh
sudo bash setup-frontend-ec2.sh
```

### Step 3: Configure GitHub Secrets
Add to GitHub → Settings → Secrets:
- `BACKEND_HOST`: 13.250.231.18
- `BACKEND_SSH_KEY`: Contents of devalign-be-key.pem
- `FRONTEND_HOST`: 18.141.166.14
- `FRONTEND_SSH_KEY`: Contents of devalign-fe-key.pem

### Step 4: Test
```bash
git push origin dev
# Check GitHub Actions tab for deployment progress
```

---

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually or the scripts fail, see:
- **Full Deployment Guide**: [../docs/DEPLOYMENT_GUIDE.md](../docs/DEPLOYMENT_GUIDE.md)

---

## ⚠️ Important Notes

1. **Run scripts as root**: `sudo bash script.sh`
2. **One-time setup**: Scripts are meant to be run ONCE on fresh EC2 instances
3. **Environment files**: Scripts don't create environment files (they contain secrets)
4. **Backup first**: If running on existing instance, backup your data first
5. **Check logs**: Scripts output detailed logs - save them for reference

---

## 📊 Helpful Aliases (Created by Scripts)

### Backend EC2
```bash
dps              # docker compose ps
dlogs            # docker compose logs -f
dstop            # docker compose down
dstart           # docker compose up -d
drestart         # docker compose restart
drebuild         # docker compose up -d --build
backend          # cd /var/www/backend/DevAlign
```

### Frontend EC2
```bash
nginxreload      # sudo systemctl reload nginx
nginxrestart     # sudo systemctl restart nginx
nginxstatus      # sudo systemctl status nginx
nginxlogs        # sudo tail -f /var/log/nginx/access.log
nginxerrors      # sudo tail -f /var/log/nginx/error.log
frontend         # cd /var/www/frontend/DevAlign/Frontend
deploy           # Full deployment command
```

---

## 🐛 Troubleshooting

### Script fails with "Permission denied"
```bash
# Make script executable
chmod +x setup-*.sh
sudo bash setup-*.sh
```

### Docker command not found after setup
```bash
# Logout and login again to reload group permissions
exit
ssh -i <your-key>.pem ubuntu@<ip-address>
```

### Nginx not starting
```bash
# Check configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

### Docker containers not starting
```bash
cd /var/www/backend/DevAlign

# Check logs
docker compose logs

# Rebuild
docker compose down
docker compose up -d --build
```

---

## 📚 Related Documentation

- **Quick Start Guide**: [../docs/QUICK_START_DEPLOYMENT.md](../docs/QUICK_START_DEPLOYMENT.md)
- **Full Deployment Guide**: [../docs/DEPLOYMENT_GUIDE.md](../docs/DEPLOYMENT_GUIDE.md)
- **GitHub Workflows**: [../.github/workflows/](../.github/workflows/)

---

## 🔒 Security

- Scripts install and configure UFW firewall
- Only necessary ports are opened
- Environment files are NOT created by scripts (contain secrets)
- Docker daemon configured with log limits
- Nginx configured with security headers

---

**Last Updated**: 2025-11-05
