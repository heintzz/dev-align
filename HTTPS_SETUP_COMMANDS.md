# 🚀 HTTPS Setup Commands for devalign.site

Quick reference for all commands needed to set up HTTPS.

---

## 📋 Before You Start

1. **Configure DNS at your domain registrar:**
   - Add A record: `@` → `18.141.166.14`
   - Add A record: `www` → `18.141.166.14`
   - Wait 15-30 minutes

2. **Verify DNS propagation:**
   ```bash
   nslookup devalign.site
   ```
   Should return: `18.141.166.14`

3. **Check AWS Security Group:**
   - Port 80 (HTTP) - 0.0.0.0/0
   - Port 443 (HTTPS) - 0.0.0.0/0

---

## 🔧 Setup Commands

### Step 1: Upload Setup Script to EC2

**From your local machine (in project directory):**

```bash
# Navigate to project
cd d:\KADA\Projects\capstone\DevAlign

# Upload script to Frontend EC2
scp -i devalign-fe-key.pem scripts/setup-https-frontend.sh ubuntu@18.141.166.14:~/
```

### Step 2: Run HTTPS Setup on Frontend EC2

**SSH to Frontend EC2:**

```bash
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
```

**Make script executable and run:**

```bash
# Make executable
chmod +x setup-https-frontend.sh

# Run with sudo
sudo bash setup-https-frontend.sh
```

**Wait for the script to complete** (3-5 minutes). It will:
- ✅ Install Certbot
- ✅ Configure Nginx
- ✅ Obtain SSL certificate
- ✅ Set up auto-renewal

### Step 3: Update Backend CORS

**SSH to Backend EC2:**

```bash
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
```

**Navigate to project:**

```bash
cd /var/www/backend/DevAlign
```

**Pull latest changes from config/dns branch:**

```bash
git fetch origin config/dns
git checkout config/dns
git pull origin config/dns
```

**Restart Docker to apply CORS changes:**

```bash
docker compose down
docker compose up -d
```

**Verify backend is running:**

```bash
docker compose ps
docker compose logs -f backend
```

Press `Ctrl+C` to exit logs.

### Step 4: Test HTTPS

**Open browser and test:**

1. Visit: `https://devalign.site`
2. Visit: `https://www.devalign.site`
3. Verify green padlock 🔒
4. Test login and API calls

---

## 🔄 Maintenance Commands

### Certificate Management

**View certificate details:**
```bash
sudo certbot certificates
```

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run
```

**Force certificate renewal:**
```bash
sudo certbot renew --force-renewal
```

**Check renewal timer:**
```bash
sudo systemctl status certbot.timer
```

### Nginx Management

**Test configuration:**
```bash
sudo nginx -t
```

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

**Restart Nginx:**
```bash
sudo systemctl restart nginx
```

**Check Nginx status:**
```bash
sudo systemctl status nginx
```

**View access logs:**
```bash
sudo tail -f /var/log/nginx/access.log
```

**View error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

### Docker Management (Backend)

**View running containers:**
```bash
docker compose ps
```

**View logs:**
```bash
docker compose logs -f backend
docker compose logs -f ai
```

**Restart services:**
```bash
docker compose restart backend
docker compose restart ai
```

**Rebuild and restart:**
```bash
docker compose down
docker compose up -d --build
```

---

## 🐛 Troubleshooting Commands

### DNS Issues

**Check DNS resolution:**
```bash
nslookup devalign.site
dig devalign.site
```

**Check from multiple locations:**
Visit: https://dnschecker.org/ and enter `devalign.site`

### Port Issues

**Check what's using ports 80 and 443:**
```bash
sudo netstat -tulpn | grep -E ':(80|443)'
sudo lsof -i :80
sudo lsof -i :443
```

**Kill process on port (if needed):**
```bash
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp
```

### SSL Certificate Issues

**View Certbot logs:**
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

**Manually obtain certificate:**
```bash
sudo certbot --nginx -d devalign.site -d www.devalign.site
```

**Delete and re-obtain certificate:**
```bash
sudo certbot delete --cert-name devalign.site
sudo certbot --nginx -d devalign.site -d www.devalign.site
```

### CORS Issues

**Check backend CORS configuration:**
```bash
# On Backend EC2
cd /var/www/backend/DevAlign
cat Backend/index.js | grep -A 10 "corsOptions"
```

**Should include:**
```javascript
"https://devalign.site",
"https://www.devalign.site",
```

**If not, update and restart:**
```bash
git pull origin config/dns
docker compose restart backend
```

---

## 📊 Verification Commands

### Check SSL Grade

Visit: https://www.ssllabs.com/ssltest/
Enter: `devalign.site`
Expected: Grade A or A+

### Check Certificate Details

**In browser:**
1. Visit https://devalign.site
2. Click padlock icon
3. View certificate

**Command line:**
```bash
echo | openssl s_client -servername devalign.site -connect devalign.site:443 2>/dev/null | openssl x509 -noout -dates
```

### Test HTTP → HTTPS Redirect

```bash
curl -I http://devalign.site
```

Should show:
```
HTTP/1.1 301 Moved Permanently
Location: https://devalign.site/
```

---

## 🔐 Security Verification

**Check security headers:**
```bash
curl -I https://devalign.site
```

Should include:
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`

**Verify HTTPS is enforced:**
```bash
# This should redirect to HTTPS
curl -L http://devalign.site

# This should work directly
curl https://devalign.site
```

---

## 📝 Git Commands (For You to Run)

After all changes are made and tested:

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "feat: configure HTTPS for devalign.site domain

- Add HTTPS setup script for Let's Encrypt SSL
- Update CORS to allow devalign.site (HTTP and HTTPS)
- Add comprehensive HTTPS setup documentation
- Configure Nginx for domain with security headers

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to config/dns branch
git push origin config/dns

# If you want to merge to dev later:
git checkout dev
git pull origin dev
git merge config/dns
git push origin dev
```

---

## ✅ Success Checklist

After setup, verify:

- [ ] DNS resolves to correct IP
- [ ] Ports 80, 443 open in Security Group
- [ ] SSL certificate obtained successfully
- [ ] HTTPS loads with green padlock
- [ ] HTTP redirects to HTTPS
- [ ] Login works
- [ ] API calls work (no CORS errors)
- [ ] No console errors in browser
- [ ] SSL Labs grade A/A+
- [ ] Auto-renewal configured

---

## 📞 Quick Help

**Setup failed?**
1. Check DNS: `nslookup devalign.site`
2. Check logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
3. Check Nginx: `sudo nginx -t && sudo systemctl status nginx`
4. Verify ports: `sudo netstat -tulpn | grep -E ':(80|443)'`

**CORS errors?**
1. Check backend CORS includes HTTPS origins
2. Restart backend: `docker compose restart backend`
3. Clear browser cache
4. Check browser console for exact error

**Certificate renewal failed?**
1. Check timer: `sudo systemctl status certbot.timer`
2. Test renewal: `sudo certbot renew --dry-run`
3. Check logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`

---

**For detailed guides, see:**
- Full guide: `docs/HTTPS_SETUP_GUIDE.md`
- Quick checklist: `docs/HTTPS_QUICK_CHECKLIST.md`
