#!/bin/bash

# Stop nginx service
echo "** nginx 서비스 중지 **\n"
sudo systemctl stop nginx.service

# Find and kill the node process
echo "** node 프로세스 찾아서 종료 **\n"
pkill -f "node ./dist/app.js" 