import nodemailer from 'nodemailer';

export interface IMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
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
