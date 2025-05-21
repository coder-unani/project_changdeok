import nodemailer from 'nodemailer';

import { Config, asyncConfig } from '../../config/config';
import { ExtendedPrismaClient } from '../../library/database';

export interface IMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class MailService {
  private config: Config;
  private prisma: ExtendedPrismaClient;
  private transporter: nodemailer.Transporter;

  constructor(prisma: ExtendedPrismaClient, config: Config) {
    this.prisma = prisma;
    this.config = config;
    this.transporter = nodemailer.createTransport({
      service: config.getSMTPService(), // Google의 SMTP 서비스를 명시적으로 지정
      host: config.getSMTPHost(),
      port: config.getSMTPPort(),
      secure: false, // TLS는 연결 후 시작됨
      requireTLS: true,
      auth: {
        user: this.config.getSMTPUser(),
        pass: this.config.getSMTPPassword(),
      },
      debug: this.config.getEnv() !== 'production', // 개발 환경에서만 디버그 로그
      logger: this.config.getEnv() !== 'production',
    });
  }

  public async send(options: IMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.getSMTPFrom(),
        ...options,
      });
    } catch (error) {
      console.error('이메일 전송 중 오류가 발생했습니다:', error);
      throw error;
    }
  }

  public templateContentRegist(
    subject: string,
    kind: string,
    contentTitle: string,
    registAt: string,
    contentUrl: string,
    companyName: string,
    companyAddress: string
  ) {
    const currentYear = new Date().getFullYear();

    const text = `[${subject}] ${kind} 게시판에 새 글이 등록되었습니다. ${contentTitle} (${registAt})`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0;">
        <table align="center" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center; background-color: #000000; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${companyName.toUpperCase()}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; line-height: 1.4; color: #333333;">안녕하세요, 고객님!</h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                ${kind} 게시판에 새 글이 등록되었습니다.
              </p>
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                아래 버튼을 클릭하여 자세한 내용을 확인하실 수 있습니다.
              </p>
              <!-- 추가 정보 섹션 -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                      <strong>${contentTitle}</strong><br>
                      ${registAt}에 새글이 등록되었습니다.
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${contentUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 12px 30px; border-radius: 4px;" target="_blank">자세히 보기</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f0f2f5; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
              <p style="margin: 10px 0 10px 0; font-size: 14px; line-height: 1.6; color: #777777;">
                © ${currentYear} ${companyName}. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #777777;">
                ${companyAddress}
              </p>
              <div style="margin-top: 20px;">
                <a href="#" style="display: inline-block; margin: 0 5px; color: #000000; text-decoration: none; cursor: default;">
                  <span style="font-size: 20px;">●</span>
                </a>
                <a href="#" style="display: inline-block; margin: 0 5px; color: #000000; text-decoration: none; cursor: default;">
                  <span style="font-size: 20px;">●</span>
                </a>
                <a href="#" style="display: inline-block; margin: 0 5px; color: #000000; text-decoration: none; cursor: default;">
                  <span style="font-size: 20px;">●</span>
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return { text, html };
  }
}
