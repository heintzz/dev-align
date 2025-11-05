#!/bin/bash

###############################################################################
# DevAlign Backend EC2 Setup Script
#
# This script sets up the Backend EC2 instance (13.250.231.18) to run:
# - Backend API (Node.js + Express) via Docker
# - AI Backend (Python FastAPI) via Docker
#
# Run this script ONCE when setting up a new EC2 instance
###############################################################################

set -e  # Exit on any error

echo "=========================================="
echo "🚀 DevAlign Backend EC2 Setup"
echo "=========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
   echo "❌ Please run with sudo: sudo bash setup-backend-ec2.sh"
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
    gnupg \
    lsb-release
echo "✅ Essential packages installed"
echo ""

# Install Docker
echo "🐳 Installing Docker..."

# Remove old versions
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group (no sudo needed for docker commands)
usermod -aG docker ubuntu

echo "✅ Docker installed successfully"
docker --version
docker compose version
echo ""

# Create deployment directory
echo "📁 Creating deployment directories..."
mkdir -p /var/www/backend
chown ubuntu:ubuntu /var/www/backend
echo "✅ Deployment directory created: /var/www/backend"
echo ""

# Clone repository
echo "📥 Cloning DevAlign repository..."
cd /var/www/backend
sudo -u ubuntu git clone -b dev https://github.com/PentabyteDevAlign/DevAlign.git
chown -R ubuntu:ubuntu DevAlign
echo "✅ Repository cloned"
echo ""

# Setup environment files
echo "⚙️ Setting up environment files..."
echo ""
echo "📝 Please create the following environment files:"
echo ""
echo "1. Backend environment file:"
echo "   sudo nano /var/www/backend/.env.backend"
echo ""
echo "   Paste this template:"
echo "   ----------------------------------------"
cat << 'EOF'
PORT=5000
CLIENT_URL=http://18.141.166.14
BASE_AI_URL=http://ai-backend:8000
JWT_SECRET=your-jwt-secret-here
MONGO_URI=your-mongodb-connection-string
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF
echo "   ----------------------------------------"
echo ""
echo "2. AI Backend environment file:"
echo "   sudo nano /var/www/backend/.env.ai"
echo ""
echo "   Paste your AI configuration"
echo ""

# Configure Docker daemon
echo "🔧 Configuring Docker daemon..."
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker
echo "✅ Docker daemon configured"
echo ""

# Setup firewall (UFW)
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 5000/tcp  # Backend API
ufw allow 8000/tcp  # AI Backend
ufw status
echo "✅ Firewall configured"
echo ""

# Install monitoring tools
echo "📊 Installing monitoring tools..."
apt-get install -y sysstat iotop nethogs
echo "✅ Monitoring tools installed"
echo ""

# Setup log rotation for Docker
echo "📋 Setting up log rotation..."
cat > /etc/logrotate.d/docker << 'EOF'
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
EOF
echo "✅ Log rotation configured"
echo ""

# Create useful aliases
echo "⚡ Creating helpful aliases..."
cat >> /home/ubuntu/.bashrc << 'EOF'

# DevAlign aliases
alias dps='docker compose ps'
alias dlogs='docker compose logs -f'
alias dstop='docker compose down'
alias dstart='docker compose up -d'
alias drestart='docker compose restart'
alias drebuild='docker compose up -d --build'
alias backend='cd /var/www/backend/DevAlign'
EOF

chown ubuntu:ubuntu /home/ubuntu/.bashrc
echo "✅ Aliases created"
echo ""

# Print completion message
echo "=========================================="
echo "✅ Backend EC2 Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create environment files:"
echo "   sudo nano /var/www/backend/.env.backend"
echo "   sudo nano /var/www/backend/.env.ai"
echo ""
echo "2. Copy environment files to Backend and AI directories:"
echo "   cp /var/www/backend/.env.backend /var/www/backend/DevAlign/Backend/.env"
echo "   cp /var/www/backend/.env.ai /var/www/backend/DevAlign/AI/.env"
echo ""
echo "3. Start the application:"
echo "   cd /var/www/backend/DevAlign"
echo "   docker compose up -d --build"
echo ""
echo "4. Check status:"
echo "   docker compose ps"
echo "   docker compose logs -f"
echo ""
echo "5. Add GitHub Secrets:"
echo "   BACKEND_HOST = 13.250.231.18"
echo "   BACKEND_SSH_KEY = <contents of devalign-be-key.pem>"
echo ""
echo "6. Push to dev branch to trigger auto-deployment"
echo ""
echo "🌐 Endpoints after deployment:"
echo "   Backend API: http://13.250.231.18:5000"
echo "   AI Backend: http://13.250.231.18:8000"
echo ""
echo "=========================================="
