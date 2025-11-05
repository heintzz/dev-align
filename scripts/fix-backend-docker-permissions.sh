#!/bin/bash

###############################################################################
# Quick Fix for Backend EC2 Docker Permissions
#
# This script fixes the common issue where docker commands require sudo
# Run this script, then LOGOUT and LOGIN again
###############################################################################

echo "=========================================="
echo "🔧 Fixing Docker Permissions"
echo "=========================================="
echo ""

# Add ubuntu user to docker group
echo "Adding ubuntu user to docker group..."
sudo usermod -aG docker ubuntu

echo ""
echo "=========================================="
echo "✅ Fix Applied!"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: You MUST logout and login again"
echo ""
echo "Next steps:"
echo "1. Type: exit"
echo "2. SSH back in: ssh -i devalign-be-key.pem ubuntu@13.250.231.18"
echo "3. Verify: docker ps"
echo "4. Continue setup"
echo ""
echo "=========================================="
