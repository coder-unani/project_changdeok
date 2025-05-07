import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import multer, { StorageEngine } from 'multer';
import path from 'path';
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
  fields?: { name: string; maxCount: number; filename?: string; allowOverwrite?: boolean }[];
}

export class MediaUploadMiddleware implements IMiddleware {
  private uploadPath: string;
  private filter: typeFilter;
  private maxFileSize: number;
  private useDateFolder: boolean;
  private convertToWebP: boolean;
  private webpQuality: number;
  private fields?: { name: string; maxCount: number; filename?: string; allowOverwrite?: boolean }[];

  constructor(options: IMediaUploadMiddlewareOptions) {
    // 'public/' 밑에 options.uploadPath 경로가 있으면 경로 생성
    this.uploadPath = options.uploadPath ? `${options.uploadPath}` : 'public/uploads/';
    this.filter = options.filter ? options.filter : 'image'; // 파일 필터
    this.maxFileSize = options.maxFileSize ? options.maxFileSize : 20 * 1024 * 1024; // 20MB
    this.useDateFolder = options.useDateFolder !== undefined ? options.useDateFolder : false; // 날짜 폴더 사용 여부
    this.convertToWebP = options.convertToWebP !== undefined ? options.convertToWebP : false; // WebP 변환 여부
    this.webpQuality = options.webpQuality ? options.webpQuality : 80; // WebP 품질
    this.fields = options.fields ? options.fields : [{ name: 'file', maxCount: 1 }];
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
        // fields에서 현재 필드에 대한 설정 찾기
        const fieldConfig = this.fields?.find((field) => field.name === file.fieldname);

        if (fieldConfig?.filename) {
          // filename이 지정된 경우 해당 이름 사용
          const baseFilename = fieldConfig.filename + path.extname(file.originalname);

          // allowOverwrite가 false인 경우에만 중복 체크
          if (fieldConfig.allowOverwrite === false) {
            const fullPath = path.join(uploadPath, baseFilename);

            // 파일이 이미 존재하는지 확인
            if (fs.existsSync(fullPath)) {
              // 파일명에서 확장자 분리
              const ext = path.extname(baseFilename);
              const nameWithoutExt = path.basename(baseFilename, ext);

              // 숫자를 붙여가며 중복되지 않는 파일명 찾기
              let counter = 1;
              let newFilename = `${nameWithoutExt}-${counter}${ext}`;
              let newPath = path.join(uploadPath, newFilename);

              while (fs.existsSync(newPath)) {
                counter++;
                newFilename = `${nameWithoutExt}-${counter}${ext}`;
                newPath = path.join(uploadPath, newFilename);
              }

              cb(null, newFilename);
              return;
            }
          }

          // allowOverwrite가 true이거나 지정되지 않은 경우 그냥 덮어쓰기
          cb(null, baseFilename);
        } else {
          // 기존 로직: 랜덤 파일명 생성
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
        }
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

    // fields 옵션이 있으면 fields() 사용

    if (this.fields) {
      const upload = multer({
        storage,
        fileFilter,
        limits: { fileSize: this.maxFileSize },
      }).fields(this.fields);

      upload(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              // 원하는 코드와 메시지로 응답
              return res.status(413).json({ message: '파일이 너무 큽니다. 최대 20MB까지 업로드 가능합니다.' });
              // 또는 400 등 원하는 코드로 변경 가능
            } else {
              return res.status(400).json({ message: err.message });
            }
          }
          return res.status(400).json({ message: err.message || '파일 업로드 중 오류가 발생했습니다.' });
        }

        // WebP 변환 로직 수정
        if (this.convertToWebP && req.files) {
          try {
            // req.files는 이제 { [fieldname: string]: Express.Multer.File[] } 형태
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            // 모든 필드의 파일들을 순회
            for (const fieldFiles of Object.values(files)) {
              for (const file of fieldFiles) {
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
            }
          } catch (error) {
            return res.status(500).json({ message: '이미지 변환 중 오류가 발생했습니다.' });
          }
        }

        next();
      });
    } else {
      next();
    }
  }
}
