import dotenv from 'dotenv';

import { prisma } from '../library/database';
import { ISettings } from '../types/config';
import { ICORSOptions } from '../types/config';

dotenv.config();

export class Config {
  private static instance: Config;
  private settings: ISettings | null = null;

  private constructor() {}

  // 싱글톤 인스턴스 반환
  public static getInstance = () => {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  };

  public init = async () => {
    if (this.settings) {
      return;
    }

    // 사이트 셋팅 조회
    const prismaData = await prisma.settings.findUnique({
      where: {
        id: 1,
      },
    });

    // 사이트 셋팅이 존재하지 않으면 예외 발생
    if (!prismaData) {
      throw new Error('사이트 셋팅이 존재하지 않습니다.');
    }

    // 사이트 셋팅 데이터 반환
    const settings: ISettings = {
      title: prismaData?.title || '',
      introduction: prismaData?.introduction || '',
      description: prismaData?.description || '',
      keywords: prismaData?.keywords || '',
      favicon: prismaData?.favicon || '',
      logo: prismaData?.logo || '',
      ogTagJson: prismaData?.ogTagJson || '',
      companyJson: prismaData?.companyJson || '',
      serviceDomain: prismaData?.serviceDomain || '',
      servicePort: prismaData?.servicePort || 80,
      expressDomain: prismaData?.expressDomain || '',
      expressPort: prismaData?.expressPort || 80,
      maxUploadSize: prismaData?.maxUploadSize || 20,
      jwtExpireSecond: prismaData?.jwtExpireSecond || 3600,
      enabledTagsJson: prismaData?.enabledTagsJson || '',
      enabledCorsJson: prismaData?.enabledCorsJson || '',
      blockedIpJson: prismaData?.blockedIpJson || '',
      blockedBotJson: prismaData?.blockedBotJson || '',
      createdAt: prismaData?.createdAt || new Date(),
      updatedAt: prismaData?.updatedAt || null,
    };

    // 사이트 셋팅 데이터 저장
    this.settings = settings;
  };

  // 실행 환경 선언 변수
  public getEnv = () => {
    return process.env.NODE_ENV || 'development';
  };

  // 사이트 셋팅 데이터 반환
  public getSettings = () => {
    if (!this.settings) {
      throw new Error('사이트 셋팅이 초기화되지 않았습니다.');
    }
    return this.settings;
  };

  // express 도메인 반환
  public getExpressDomain = () => {
    return this.settings?.expressDomain || 'http://localhost';
  };

  // express 포트 반환
  public getExpressPort = (): number => {
    return Number(this.settings?.expressPort) || 3000;
  };

  // express URL 반환
  public getExpressUrl = () => {
    const port = this.getExpressPort();
    const domain = this.getExpressDomain();

    return !port || port === 80 || port === 443 ? domain : `${domain}:${port}`;
  };

  // 정적 파일 경로 반환
  public getStaticPath = () => {
    return process.env.STATIC_PATH || '';
  };

  // 로그 경로 반환
  public getLogPath = () => {
    return process.env.LOG_PATH || '';
  };

  // 로그 레벨 반환
  public getLogLevel = () => {
    return process.env.LOG_LEVEL || '';
  };

  /**
   * JWT 비밀키 반환
   * openssl rand -base64 32 (납품처가 변경될 때마다 새로운 키를 생성)
   * @returns string
   */
  public getJwtSecretKey = (): string => {
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('JWT_SECRET_KEY가 설정되지 않았습니다.');
    }
    return process.env.JWT_SECRET_KEY;
  };

  // Crypto 비밀키 반환
  /**
   * Crypto 비밀키 반환
   * openssl rand -base64 32 (납품처가 변경될 때마다 새로운 키를 생성)
   * *** 이 키를 분실 할 경우.. 데이터 복구가 불가능합니다. ***
   * @returns string
   */
  public getCryptoSecretKey = (): string => {
    if (!process.env.CRYPTO_SECRET_KEY) {
      throw new Error('CRYPTO_SECRET_KEY가 설정되지 않았습니다.');
    }
    return process.env.CRYPTO_SECRET_KEY;
  };

  // Google reCAPTCHA 사이트 키 반환
  public getRecaptchaSiteKey = (): string => {
    if (!process.env.RECAPTCHA_SITE_KEY) {
      throw new Error('RECAPTCHA_SITE_KEY가 설정되지 않았습니다.');
    }
    return process.env.RECAPTCHA_SITE_KEY;
  };

  // Google reCAPTCHA 비밀 키 반환
  public getRecaptchaSecretKey = (): string => {
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      throw new Error('RECAPTCHA_SECRET_KEY가 설정되지 않았습니다.');
    }
    return process.env.RECAPTCHA_SECRET_KEY;
  };

  // SMTP 정보 반환
  public getSMTPService = (): string => {
    if (!process.env.SMTP_SERVICE) {
      throw new Error('SMTP_SERVICE가 설정되지 않았습니다.');
    }
    return process.env.SMTP_SERVICE;
  };

  public getSMTPHost = (): string => {
    if (!process.env.SMTP_HOST) {
      throw new Error('SMTP_HOST가 설정되지 않았습니다.');
    }
    return process.env.SMTP_HOST;
  };

  public getSMTPPort = (): number => {
    if (!process.env.SMTP_PORT) {
      throw new Error('SMTP_PORT가 설정되지 않았습니다.');
    }
    return Number(process.env.SMTP_PORT);
  };

  public getSMTPUser = (): string => {
    if (!process.env.SMTP_USER) {
      throw new Error('SMTP_USER가 설정되지 않았습니다.');
    }
    return process.env.SMTP_USER;
  };

  public getSMTPPassword = (): string => {
    if (!process.env.SMTP_PASSWORD) {
      throw new Error('SMTP_PASSWORD가 설정되지 않았습니다.');
    }
    return process.env.SMTP_PASSWORD;
  };

  public getSMTPFrom = (): string => {
    if (!process.env.SMTP_FROM) {
      throw new Error('SMTP_FROM이 설정되지 않았습니다.');
    }
    return process.env.SMTP_FROM;
  };

  public getCORSApiOptions = (): ICORSOptions => {
    return {
      origin: this.settings?.enabledCorsJson || '',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400, // 24시간
      optionsSuccessStatus: 200,
    };
  };

  public getCORSBackendOptions = (): ICORSOptions => {
    return {
      origin: this.settings?.enabledCorsJson || '',
      optionsSuccessStatus: 200,
    };
  };

  public getCORSFrontendOptions = (): ICORSOptions => {
    return {
      origin: this.settings?.enabledCorsJson || '',
      optionsSuccessStatus: 200,
    };
  };
}

export const asyncConfig = async () => {
  const config = Config.getInstance();
  await config.init();
  return config;
};
