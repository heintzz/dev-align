# CI/CD Pipeline Status

## 🚀 Deployment Architecture

```
Push to 'dev' → GitHub Actions → Deploy to EC2
```

---

## 📊 Current Status

| Component | Status | Endpoint | Last Deploy |
|-----------|--------|----------|-------------|
| Backend API | ✅ Active | http://13.250.231.18:5000 | Auto |
| AI Backend | ✅ Active | http://13.250.231.18:8000 | Auto |
| Frontend | ✅ Active | http://18.141.166.14 | Auto |

---

## 🔧 Workflows

### Backend Deployment
- **File**: `.github/workflows/deploy-backend.yml`
- **Triggers**: Push to `dev` with changes in `Backend/`, `AI/`, or `docker-compose.yml`
- **Target**: Backend EC2 (13.250.231.18)
- **Method**: Docker Compose
- **Duration**: ~3-4 minutes

### Frontend Deployment
- **File**: `.github/workflows/deploy-frontend.yml`
- **Triggers**: Push to `dev` with changes in `Frontend/`
- **Target**: Frontend EC2 (18.141.166.14)
- **Method**: Build + Nginx
- **Duration**: ~2-3 minutes

---

## 📈 Pipeline Flow

### Backend Pipeline
```
1. GitHub Actions triggers
2. SSH to Backend EC2 (13.250.231.18)
3. Pull latest code from dev
4. Copy environment files
5. Stop Docker containers
6. Build new Docker images
7. Start containers
8. Verify deployment
```

### Frontend Pipeline
```
1. GitHub Actions triggers
2. SSH to Frontend EC2 (18.141.166.14)
3. Pull latest code from dev
4. Install npm dependencies
5. Build production bundle (npm run build)
6. Copy to Nginx directory
7. Reload Nginx
8. Verify deployment
```

---

## 🔐 GitHub Secrets Required

| Secret | Description | Status |
|--------|-------------|--------|
| `BACKEND_HOST` | Backend EC2 IP (13.250.231.18) | ✅ |
| `BACKEND_SSH_KEY` | SSH private key for backend | ✅ |
| `FRONTEND_HOST` | Frontend EC2 IP (18.141.166.14) | ✅ |
| `FRONTEND_SSH_KEY` | SSH private key for frontend | ✅ |

---

## 🌍 Environment Variables

### Backend (.env.backend)
- Located: `/var/www/backend/.env.backend` on EC2
- Contains: PORT, JWT_SECRET, MONGO_URI, EMAIL configs
- **Never committed to Git**

### AI Backend (.env.ai)
- Located: `/var/www/backend/.env.ai` on EC2
- Contains: LLM models, API keys, MONGO_URI
- **Never committed to Git**

### Frontend (.env.production)
- Located: `/var/www/frontend/.env.production` on EC2
- Contains: VITE_API_URL
- **Never committed to Git**

---

## 📦 Deployment Checklist

### Initial Setup (One-time)
- [x] Backend EC2 configured
- [x] Frontend EC2 configured
- [x] GitHub Secrets added
- [x] Environment files created on EC2
- [x] Docker installed on Backend EC2
- [x] Nginx installed on Frontend EC2

### For Each Deployment
- [ ] Code changes merged to dev
- [ ] GitHub Actions runs successfully
- [ ] Backend responds on port 5000
- [ ] Frontend loads on port 80
- [ ] API calls work from frontend

---

## 🔍 Monitoring

### Check Deployment Status
```bash
# Via GitHub
# Go to: Repository → Actions tab

# Via Backend EC2
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
docker compose ps
docker compose logs -f

# Via Frontend EC2
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
```

### Health Checks
```bash
# Backend API
curl http://13.250.231.18:5000/api/health

# AI Backend
curl http://13.250.231.18:8000/health

# Frontend
curl http://18.141.166.14
```

---

## 🐛 Common Issues

### Issue: Workflow fails with SSH error
**Cause**: GitHub secrets not set or incorrect
**Fix**:
1. Go to GitHub → Settings → Secrets
2. Verify `BACKEND_SSH_KEY` and `FRONTEND_SSH_KEY`
3. Ensure SSH keys include BEGIN/END lines

### Issue: Docker build fails
**Cause**: Dependency or Docker image issue
**Fix**:
```bash
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
cd /var/www/backend/DevAlign
docker compose down
docker system prune -a
docker compose up -d --build
```

### Issue: Frontend build fails
**Cause**: npm dependencies or TypeScript errors
**Fix**:
```bash
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
cd /var/www/frontend/DevAlign/Frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Environment variables not working
**Cause**: Environment files not copied or incorrect
**Fix**:
```bash
# Backend
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
cat /var/www/backend/.env.backend
cp /var/www/backend/.env.backend /var/www/backend/DevAlign/Backend/.env

# Frontend
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
cat /var/www/frontend/.env.production
```

---

## 📚 Documentation

- **Quick Start**: [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md)
- **Full Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Setup Scripts**: [../scripts/README.md](../scripts/README.md)

---

## 🎯 Next Steps

### Immediate
- [ ] Test deployment by pushing to dev
- [ ] Verify both services are running
- [ ] Check logs for any errors

### Future Improvements
- [ ] Add HTTPS/SSL certificates
- [ ] Setup custom domain names
- [ ] Add staging environment
- [ ] Implement blue-green deployment
- [ ] Add automated testing in pipeline
- [ ] Setup CloudWatch monitoring
- [ ] Add Slack/Discord notifications

---

## 📞 Support

For issues:
1. Check GitHub Actions logs
2. SSH to EC2 and check service logs
3. Review this status document
4. Refer to [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Last Updated**: 2025-11-05
**Status**: ✅ Operational
**Branch**: feat/cicd
