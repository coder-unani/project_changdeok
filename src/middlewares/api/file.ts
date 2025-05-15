import { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import sharp from 'sharp';

import { IMiddleware } from '../../types/middleware';

// 파일 필터 타입 정의 (이미지 또는 비디오)
type typeFilter = 'image' | 'video';

// 미들웨어 설정 옵션 인터페이스
interface IFileUploadMiddlewareOptions {
  fields: {
    // 다중 파일 필드 설정
    name: string; // 필드 이름
    maxCount: number; // 최대 파일 개수
    filename?: string; // 파일 이름
    allowOverwrite?: boolean; // 파일 덮어쓰기 허용 여부
    uploadPath?: string; // 필드별 업로드 경로
    filter?: typeFilter; // 필드별 파일 타입
    useDateFolder?: boolean; // 필드별 날짜 폴더 사용 여부
    convertToWebP?: boolean; // 필드별 WebP 변환 여부
    webpQuality?: number; // 필드별 WebP 품질
  }[];
}

export class FileUploadMiddleware implements IMiddleware {
  // 클래스 프로퍼티 정의 (readonly로 불변성 보장)
  private readonly uploadPath: string;
  private readonly fields: {
    name: string;
    maxCount: number;
    filename?: string;
    allowOverwrite?: boolean;
    uploadPath?: string;
    filter?: typeFilter;
    useDateFolder?: boolean;
    convertToWebP?: boolean;
    webpQuality?: number;
  }[];

  constructor(options: IFileUploadMiddlewareOptions) {
    this.uploadPath = 'public/uploads/';
    this.fields = options.fields;
  }

  // 날짜별 폴더 생성 메서드
  private async createDateFolder(basePath: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const fullPath = path.join(basePath, year, month);

    await fs.mkdir(fullPath, { recursive: true, mode: 0o755 });
    return fullPath;
  }

  // 중복되지 않는 파일명 생성 메서드
  private async generateUniqueFilename(
    basePath: string,
    baseFilename: string,
    allowOverwrite: boolean
  ): Promise<string> {
    if (allowOverwrite) {
      return baseFilename;
    }

    const ext = path.extname(baseFilename);
    const nameWithoutExt = path.basename(baseFilename, ext);
    let counter = 1;
    let newFilename = `${nameWithoutExt}-${counter}${ext}`;
    let newPath = path.join(basePath, newFilename);

    try {
      await fs.access(newPath, fs.constants.F_OK);
      while (true) {
        counter++;
        newFilename = `${nameWithoutExt}-${counter}${ext}`;
        newPath = path.join(basePath, newFilename);
        try {
          await fs.access(newPath, fs.constants.F_OK);
        } catch {
          break;
        }
      }
    } catch {
      // 파일이 존재하지 않으면 첫 번째 생성된 이름 사용
    }

    return newFilename;
  }

  // WebP 형식으로 이미지 변환 메서드
  private async convertToWebPFormat(file: Express.Multer.File, quality: number): Promise<Express.Multer.File> {
    const originalPath = file.path;
    const webpPath = path.join(path.dirname(originalPath), `${path.parse(originalPath).name}.webp`);

    try {
      await sharp(originalPath).webp({ quality }).toFile(webpPath);

      await fs.unlink(originalPath);

      return {
        ...file,
        path: webpPath,
        filename: path.basename(webpPath),
        mimetype: 'image/webp',
      };
    } catch (error) {
      throw new Error('이미지 변환 중 오류가 발생했습니다.');
    }
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    // API 경로가 아닌 경우 미들웨어 실행하지 않음
    if (!req.path.startsWith('/api')) {
      next();
      return;
    }

    // 파일 업로드 저장 엔진 설정
    const storage: StorageEngine = multer.diskStorage({
      // 업로드 파일 저장 경로 설정
      destination: async (req, file, cb) => {
        try {
          const fieldConfig = this.fields.find((field) => field.name === file.fieldname);
          const uploadPath = fieldConfig?.uploadPath || this.uploadPath;
          const useDateFolder = fieldConfig?.useDateFolder ?? false;

          const finalPath = useDateFolder ? await this.createDateFolder(uploadPath) : uploadPath;

          await fs.mkdir(finalPath, { recursive: true });
          cb(null, finalPath);
        } catch (error) {
          cb(error as Error, '');
        }
      },
      // 업로드 파일명 설정
      filename: async (req, file, cb) => {
        try {
          const fieldConfig = this.fields.find((field) => field.name === file.fieldname);

          if (fieldConfig?.filename) {
            // 파일 이름이 고정된 경우 고정된 이름 사용
            const baseFilename = fieldConfig.filename + path.extname(file.originalname);
            const uploadPath = fieldConfig.uploadPath || this.uploadPath;
            const newFilename = await this.generateUniqueFilename(
              uploadPath,
              baseFilename,
              fieldConfig.allowOverwrite ?? true
            );
            cb(null, newFilename);
          } else {
            // 랜덤 파일명 생성
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
          }
        } catch (error) {
          cb(error as Error, '');
        }
      },
    });

    // 파일 타입 필터링
    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const fieldConfig = this.fields.find((field) => field.name === file.fieldname);
      const filter = fieldConfig?.filter || 'image';

      if (
        (filter === 'image' && file.mimetype.startsWith('image/')) ||
        (filter === 'video' && file.mimetype.startsWith('video/'))
      ) {
        cb(null, true);
      } else {
        cb(new Error(`${filter} 파일만 업로드 가능합니다.`) as unknown as null, false);
      }
    };

    // 다중 파일 업로드 처리
    const upload = multer({
      storage,
      fileFilter,
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }).fields(this.fields);

    upload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
            message:
              err.code === 'LIMIT_FILE_SIZE' ? '파일이 너무 큽니다. 최대 20MB까지 업로드 가능합니다.' : err.message,
          });
        }
        return res.status(400).json({ message: err.message || '파일 업로드 중 오류가 발생했습니다.' });
      }

      // WebP 변환 처리
      if (req.files) {
        try {
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };

          for (const [fieldname, fieldFiles] of Object.entries(files)) {
            const fieldConfig = this.fields.find((field) => field.name === fieldname);
            const convertToWebP = fieldConfig?.convertToWebP ?? false;
            const webpQuality = fieldConfig?.webpQuality || 80;

            // 이미지 필드이고 WebP 변환이 활성화된 경우에만 변환
            if (fieldConfig?.filter === 'image' && convertToWebP) {
              for (let i = 0; i < fieldFiles.length; i++) {
                const file = fieldFiles[i];
                if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/webp') {
                  fieldFiles[i] = await this.convertToWebPFormat(file, webpQuality);
                }
              }
            }
          }
        } catch (error) {
          return res
            .status(500)
            .json({ message: error instanceof Error ? error.message : '이미지 변환 중 오류가 발생했습니다.' });
        }
      }

      next();
    });
  }
}
