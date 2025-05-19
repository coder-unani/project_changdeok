#!/bin/bash

# .env 파일에서 SERVICE_NAME 읽기
SERVICE_NAME=$(grep -oP '(?<=^SERVICE_NAME=)[^\n]+' .env)

# Check if the process exists in PM2
if npx pm2 list | grep -q "$SERVICE_NAME"; then
    # Stop the application using PM2
    echo "** 애플리케이션 PM2로 중지 **"
    if ! npx pm2 stop "$SERVICE_NAME"; then
        echo "** 애플리케이션 중지 실패 **"
        exit 1
    fi

    # Delete the process from PM2
    echo "** PM2에서 프로세스 제거 **"
    if ! npx pm2 delete "$SERVICE_NAME"; then
        echo "** PM2 프로세스 제거 실패 **"
        exit 1
    fi
fi

# Save PM2 process list
echo "** PM2 프로세스 목록 저장 **"
if ! npx pm2 save; then
    echo "** PM2 프로세스 목록 저장 실패 **"
    exit 1
fi

echo "** 모든 서비스가 성공적으로 중지되었습니다. **"