#!/bin/bash
# Run this once on your Oracle Cloud Ubuntu VM after SSH-ing in.
# Works on both ARM (A1.Flex) and x86 (E2.1.Micro) instances.
set -e

echo "=== [1/5] Updating system packages ==="
sudo apt-get update && sudo apt-get upgrade -y

echo "=== [2/5] Installing Node.js 20 + build tools ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential python3

echo "=== [3/5] Installing Chromium system libraries (for WhatsApp Web / Puppeteer) ==="
sudo apt-get install -y \
  libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
  libpangocairo-1.0-0 libx11-xcb1 libxcb-dri3-0

echo "=== [4/5] Installing PM2 (keeps app alive after reboot) ==="
sudo npm install -g pm2

echo "=== [5/5] Opening port 3000 in OS firewall ==="
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save

mkdir -p ~/ask-your-chats

echo ""
echo "=========================================="
echo "Server setup complete!"
echo ""
echo "Next steps:"
echo "  1. From your LOCAL machine, run:  ./scripts/deploy.sh ubuntu@YOUR_VM_IP"
echo "  2. SSH back in and run:           cd ~/ask-your-chats && cp .env.example .env && nano .env"
echo "  3. Fill in your API keys, then:   pm2 start src/server.js --name app && pm2 save"
echo "  4. Visit: http://YOUR_VM_IP:3000"
echo "=========================================="
