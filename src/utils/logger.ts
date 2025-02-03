import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports, Logger } from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { IHttpLogger } from '../types/logger';

const { combine, timestamp, printf } = format;

export class ExpressLogger implements IHttpLogger {
  // 변수
  private debug: boolean;
  private logger: Logger | undefined;
  private logPath: string;

  // 생성자
  constructor(logPath: string = 'logs', logLevel: string = 'info') {
    // 디버그 모드 설정
    this.debug = process.env.NODE_ENV === 'development';

    // 로그 디렉토리 설정
    this.logPath = logPath;

    // 로그 디렉토리가 없는 경우 생성
    try {
      if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath, { recursive: true });
      }

    // 로그 디렉토리 생성 실패
    } catch (error) {
      console.error(`Failed to create log directory: ${logPath}`);

    }
    
    // 로그 포맷 설정
    const logFormat = printf(({ level, message, timestamp }) => {
      return `${timestamp} - ${level.toUpperCase()} - ${message}`;
    });

    // Logger 생성
    if (!this.debug) {
      this.logger = createLogger({
        level: logLevel,
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          logFormat
        ),
        transports: [
          new DailyRotateFile({
            filename: path.join(this.logPath, 'info-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: '30d',
            level: 'info',
          }),
          new DailyRotateFile({
            filename: path.join(this.logPath, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: '30d',
            level: 'error',
          }),
        ],
      });
    
    // Logger 생성 실패
    } else {
      this.logger = undefined;

    }
  }

  // info 로그 출력
  public info(message: string): void {
    // 디버그 모드 또는 로거가 없는 경우 콘솔에 출력
    if (this.debug || !this.logger) {
      console.log(message);
      return;
    }

    // 로그 출력
    this.logger.info(message);

  }

  // error 로그 출력
  public error(message: string): void {
    // 디버그 모드 또는 로거가 없는 경우 콘솔에 출력
    if (this.debug || !this.logger) {
      console.error(message);
      return;

    }

    // 로그 출력
    this.logger.error(message);

  }

  // 요청 로그 출력
  public logRequest(req: Request, userId?: string | null): void {
    // 요청 정보 추출
    const { ip: clientIp, headers, method, originalUrl } = req;
    
    // 로그 메세지
    const logMessage = 
      `Request: ${method} ${originalUrl}, ` +
      `UserID: ${userId || 'N/A'}, ` +
      `ClientIP: ${clientIp}, ` +
      `Origin: ${headers.origin || 'N/A'}, ` +
      `Identifier: ${headers['x-identifier'] || 'N/A'}, ` +
      `User-Agent: ${headers['user-agent']}, ` +
      `Host: ${headers.host}`;

    // 로그 출력
    this.info(logMessage);
    
  }

  // 응답 로그 출력
  public logResponse(req: Request, res: Response): void {
    // 응답 정보 추출
    const { ip: clientIp, headers, method, originalUrl } = req;

    // 로그 메세지
    const logMessage = 
      `Response: ${res.statusCode} ${method} ${originalUrl}, ` +
      `ClientIP: ${clientIp}, ` +
      `Origin: ${headers.origin || 'N/A'}, ` +
      `Identifier: ${headers['x-identifier'] || 'N/A'}, ` +
      `User-Agent: ${headers['user-agent']}, ` +
      `Host: ${headers.host}`;

    // 로그 출력
    this.info(logMessage);
    
  }

  // 예외 로그 출력
  public logException(req: Request, error: Error): void {
    // 요청 정보 추출
    const { ip: clientIp, headers } = req;

    // 로그 메세지
    const logMessage =
      `Exception: ${error.message}, ` +
      `ClientIP: ${clientIp}, ` +
      `Origin: ${headers.origin || 'N/A'}, ` +
      `Identifier: ${headers['x-identifier'] || 'N/A'}, ` +
      `User-Agent: ${headers['user-agent']}, ` +
      `Host: ${headers.host}`;

    // 로그 출력
    this.error(logMessage);
      
  }
}
