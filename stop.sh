#!/bin/bash

# Stop nginx service
echo "** nginx 서비스 중지 **"
if ! sudo systemctl stop nginx.service; then
    echo "** nginx 서비스 중지 실패 **"
    exit 1
fi

# Check if the process exists in PM2
if pm2 list | grep -q "cms_express"; then
    # Stop the application using PM2
    echo "** 애플리케이션 PM2로 중지 **"
    if ! pm2 stop cms_express; then
        echo "** 애플리케이션 중지 실패 **"
        exit 1
    fi

    # Delete the process from PM2
    echo "** PM2에서 프로세스 제거 **"
    if ! pm2 delete cms_express; then
        echo "** PM2에서 프로세스 제거 실패 **"
        exit 1
    fi
else
    echo "** cms_express 프로세스가 PM2에 존재하지 않습니다. **"
fi

echo "** 모든 서비스가 성공적으로 중지되었습니다. **" 