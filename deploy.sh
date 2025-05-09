#!/bin/bash

# Pull the latest code
echo "** Git에서 최신 코드를 가져옴 **"
git pull origin main

# Install dependencies
echo "** 의존성 설치 **"
npm install

# Prisma 스키마 업데이트
echo "** Prisma 스키마 업데이트 **"
npx prisma generate

# Remove ./dist/views
echo "** ./dist/views 삭제 **"
rm -rf ./dist/views

# Build the project
echo "** 프로젝트 빌드 **"
npm run build

# Restart the services
echo "** 서비스 재시작 **"
./restart.sh 