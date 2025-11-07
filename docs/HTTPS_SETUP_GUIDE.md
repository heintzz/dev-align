# 🔐 HTTPS Setup Guide for devalign.site

This guide will help you set up HTTPS for your DevAlign frontend using Let's Encrypt SSL certificates.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Domain name: `devalign.site` (purchased and active)
- ✅ Frontend EC2: `18.141.166.14` (running with Nginx)
- ✅ Backend EC2: `13.250.231.18` (running with Docker)
- ✅ SSH access to Frontend EC2
- ✅ SSH key file: `devalign-fe-key.pem`

---

## 🚀 Step-by-Step Setup

### Step 1: Configure DNS Records

**Go to your domain registrar** (where you bought devalign.site) and add these DNS records:

#### For Frontend (devalign.site)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 18.141.166.14 | 300 |
| A | www | 18.141.166.14 | 300 |

#### Optional: For API Subdomain (api.devalign.site)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | api | 13.250.231.18 | 300 |

**After adding DNS records:**
- Wait **15-30 minutes** for DNS propagation
- Verify with: `nslookup devalign.site`
- Expected result: `18.141.166.14`

---

### Step 2: Update AWS Security Group

**Go to AWS Console > EC2 > Security Groups**

Find your **Frontend EC2 Security Group** and ensure these ports are open:

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
| SSH | TCP | 22 | Your IP | SSH access |

---

### Step 3: Connect to Frontend EC2

```bash
# Make sure you're in the project directory
cd d:\KADA\Projects\capstone\DevAlign

# Connect to Frontend EC2
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
```

---

### Step 4: Upload and Run HTTPS Setup Script

**On your local machine:**

```bash
# Upload the setup script to EC2
scp -i devalign-fe-key.pem scripts/setup-https-frontend.sh ubuntu@18.141.166.14:~/

# Connect to EC2
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
```

**On the EC2 instance:**

```bash
# Make the script executable
chmod +x setup-https-frontend.sh

# Run the script with sudo
sudo bash setup-https-frontend.sh
```

The script will:
1. ✅ Verify DNS configuration
2. ✅ Install Certbot (Let's Encrypt client)
3. ✅ Backup current Nginx configuration
4. ✅ Configure Nginx for your domain
5. ✅ Obtain SSL certificate from Let's Encrypt
6. ✅ Set up HTTP → HTTPS redirect
7. ✅ Enable HSTS (HTTP Strict Transport Security)
8. ✅ Configure automatic certificate renewal

---

### Step 5: Update Backend CORS

After HTTPS is set up, you need to update the backend to allow HTTPS requests from your domain.

**SSH to Backend EC2:**

```bash
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
cd /var/www/backend/DevAlign
```

**Edit Backend/index.js:**

```bash
nano Backend/index.js
```

Find the `corsOptions` and update it:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://18.141.166.14",
    "https://devalign.site",           // ✅ Add this
    "https://www.devalign.site",       // ✅ Add this
    "http://13.250.231.18:5000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  optionsSuccessStatus: 200
};
```

**Restart Docker containers:**

```bash
docker compose down
docker compose up -d
```

---

### Step 6: Update Frontend Environment (Optional - For Future)

If you want to use `api.devalign.site` subdomain for backend:

**Update `Frontend/.env.production`:**

```env
VITE_API_URL=https://api.devalign.site
VITE_AI_URL=https://api.devalign.site:8000
```

**Note:** This requires:
- DNS A record: `api.devalign.site` → `13.250.231.18`
- SSL certificate for backend (similar setup on Backend EC2)
- Nginx reverse proxy on Backend EC2

For now, keep using IP addresses until you set up backend HTTPS.

---

### Step 7: Rebuild and Redeploy Frontend

**On Frontend EC2:**

```bash
cd /var/www/frontend/DevAlign/Frontend

# Pull latest changes (if any)
git pull origin dev

# Rebuild production bundle
npm run build

# Deploy to Nginx
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Reload Nginx
sudo systemctl reload nginx
```

---

### Step 8: Test HTTPS

**Open your browser and visit:**

1. ✅ `https://devalign.site` - Should load with green padlock
2. ✅ `https://www.devalign.site` - Should load with green padlock
3. ✅ `http://devalign.site` - Should redirect to HTTPS

**Verify SSL certificate:**
- Click the padlock icon in browser
- Certificate should show:
  - Issued by: Let's Encrypt
  - Valid for: devalign.site, www.devalign.site
  - Expires in: ~90 days

