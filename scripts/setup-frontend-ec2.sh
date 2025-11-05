#!/bin/bash

###############################################################################
# DevAlign Frontend EC2 Setup Script
#
# This script sets up the Frontend EC2 instance (18.141.166.14) to run:
# - Frontend React App (via Nginx)
#
# Run this script ONCE when setting up a new EC2 instance
###############################################################################

set -e  # Exit on any error

echo "=========================================="
echo "🚀 DevAlign Frontend EC2 Setup"
echo "=========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
   echo "❌ Please run with sudo: sudo bash setup-frontend-ec2.sh"
   exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y
echo "✅ System updated"
echo ""

# Install essential packages
echo "📦 Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    unzip \
    ca-certificates \
    gnupg
echo "✅ Essential packages installed"
echo ""

# Install Node.js 18.x (LTS)
echo "📦 Installing Node.js..."

# Remove old versions
apt-get remove -y nodejs npm 2>/dev/null || true

# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Install Node.js
apt-get install -y nodejs

echo "✅ Node.js installed successfully"
node --version
npm --version
echo ""

# Install Nginx
echo "🌐 Installing Nginx..."
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx
echo "✅ Nginx installed and started"
nginx -v
echo ""

# Create deployment directory
echo "📁 Creating deployment directories..."
mkdir -p /var/www/frontend
chown ubuntu:ubuntu /var/www/frontend
echo "✅ Deployment directory created: /var/www/frontend"
echo ""

# Clone repository
echo "📥 Cloning DevAlign repository..."
cd /var/www/frontend
sudo -u ubuntu git clone -b dev https://github.com/PentabyteDevAlign/DevAlign.git
chown -R ubuntu:ubuntu DevAlign
echo "✅ Repository cloned"
echo ""

# Setup environment file
echo "⚙️ Setting up environment file..."
echo ""
echo "📝 Please create the production environment file:"
echo ""
echo "   sudo nano /var/www/frontend/.env.production"
echo ""
echo "   Paste this content:"
echo "   ----------------------------------------"
cat << 'EOF'
VITE_API_URL=http://13.250.231.18:5000
EOF
echo "   ----------------------------------------"
echo ""

# Configure Nginx
echo "🔧 Configuring Nginx..."

# Backup default config
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Create new Nginx configuration
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location - serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (optional - if you want to proxy API calls)
    location /api {
        proxy_pass http://13.250.231.18:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

echo "✅ Nginx configured and reloaded"
echo ""

# Setup firewall (UFW)
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS (for future SSL)
ufw status
echo "✅ Firewall configured"
echo ""

# Install monitoring tools
echo "📊 Installing monitoring tools..."
apt-get install -y sysstat iotop nethogs
echo "✅ Monitoring tools installed"
echo ""

# Setup log rotation for Nginx
echo "📋 Setting up log rotation..."
cat > /etc/logrotate.d/nginx << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}
EOF
echo "✅ Log rotation configured"
echo ""

# Create useful aliases
echo "⚡ Creating helpful aliases..."
cat >> /home/ubuntu/.bashrc << 'EOF'

# DevAlign aliases
alias nginxreload='sudo systemctl reload nginx'
alias nginxrestart='sudo systemctl restart nginx'
alias nginxstatus='sudo systemctl status nginx'
alias nginxlogs='sudo tail -f /var/log/nginx/access.log'
alias nginxerrors='sudo tail -f /var/log/nginx/error.log'
alias frontend='cd /var/www/frontend/DevAlign/Frontend'
alias deploy='cd /var/www/frontend/DevAlign/Frontend && npm install && npm run build && sudo rm -rf /var/www/html/* && sudo cp -r dist/* /var/www/html/ && sudo systemctl reload nginx'
EOF

chown ubuntu:ubuntu /home/ubuntu/.bashrc
echo "✅ Aliases created"
echo ""

# Setup npm cache for faster builds
echo "⚡ Configuring npm..."
sudo -u ubuntu npm config set cache /home/ubuntu/.npm-cache --global
echo "✅ npm configured"
echo ""

# Print completion message
echo "=========================================="
echo "✅ Frontend EC2 Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create production environment file:"
echo "   sudo nano /var/www/frontend/.env.production"
echo "   Add: VITE_API_URL=http://13.250.231.18:5000"
echo ""
echo "2. Build and deploy the frontend:"
echo "   cd /var/www/frontend/DevAlign/Frontend"
echo "   cp /var/www/frontend/.env.production .env.production"
echo "   npm install"
echo "   npm run build"
echo "   sudo cp -r dist/* /var/www/html/"
echo "   sudo systemctl reload nginx"
echo ""
echo "3. Verify deployment:"
echo "   curl http://18.141.166.14"
echo ""
echo "4. Add GitHub Secrets:"
echo "   FRONTEND_HOST = 18.141.166.14"
echo "   FRONTEND_SSH_KEY = <contents of devalign-fe-key.pem>"
echo ""
echo "5. Push to dev branch to trigger auto-deployment"
echo ""
echo "🌐 Endpoints after deployment:"
echo "   Frontend: http://18.141.166.14"
echo "   API calls will go to: http://13.250.231.18:5000"
echo ""
echo "📊 Useful commands:"
echo "   sudo systemctl status nginx  - Check Nginx status"
echo "   sudo tail -f /var/log/nginx/access.log  - View access logs"
echo "   sudo tail -f /var/log/nginx/error.log  - View error logs"
echo ""
echo "=========================================="
