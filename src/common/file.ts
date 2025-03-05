import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

type typeFilter = "image" | "video";

/**
 * 파일 업로드 클래스
 */
export class FileUploader {
  private storage: StorageEngine;
  private fileFilter: (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => void;
  private uploader: multer.Multer;

  constructor(filter: typeFilter) {
    // 허용되는 파일 필터 설정
    const destinations = {
      image: "public/uploads/images/",
      video: "public/uploads/videos/",
    }

    // destinations에 정의된 폴더가 없으면 생성
    makeDir(destinations.image);
    makeDir(destinations.video);
    
    // 파일 저장 위치 및 이름 설정
    this.storage = multer.diskStorage({
      // 업로드 폴더 설정
      destination: (req, file, cb) => {
        // cb(null, "uploads/");
        if (filter === "image") {
          cb(null, destinations.image);
        } else if (filter === "video") {
          cb(null, destinations.video);
        }
      },
      // 고유 파일명 생성
      filename: (req, file, cb) => {
        const fileName = makeFileName(file.originalname);
        cb(null, fileName);
      },
    });

    // 파일 필터링
    this.fileFilter = (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      // 이미지 파일 허용
      if (filter === "image" && file.mimetype.startsWith("image/")) {
        cb(null, true);

      // 비디오 파일 허용
      } else if (filter === "video" && file.mimetype.startsWith("video/")) {
        cb(null, true);

      // 허용되지 않는 파일 형식
      } else {
        cb(new Error(`${filter} 파일만 업로드 가능합니다.`) as unknown as null, false);

      }
    };

    this.uploader = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: { fileSize: 20 * 1024 * 1024 }, // 최대 파일 크기 제한 (20MB)
    });
  }

  public getInstance () {
    return this.uploader;
  }

  public upload (field: string) {
    return this.uploader.single(field);
  }
}

/**
 * 이미지 전처리 클래스
 */
export class ImagePreProcessor {
  private sharp: any;

  constructor() {
    this.sharp = require("sharp");
  }

  public async process (src: string, dest: string, width: number, height: number, format: string) {
    try {
      const source = await this.sharp(src);

      if (width && height) {
        await source.resize(width, height)
      }

      if (format) {
        await source.toFormat(format);
      }

      await source.toFile(dest);

      return true;

    } catch (error) {
      return false;

    }
  }
}

/**
 * 파일명 생성 함수
 * @param originalname 원래 파일명
 * @param prefix 접두어가 필요한 경우 사용
 * @param suffix 접미어가 필요한 경우 사용
 * @param ext 확장자 변환을 원하는 경우 사용
 * @returns string 생성된 파일명
 */
export function makeFileName (originalName: string, useOriginalName: boolean = false, prefix: string = "", suffix: string = "", ext: string = ""): string {
  // 파일명 생성 변수
  let filename = null;

  // 원래 파일명 사용
  if (useOriginalName) {
    // 원래 파일명에서 확장자만 제거
    const extname = path.extname(originalName);
    filename = originalName.replace(extname, "");

  } else {
    // prefix 추가
    if (prefix) {
      filename = `${prefix}-`;
    }

    // 고유한 파일명 생성
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    filename = filename ? `${filename}${uniqueSuffix}` : uniqueSuffix;

    // suffix 추가
    if (suffix) {
      filename = `${filename}-${suffix}`;
    }
  }

  // 확장자 추가
  const extname = (ext) ? `.${ext}` : path.extname(originalName);
  filename = filename + extname;

  // 생성된 파일명 반환
  return filename;
}

/**
 * 디렉토리 생성 함수
 * @param dir 생성할 디렉토리 경로
 * @returns boolean 생성 성공 여부
 */
export function makeDir(dir: string): boolean {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return true;

  } catch (error) {
    return false;

  }
}

/**
 * 파일 삭제 함수
 * @param filePath 삭제할 파일 경로
 * @returns boolean 삭제 성공 여부
 */
export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;

  } catch (error) {
    return false;

  } 
}