**Check SSL rating:**
- Visit: https://www.ssllabs.com/ssltest/
- Enter: `devalign.site`
- Expected rating: A or A+

---

## 🔄 Certificate Renewal

Let's Encrypt certificates expire after **90 days**, but renewal is **automatic**.

### How Auto-Renewal Works:

1. **Certbot timer** runs twice daily
2. Checks if certificate expires in < 30 days
3. Automatically renews if needed
4. Reloads Nginx with new certificate

### Manual Commands:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# View certificate details
sudo certbot certificates

# Check renewal timer status
sudo systemctl status certbot.timer

# View renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 🐛 Troubleshooting

### Issue 1: SSL Certificate Fails to Install

**Error:** `Failed to obtain SSL certificate`

**Solutions:**

1. **Check DNS:**
   ```bash
   nslookup devalign.site
   # Should return: 18.141.166.14
   ```

2. **Check ports:**
   ```bash
   # On EC2
   sudo netstat -tulpn | grep -E ':(80|443)'
   # Should show nginx listening on both ports
   ```

3. **Check Security Group:**
   - AWS Console > EC2 > Security Groups
   - Verify ports 80 and 443 are open to 0.0.0.0/0

4. **Wait for DNS propagation:**
   - Can take 15-30 minutes
   - Check: https://dnschecker.org/

### Issue 2: "Mixed Content" Warnings

**Error:** Console shows mixed content warnings

**Cause:** Page loaded via HTTPS, but making HTTP requests to backend

**Solution:** Use HTTPS for backend or use relative protocol:
```javascript
// Instead of:
const API_URL = "http://13.250.231.18:5000";

// Use (browser will use same protocol as page):
const API_URL = "//13.250.231.18:5000";
```

### Issue 3: CORS Errors After HTTPS

**Error:** CORS policy blocking requests

**Solution:** Update backend CORS to include HTTPS origin:
```javascript
origin: [
  "https://devalign.site",
  "https://www.devalign.site"
]
```

### Issue 4: Certificate Not Auto-Renewing

**Check renewal timer:**
```bash
sudo systemctl status certbot.timer
```

**If not running:**
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

**Test renewal:**
```bash
sudo certbot renew --dry-run
```

---

## 📊 Monitoring

### Check Nginx Access Logs:
```bash
sudo tail -f /var/log/nginx/access.log
```

### Check Nginx Error Logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check SSL Certificate Status:
```bash
sudo certbot certificates
```

### Check Nginx Configuration:
```bash
sudo nginx -t
sudo cat /etc/nginx/sites-available/default
```

---

## 🔒 Security Best Practices

### Enabled by Setup Script:

✅ **HTTPS Enforced** - All HTTP traffic redirects to HTTPS
✅ **HSTS** - Browsers remember to always use HTTPS
✅ **OCSP Stapling** - Faster certificate verification
✅ **Security Headers** - X-Frame-Options, X-XSS-Protection, etc.
✅ **Gzip Compression** - Faster page loads

### Additional Recommendations:

1. **Update regularly:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Enable firewall:**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **Monitor certificate expiration:**
   - Set up alerts for certificate renewal
   - Check monthly: `sudo certbot certificates`

4. **Keep backups:**
   - Backup Nginx configs before changes
   - Backup Let's Encrypt configs: `/etc/letsencrypt/`

---

## 🎯 Next Steps

After HTTPS is working for frontend:

1. **Set up HTTPS for Backend**
   - Point `api.devalign.site` to Backend EC2
   - Run similar Certbot setup on Backend EC2
   - Update Nginx reverse proxy for ports 5000, 8000

2. **Update Environment Variables**
   - Change all URLs to use HTTPS
   - Update `VITE_API_URL` to use domain instead of IP

3. **Update GitHub Actions**
   - Modify CI/CD to use HTTPS URLs
   - Update deployment scripts if needed

4. **Test All Features**
   - Login/Authentication
   - API calls
   - CV extraction
   - Socket.IO connections
   - File uploads

---

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review Nginx logs: `/var/log/nginx/error.log`
3. Review Certbot logs: `/var/log/letsencrypt/letsencrypt.log`
4. Check DNS: `nslookup devalign.site`
5. Verify SSL: https://www.ssllabs.com/ssltest/

---

## 📚 References

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [DNS Checker](https://dnschecker.org/)

---

**Last Updated:** 2025-01-07
**Domain:** devalign.site
**Frontend IP:** 18.141.166.14
**Backend IP:** 13.250.231.18
