#!/bin/bash

# .env 파일에서 SERVICE_NAME 읽기
SERVICE_NAME=$(grep '^SERVICE_NAME=' .env | cut -d '=' -f2)

# Check if the process already exists in PM2
if npx pm2 list | grep -q "${SERVICE_NAME}"; then
    echo "** 기존 ${SERVICE_NAME} 프로세스가 존재합니다. 재시작합니다. **"
    if ! npx pm2 restart ${SERVICE_NAME}; then
        echo "** 애플리케이션 재시작 실패 **"
        exit 1
    fi
else
    # Start the application using PM2 with nodemon
    echo "** 애플리케이션 PM2로 시작 **"
    if ! npx pm2 start nodemon --name "${SERVICE_NAME}" -- --exec ts-node ./src/app.ts; then
        echo "** 애플리케이션 시작 실패 **"
        exit 1
    fi
fi

# Save PM2 process list
echo "** PM2 프로세스 목록 저장 **"
if ! npx pm2 save; then
    echo "** PM2 프로세스 목록 저장 실패 **"
    exit 1
fi

echo "** 모든 서비스가 성공적으로 시작되었습니다. **" 

# Show PM2 logs
echo "** PM2 로그를 표시합니다. **"
npx pm2 logs "${SERVICE_NAME}" 