import { PrismaClient } from '@prisma/client';

import { exec } from 'child_process';
import { spawn } from 'child_process';
import { platform } from 'os';
import { join } from 'path';
import { pid } from 'process';
import { promisify } from 'util';

import { ICpuInfo, IMemoryInfo, IProcessInfo, IServiceResponse, ISystemStatus } from '../../types/config';
import { ISystemService } from '../../types/service';

const execAsync = promisify(exec);

export class SystemService implements ISystemService {
  constructor(private prisma: PrismaClient) {}

  private isMacOS(): boolean {
    return platform() === 'darwin';
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}일`);
    if (hours > 0) parts.push(`${hours}시간`);
    if (minutes > 0) parts.push(`${minutes}분`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}초`);

    return parts.join(' ');
  }

  private async checkProcessStatus(): Promise<IProcessInfo> {
    try {
      const currentPid = pid;
      // PID로 프로세스 존재 여부 확인
      const { stdout } = await execAsync(`ps -p ${currentPid} -o pid=`);
      const isRunning = stdout.trim().length > 0;

      return { isRunning, pid: currentPid };
    } catch (error) {
      return { isRunning: false, pid: 0 };
    }
  }

  private async getMemoryInfo(): Promise<IMemoryInfo> {
    try {
      if (this.isMacOS()) {
        // macOS - 메모리 정보 확인
        const { stdout } = await execAsync('top -l 1 -stats mem | grep "PhysMem"');
        const match = stdout.match(/PhysMem: (\d+)M used, (\d+)M wired, (\d+)M unused/);
        if (match) {
          const used = parseInt(match[1]);
          const wired = parseInt(match[2]);
          const unused = parseInt(match[3]);
          const total = used + wired + unused;
          return {
            free: `${unused}MB`,
            total: `${total}MB`,
          };
        }
      } else {
        // Linux - 메모리 정보 확인
        const { stdout } = await execAsync('free -m | grep Mem');
        const match = stdout.match(/Mem:\s+(\d+)\s+\d+\s+(\d+)/);
        if (match) {
          const total = match[1];
          const available = match[2];
          return {
            free: `${available}MB`,
            total: `${total}MB`,
          };
        }
      }
      return { free: '0MB', total: '0MB' };
    } catch (error) {
      return { free: '0MB', total: '0MB' };
    }
  }

  private async getCpuInfo(): Promise<ICpuInfo> {
    try {
      if (this.isMacOS()) {
        // macOS - CPU 사용률 확인
        const { stdout } = await execAsync('top -l 1 -stats cpu | grep "CPU usage"');
        const match = stdout.match(/CPU usage: (\d+\.\d+)% user, (\d+\.\d+)% sys, (\d+\.\d+)% idle/);
        if (match) {
          const user = parseFloat(match[1]);
          const sys = parseFloat(match[2]);
          const idle = parseFloat(match[3]);
          const used = (user + sys).toFixed(1);
          return {
            used: `${used}%`,
            idle: `${idle}%`,
          };
        }
      } else {
        // Linux - CPU 사용률 확인
        const { stdout } = await execAsync('top -bn1 | grep "Cpu(s)"');
        const match = stdout.match(/(\d+\.\d+) us,\s+(\d+\.\d+) sy,\s+(\d+\.\d+) id/);
        if (match) {
          const user = parseFloat(match[1]);
          const sys = parseFloat(match[2]);
          const idle = parseFloat(match[3]);
          const used = (user + sys).toFixed(1);
          return {
            used: `${used}%`,
            idle: `${idle}%`,
          };
        }
      }
      return { used: '0%', idle: '0%' };
    } catch (error) {
      return { used: '0%', idle: '0%' };
    }
  }

  public async restart(): Promise<IServiceResponse> {
    try {
      // PM2로 프로세스 재시작
      await execAsync('npx pm2 restart cms_express');

      // 잠시 대기하여 프로세스가 재시작될 시간을 줌
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 현재 프로세스 상태 확인
      const processInfo = await this.checkProcessStatus();
      if (processInfo.isRunning) {
        return {
          result: true,
          code: 200,
          message: '서버가 재시작되었습니다.',
        };
      }

      throw new Error('PM2 재시작 실패');
    } catch (error) {
      return {
        result: false,
        code: 500,
        message: '서버 재시작 중 오류가 발생했습니다. ' + error,
      };
    }
  }

  public async getStatus(): Promise<IServiceResponse<ISystemStatus>> {
    try {
      // 프로세스 상태 확인
      const processInfo = await this.checkProcessStatus();

      // 메모리 정보 확인
      const memoryInfo = await this.getMemoryInfo();

      // CPU 정보 확인
      const cpuInfo = await this.getCpuInfo();

      return {
        result: true,
        code: 200,
        message: '서버 상태를 성공적으로 확인했습니다.',
        data: {
          processInfo,
          memoryInfo,
          cpuInfo,
          uptime: this.formatUptime(process.uptime()),
        },
      };
    } catch (error) {
      return {
        result: false,
        code: 500,
        message: '서버 상태 확인 중 오류가 발생했습니다.',
        data: {
          processInfo: { isRunning: false, pid: 0 },
          memoryInfo: { free: '0MB', total: '0MB' },
          cpuInfo: { used: '0%', idle: '0%' },
          uptime: '0초',
        },
      };
    }
  }
}
