#!/bin/bash

# Start nginx service
echo "** nginx 서비스 시작 **\n"
sudo systemctl start nginx.service

# Start the application in the background
echo "** 애플리케이션 백그라운드 시작 **\n"
node ./dist/app.js & 