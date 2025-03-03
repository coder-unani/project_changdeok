import { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

import { IMiddleware } from '../../types/middleware';

type typeFilter = 'image' | 'video';
interface IMediaUploadMiddlewareOptions {
  uploadPath?: string;
  filter?: typeFilter;
  fieldName?: string;
  maxFileCount?: number;
  maxFileSize?: number;
  convertExtension?: string;
}

export class MediaUploadMiddleware implements IMiddleware {
  private uploadPath: string;
  private filter: typeFilter;
  private fieldName: string;
  private maxFileCount: number;
  private maxFileSize: number;

  constructor(options: IMediaUploadMiddlewareOptions) {
    this.uploadPath = (options.uploadPath) ? options.uploadPath : 'public/uploads/';
    this.filter = (options.filter) ? options.filter : 'image';
    this.fieldName = (options.fieldName) ? options.fieldName : 'file';
    this.maxFileCount = (options.maxFileCount) ? options.maxFileCount : 1;
    this.maxFileSize = (options.maxFileSize) ? options.maxFileSize : 20 * 1024 * 1024; // 20MB
  }

  handle(req: Request, res: Response, next: NextFunction): void {

    // 파일 업로드 경로 없을 경우 생성
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }

    // Multer 저장소 설정
    const storage: StorageEngine = multer.diskStorage({
      // 업로드 파일 디렉토리 설정
      destination: (req, file, cb) => {
        cb(null, this.uploadPath);
      },
      // 업로드 파일명 설정
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
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
    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message || '파일 업로드 중 오류가 발생했습니다.' });
      }

      // 다음 미들웨어로 이동
      next();
    });
  }
}
