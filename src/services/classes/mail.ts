import nodemailer from 'nodemailer';

import { Config } from '../../config/config';

// 이메일 옵션 인터페이스
export interface IMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// 이메일 오류 클래스
export class MailError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'MailError';
  }
}

// 이메일 서비스 클래스
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1초

  // 생성자
  constructor(private readonly config: Config) {
    this.validateConfig();
    this.transporter = this.createTransporter();
  }

  // 설정 검증
  private validateConfig(): void {
    try {
      this.config.getSMTPService();
      this.config.getSMTPHost();
      this.config.getSMTPPort();
      this.config.getSMTPUser();
      this.config.getSMTPPassword();
      this.config.getSMTPFrom();
    } catch (error) {
      throw new MailError('SMTP 설정이 올바르지 않습니다.', error);
    }
  }

  // 이메일 전송자 생성
  private createTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      service: this.config.getSMTPService(),
      host: this.config.getSMTPHost(),
      port: this.config.getSMTPPort(),
      secure: false,
      requireTLS: true,
      auth: {
        user: this.config.getSMTPUser(),
        pass: this.config.getSMTPPassword(),
      },
      debug: this.config.getEnv() !== 'production',
      logger: this.config.getEnv() !== 'production',
    });
  }

  // 지연 함수
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 이메일 전송
  public async send(options: IMailOptions): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.transporter.sendMail({
          from: this.config.getSMTPFrom(),
          ...options,
        });
        return;
      } catch (error) {
        lastError = error;
        console.warn(`이메일 전송 시도 ${attempt}/${this.maxRetries} 실패:`, error);

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw new MailError('이메일 전송 실패', lastError);
  }

  // 컨텐츠 등록 템플릿 생성
  public templateContentRegist(
    subject: string,
    kind: string,
    contentTitle: string,
    registAt: string,
    contentUrl: string,
    companyName: string,
    companyAddress: string
  ) {
    return generateContentRegistTemplate(
      subject,
      kind,
      contentTitle,
      registAt,
      contentUrl,
      companyName,
      companyAddress
    );
  }
}

// 컨텐츠 등록 템플릿 생성
const generateContentRegistTemplate = (
  subject: string,
  kind: string,
  contentTitle: string,
  registAt: string,
  contentUrl: string,
  companyName: string,
  companyAddress: string
) => {
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
};
