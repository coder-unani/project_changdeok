import { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

import { IMiddleware } from '../../types/middleware';

type typeFilter = 'image' | 'video';
interface IMediaUploadMiddlewareOptions {
  uploadPath?: string;
  filter?: typeFilter;
  fieldName?: string;
  maxFileCount?: number;
  maxFileSize?: number;
  convertExtension?: string;
  useDateFolder?: boolean;
  convertToWebP?: boolean;
  webpQuality?: number;
}

export class MediaUploadMiddleware implements IMiddleware {
  private uploadPath: string;
  private filter: typeFilter;
  private fieldName: string;
  private maxFileCount: number;
  private maxFileSize: number;
  private useDateFolder: boolean;
  private convertToWebP: boolean;
  private webpQuality: number;

  constructor(options: IMediaUploadMiddlewareOptions) {
    // 'public/' 밑에 options.uploadPath 경로가 있으면 경로 생성
    this.uploadPath = options.uploadPath ? `public/${options.uploadPath}/` : 'public/uploads/';

    this.filter = options.filter ? options.filter : 'image';
    this.fieldName = options.fieldName ? options.fieldName : 'file';
    this.maxFileCount = options.maxFileCount ? options.maxFileCount : 1;
    this.maxFileSize = options.maxFileSize ? options.maxFileSize : 20 * 1024 * 1024; // 20MB
    this.useDateFolder = options.useDateFolder !== undefined ? options.useDateFolder : false;
    this.convertToWebP = options.convertToWebP !== undefined ? options.convertToWebP : false;
    this.webpQuality = options.webpQuality ? options.webpQuality : 80;
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    // 날짜 폴더 생성 함수
    const createDateFolder = (basePath: string): string => {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');

      // 전체 경로 생성
      const fullPath = path.join(basePath, year, month);

      // 폴더가 없으면 생성
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      return fullPath;
    };

    // 파일 업로드 경로 설정
    let uploadPath = this.uploadPath;
    if (this.useDateFolder) {
      uploadPath = createDateFolder(this.uploadPath);
    } else if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }

    // Multer 저장소 설정
    const storage: StorageEngine = multer.diskStorage({
      // 업로드 파일 디렉토리 설정
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      // 업로드 파일명 설정
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

    // 파일 필터
    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      // 이미지 파일 허용
      if (this.filter === 'image' && file.mimetype.startsWith('image/')) {
        cb(null, true);
        // 비디오 파일 허용
      } else if (this.filter === 'video' && file.mimetype.startsWith('video/')) {
        cb(null, true);
        // 그외 허용되지 않는 파일 형식
      } else {
        cb(new Error(`${this.filter} 파일만 업로드 가능합니다.`) as unknown as null, false);
      }
    };

    // 파일 업로드 설정 (MultiFile)
    /**
      싱글 파일 업로드 예제
      const upload = multer({
        storage,
        fileFilter,
        limits: { fileSize: this.maxFileSize },
      }).single(this.fieldName);    
     */
    const upload = multer({
      storage,
      fileFilter,
      limits: { fileSize: this.maxFileSize },
    }).array(this.fieldName, this.maxFileCount);

    // 파일 업로드 실행
    upload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            // 원하는 코드와 메시지로 응답
            return res.status(413).json({ error: '파일이 너무 큽니다. 최대 50MB까지 업로드 가능합니다.' });
            // 또는 400 등 원하는 코드로 변경 가능
          } else {
            return res.status(400).json({ message: err.message });
          }
        }
        return res.status(400).json({ message: err.message || '파일 업로드 중 오류가 발생했습니다.' });
      }

      // WebP 변환이 활성화되어 있고, 파일이 존재하는 경우
      if (this.convertToWebP && req.files && Array.isArray(req.files)) {
        try {
          for (const file of req.files) {
            if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/webp') {
              const originalPath = file.path;
              const webpPath = path.join(path.dirname(originalPath), `${path.parse(originalPath).name}.webp`);

              // WebP로 변환
              await sharp(originalPath).webp({ quality: this.webpQuality }).toFile(webpPath);

              // 원본 파일 삭제
              fs.unlinkSync(originalPath);

              // 파일 정보 업데이트
              file.path = webpPath;
              file.filename = path.basename(webpPath);
              file.mimetype = 'image/webp';
            }
          }
        } catch (error) {
          return res.status(500).json({ message: '이미지 변환 중 오류가 발생했습니다.' });
        }
      }

      // 다음 미들웨어로 이동
      next();
    });
  }
}
