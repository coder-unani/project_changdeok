#!/bin/bash

# Pull the latest code
echo "** Git에서 최신 코드를 가져옴 **\n"
git pull origin main

# Install dependencies
echo "** 의존성 설치 **\n"
npm install

# Remove ./dist/views
echo "** ./dist/views 삭제 **\n"
rm -rf ./dist/views

# Build the project
echo "** 프로젝트 빌드 **\n"
npm run build

# Restart the services
echo "** 서비스 재시작 **\n"
./restart.sh 