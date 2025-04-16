import sharp from 'sharp';
import fs from 'fs';

export async function imageExtensionConvert(imagePath: string): Promise<string> {
  // 이미지 패스에 실제 파일이 존재하는지 확인
  try {
    const stats = await fs.promises
      .stat(imagePath);
  } catch (error) {
    throw new Error('이미지 파일이 존재하지 않습니다.');
  }




  const image = await sharp(imagePath);
  const metadata = await image.metadata();
  if (!metadata.format) {
    throw new Error('이미지 메타데이터를 가져올 수 없습니다.');
  }

  const format = metadata.format;
  const extension = format === 'jpeg' ? 'jpg' : format;
  return extension;
}

export async function imageResize(imagePath: string, width: number, height: number): Promise<Buffer> {
  const image = sharp(imagePath);
  return await image.resize(width, height).toBuffer();
}

//     } catch (error) {