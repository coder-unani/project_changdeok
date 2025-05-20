#!/bin/bash

# .env 파일에서 SERVICE_NAME 읽기
SERVICE_NAME=$(grep '^SERVICE_NAME=' .env | cut -d '=' -f2)

# Check if the process exists in PM2
if npx pm2 list | grep -q "${SERVICE_NAME}"; then
    # Stop the application using PM2
    echo "** 개발 서버 중지 중... **"
    if ! npx pm2 stop ${SERVICE_NAME}; then
        echo "** 개발 서버 중지 실패 **"
        exit 1
    fi

    # Delete the process from PM2
    echo "** PM2에서 개발 서버 제거 **"
    if ! npx pm2 delete ${SERVICE_NAME}; then
        echo "** PM2에서 개발 서버 제거 실패 **"
        exit 1
    fi
else
    echo "** 개발 서버가 실행 중이지 않습니다. **"
fi

echo "** 개발 서버가 성공적으로 중지되었습니다. **" 