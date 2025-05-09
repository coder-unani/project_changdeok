#!/bin/bash

# Check if required scripts exist and are executable
for script in "stop.sh" "start.sh"; do
    if [ ! -f "./$script" ]; then
        echo "** $script 파일이 존재하지 않습니다. **"
        exit 1
    fi
    if [ ! -x "./$script" ]; then
        echo "** $script 파일에 실행 권한이 없습니다. **"
        echo "** chmod +x $script 명령어로 실행 권한을 부여해주세요. **"
        exit 1
    fi
done

echo "** 서비스 재시작을 시작합니다. **"

# Stop the services
echo "** 서비스 중지 중... **"
if ! ./stop.sh; then
    echo "** 서비스 중지 실패 **"
    exit 1
fi

# Wait for a moment to ensure all processes are properly stopped
sleep 2

# Start the services
echo "** 서비스 시작 중... **"
if ! ./start.sh; then
    echo "** 서비스 시작 실패 **"
    exit 1
fi

echo "** 모든 서비스가 성공적으로 재시작되었습니다. **" 