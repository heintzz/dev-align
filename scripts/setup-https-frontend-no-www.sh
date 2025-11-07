#!/bin/bash

# ============================================
# HTTPS Setup Script for Frontend EC2
# Domain: devalign.site (WITHOUT www)
# ============================================
# This script sets up SSL/TLS certificates using Let's Encrypt
# and configures Nginx to serve HTTPS traffic
#
# Use this version if you're having issues with www DNS record
#
# Prerequisites:
# 1. DNS A record: @ -> 18.141.166.14
# 2. Nginx already installed
# 3. Port 80 and 443 open in Security Group
# 4. Wait 15-30 minutes after DNS configuration
#
# Usage:
#   sudo bash setup-https-frontend-no-www.sh
# ============================================

set -e

DOMAIN="devalign.site"
EMAIL="admin@devalign.site"  # Change to your actual email

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🔐 HTTPS Setup for ${DOMAIN} (no www)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Verify DNS is pointing to this server
echo -e "${YELLOW}🔍 Step 1: Verifying DNS configuration...${NC}"
SERVER_IP=$(curl -s ifconfig.me)
echo "Current server IP: ${SERVER_IP}"
echo "Expected IP: 18.141.166.14"
echo ""

echo "Checking DNS resolution for ${DOMAIN}..."
DOMAIN_IP=$(dig +short ${DOMAIN} | tail -n1)
echo "${DOMAIN} resolves to: ${DOMAIN_IP}"

if [ "${DOMAIN_IP}" != "18.141.166.14" ]; then
    echo -e "${RED}⚠️ Warning: DNS not properly configured!${NC}"
    echo "Expected: 18.141.166.14"
    echo "Got: ${DOMAIN_IP}"
    echo ""
    echo "Please:"
    echo "1. Configure DNS A record: ${DOMAIN} -> 18.141.166.14"
    echo "2. Wait 15-30 minutes for propagation"
    echo "3. Run this script again"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo -e "${GREEN}✅ DNS verification complete${NC}"
echo ""

# Step 2: Install Certbot
echo -e "${YELLOW}📦 Step 2: Installing Certbot...${NC}"
apt update
apt install -y certbot python3-certbot-nginx
echo -e "${GREEN}✅ Certbot installed${NC}"
echo ""

# Step 3: Backup current Nginx config
echo -e "${YELLOW}📋 Step 3: Backing up Nginx configuration...${NC}"
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

# Step 4: Create Nginx config for HTTP (Let's Encrypt will modify it)
echo -e "${YELLOW}⚙️ Step 4: Configuring Nginx for ${DOMAIN}...${NC}"

cat > /etc/nginx/sites-available/default <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name devalign.site;

    root /var/www/html;
    index index.html index.htm;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Serve React app (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json
               application/xml image/svg+xml;
}
EOF

echo -e "${GREEN}✅ Nginx configuration created${NC}"
echo ""

# Step 5: Test Nginx configuration
echo -e "${YELLOW}🔍 Step 5: Testing Nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi
echo ""

# Step 6: Reload Nginx
echo -e "${YELLOW}🔄 Step 6: Reloading Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"
echo ""

# Step 7: Verify HTTP is working
echo -e "${YELLOW}🌐 Step 7: Testing HTTP access...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${DOMAIN})
echo "HTTP Status: ${HTTP_STATUS}"

if [ "${HTTP_STATUS}" != "200" ]; then
    echo -e "${YELLOW}⚠️ Warning: HTTP returned ${HTTP_STATUS}${NC}"
    echo "This might be okay if the site is not deployed yet"
fi
echo ""

# Step 8: Obtain SSL certificate (WITHOUT www)
echo -e "${YELLOW}🔐 Step 8: Obtaining SSL certificate from Let's Encrypt...${NC}"
echo -e "${BLUE}This will:${NC}"
echo "  - Obtain free SSL certificate"
echo "  - Automatically configure Nginx for HTTPS"
echo "  - Set up HTTP -> HTTPS redirect"
echo "  - Configure auto-renewal"
echo ""

certbot --nginx \
    -d ${DOMAIN} \
    --non-interactive \
    --agree-tos \
    --email ${EMAIL} \
    --redirect \
    --hsts \
    --staple-ocsp

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ SSL certificate obtained and configured!${NC}"
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "1. DNS not pointing to this server"
    echo "   Check: nslookup ${DOMAIN}"
    echo "   Expected: 18.141.166.14"
    echo ""
    echo "2. Port 80 or 443 blocked in Security Group"
    echo "   Check AWS EC2 > Security Groups"
    echo ""
    echo "3. DNS propagation not complete"
    echo "   Wait 15-30 minutes and try again"
    echo ""
    echo "4. Nginx not running"
    echo "   Check: sudo systemctl status nginx"
    exit 1
fi
echo ""

# Step 9: Set up auto-renewal
echo -e "${YELLOW}🔄 Step 9: Testing automatic certificate renewal...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Auto-renewal configured successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Auto-renewal test failed${NC}"
    echo "Certificate is installed but auto-renewal needs manual check"
fi
echo ""

# Step 10: Final verification
echo -e "${YELLOW}🔍 Step 10: Final verification...${NC}"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN})
echo "HTTPS Status: ${HTTPS_STATUS}"

# Display certificate info
echo ""
echo -e "${BLUE}📜 Certificate Information:${NC}"
certbot certificates

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ HTTPS Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}🌐 Your site is now available at:${NC}"
echo -e "   ${GREEN}https://devalign.site${NC}"
echo ""
echo -e "${YELLOW}⚠️ Note: www.devalign.site is NOT configured${NC}"
echo -e "${YELLOW}   Users must access: https://devalign.site (without www)${NC}"
echo ""
echo -e "${BLUE}🔒 Security Features Enabled:${NC}"
echo "   ✅ HTTPS enforced (HTTP redirects to HTTPS)"
echo "   ✅ HSTS enabled (HTTP Strict Transport Security)"
echo "   ✅ OCSP stapling enabled"
echo "   ✅ Certificate auto-renewal configured"
echo ""
echo -e "${BLUE}📅 Certificate Details:${NC}"
echo "   Issuer: Let's Encrypt"
echo "   Validity: 90 days"
echo "   Auto-renewal: Runs twice daily"
echo "   Next renewal check: Within 30 days of expiration"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "   Test renewal:  ${YELLOW}sudo certbot renew --dry-run${NC}"
echo "   Force renewal: ${YELLOW}sudo certbot renew --force-renewal${NC}"
echo "   View certs:    ${YELLOW}sudo certbot certificates${NC}"
echo "   Nginx reload:  ${YELLOW}sudo systemctl reload nginx${NC}"
echo "   Check logs:    ${YELLOW}sudo tail -f /var/log/letsencrypt/letsencrypt.log${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo ""

# Display Nginx status
echo -e "${BLUE}📊 Nginx Status:${NC}"
systemctl status nginx --no-pager | head -15
