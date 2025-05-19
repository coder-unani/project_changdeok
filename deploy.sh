#!/bin/bash

# Function to handle errors
handle_error() {
    echo "** 오류 발생: $1 **"
    exit 1
}

# Check if required scripts exist and are executable
if [ ! -f "./restart.sh" ] || [ ! -x "./restart.sh" ]; then
    handle_error "restart.sh 파일이 존재하지 않거나 실행 권한이 없습니다."
fi

# Create backup of current build
echo "** 현재 빌드 백업 생성 **"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
if [ -d "./dist" ]; then
    if ! cp -r ./dist "$BACKUP_DIR/"; then
        handle_error "백업 생성 실패"
    fi
fi

# Pull the latest code
echo "** Git에서 최신 코드를 가져옴 **"
if ! git pull referer main; then
    handle_error "Git pull 실패"
fi

# Install dependencies
echo "** 의존성 설치 **"
if ! npm install; then
    handle_error "npm install 실패"
fi

# Prisma 스키마 업데이트
echo "** Prisma 스키마 업데이트 **"
if ! npx prisma generate; then
    handle_error "Prisma generate 실패"
fi

# Remove ./dist/views
echo "** ./dist/views 삭제 **"
if [ -d "./dist/views" ]; then
    if ! rm -rf ./dist/views; then
        handle_error "views 디렉토리 삭제 실패"
    fi
fi

# Build the project
echo "** 프로젝트 빌드 **"
if ! npm run build; then
    echo "** 빌드 실패, 백업에서 복원 시도 **"
    if [ -d "$BACKUP_DIR/dist" ]; then
        if ! cp -r "$BACKUP_DIR/dist" ./; then
            handle_error "백업에서 복원 실패"
        fi
    fi
    handle_error "프로젝트 빌드 실패"
fi

# Verify the build
echo "** 빌드 검증 **"
if [ ! -f "./dist/app.js" ]; then
    handle_error "빌드된 app.js 파일이 없습니다"
fi

# Restart the services
echo "** 서비스 재시작 **"
if ! ./restart.sh; then
    handle_error "서비스 재시작 실패"
fi

echo "** 배포가 성공적으로 완료되었습니다. **" 