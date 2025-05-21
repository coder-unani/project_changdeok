import nodemailer from 'nodemailer';

export interface IMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class MailService {
  private static instance: MailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Google의 SMTP 서비스를 명시적으로 지정
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS는 연결 후 시작됨
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      debug: process.env.NODE_ENV !== 'production', // 개발 환경에서만 디버그 로그
      logger: process.env.NODE_ENV !== 'production',
    });
  }

  public static getInstance(): MailService {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  async sendMail(options: IMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        ...options,
      });
    } catch (error) {
      console.error('이메일 전송 중 오류가 발생했습니다:', error);
      throw error;
    }
  }
}
