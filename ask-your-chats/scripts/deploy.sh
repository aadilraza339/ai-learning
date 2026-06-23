#!/bin/bash
# Syncs your local app to the Oracle Cloud server.
# Usage: ./scripts/deploy.sh ubuntu@YOUR_VM_IP
set -e

SERVER=${1:?Usage: $0 ubuntu@SERVER_IP}

echo "=== Syncing files to $SERVER ==="
rsync -avz --progress \
  --exclude 'node_modules/' \
  --exclude 'data/' \
  --exclude '.env' \
  --exclude '.wwebjs_cache/' \
  --exclude '*.db' \
  --exclude '*.db-shm' \
  --exclude '*.db-wal' \
  ./ "$SERVER:~/ask-your-chats/"

echo ""
echo "=== Installing dependencies on server ==="
ssh "$SERVER" "cd ~/ask-your-chats && npm ci"

echo ""
echo "=== Restarting app on server ==="
ssh "$SERVER" "pm2 restart app 2>/dev/null || pm2 start src/server.js --name app && pm2 save"

echo ""
echo "Done! App is running at http://$(echo $SERVER | cut -d@ -f2):3000"
