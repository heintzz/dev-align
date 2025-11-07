# ✅ HTTPS Setup Quick Checklist

Domain: **devalign.site**
Frontend EC2: **18.141.166.14**

---

## Pre-Setup Checklist

- [ ] Domain purchased: devalign.site
- [ ] SSH key file available: `devalign-fe-key.pem`
- [ ] Can connect to EC2: `ssh -i devalign-fe-key.pem ubuntu@18.141.166.14`

---

## Step 1: DNS Configuration (At Domain Registrar)

**Add these DNS records:**

- [ ] A Record: `@` → `18.141.166.14` (TTL: 300)
- [ ] A Record: `www` → `18.141.166.14` (TTL: 300)
- [ ] Wait 15-30 minutes for propagation
- [ ] Verify DNS: `nslookup devalign.site` returns `18.141.166.14`

---

## Step 2: AWS Security Group

**Ensure ports are open:**

- [ ] Port 22 (SSH) - Your IP
- [ ] Port 80 (HTTP) - 0.0.0.0/0
- [ ] Port 443 (HTTPS) - 0.0.0.0/0

---

## Step 3: Upload Setup Script

**From local machine:**

```bash
# Navigate to project
cd d:\KADA\Projects\capstone\DevAlign

# Upload script
scp -i devalign-fe-key.pem scripts/setup-https-frontend.sh ubuntu@18.141.166.14:~/
```

- [ ] Script uploaded successfully

---

## Step 4: Run HTTPS Setup

**SSH to Frontend EC2:**

```bash
ssh -i devalign-fe-key.pem ubuntu@18.141.166.14
```

**Run setup:**

```bash
chmod +x setup-https-frontend.sh
sudo bash setup-https-frontend.sh
```

**Expected output:**
- [ ] DNS verification passed
- [ ] Certbot installed
- [ ] Nginx configured
- [ ] SSL certificate obtained
- [ ] HTTPS working
- [ ] Auto-renewal configured

---

## Step 5: Update Backend CORS

**SSH to Backend EC2:**

```bash
ssh -i devalign-be-key.pem ubuntu@13.250.231.18
cd /var/www/backend/DevAlign
```

**Edit index.js:**

```bash
nano Backend/index.js
```

**Add to corsOptions origin array:**

```javascript
"https://devalign.site",
"https://www.devalign.site",
```

**Restart Docker:**

```bash
docker compose down
docker compose up -d
```

- [ ] CORS updated
- [ ] Docker restarted
- [ ] No errors in logs: `docker compose logs -f backend`

---

## Step 6: Test HTTPS

**Open browser and check:**

- [ ] `https://devalign.site` - Loads with green padlock 🔒
- [ ] `https://www.devalign.site` - Loads with green padlock 🔒
- [ ] `http://devalign.site` - Redirects to HTTPS ✅
- [ ] Login works
- [ ] API calls work (no CORS errors)
- [ ] CV extraction works
- [ ] No console errors

**SSL Test:**

- [ ] Visit https://www.ssllabs.com/ssltest/
- [ ] Enter: `devalign.site`
- [ ] Grade: A or A+ ⭐

---

## Post-Setup Verification

**On Frontend EC2:**

```bash
# Check certificate
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run

# Check Nginx status
sudo systemctl status nginx

# Check Nginx config
sudo nginx -t
```

- [ ] Certificate valid for 90 days
- [ ] Auto-renewal test passes
- [ ] Nginx running without errors

---

## Maintenance Commands

**Certificate management:**

```bash
# View certificates
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

**Nginx management:**

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

**If SSL fails:**

1. Check DNS: `nslookup devalign.site`
2. Check ports: `sudo netstat -tulpn | grep -E ':(80|443)'`
3. Check Security Group in AWS Console
4. Wait longer for DNS propagation (30-60 min)
5. Check Certbot logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`

**If CORS errors:**

1. Check Backend index.js has HTTPS origins
2. Restart Docker: `docker compose restart backend`
3. Check browser console for specific error
4. Verify request going to HTTPS, not HTTP

**If auto-renewal fails:**

1. Check timer: `sudo systemctl status certbot.timer`
2. Enable timer: `sudo systemctl enable certbot.timer`
3. Start timer: `sudo systemctl start certbot.timer`
4. Test renewal: `sudo certbot renew --dry-run`

---

## Success Criteria

✅ All checks completed:

- [ ] HTTPS works for both devalign.site and www.devalign.site
- [ ] HTTP redirects to HTTPS
- [ ] Green padlock in browser
- [ ] No SSL warnings
- [ ] Application fully functional
- [ ] Auto-renewal configured
- [ ] SSL Labs grade A/A+

**If all checked, you're done! 🎉**

---

**Need help?** Check the full guide: `docs/HTTPS_SETUP_GUIDE.md`
