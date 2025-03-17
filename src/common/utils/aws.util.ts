import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { IAwsUploadFile } from '../interfaces/aws.interface';
import { BadRequestException } from '@nestjs/common';
import { BaseHelper } from './helper/helper.util';
import { ENVIRONMENT } from '../configs/environment';
import * as sharp from 'sharp';
import { Buffer } from 'buffer';

// if (
//   !ENVIRONMENT.AWS.ACCESS_KEY ||
//   !ENVIRONMENT.AWS.BUCKET_NAME ||
//   !ENVIRONMENT.AWS.REGION ||
//   !ENVIRONMENT.AWS.SECRET
// ) {
//   throw new Error('Aws S3 environment variables are not set ');
// }

// S3 client configuration
export const s3Client = new S3Client({
  region: ENVIRONMENT.AWS.REGION,
  credentials: {
    accessKeyId: ENVIRONMENT.AWS.ACCESS_KEY,
    secretAccessKey: ENVIRONMENT.AWS.SECRET,
  },
});

async function optimizeImage(
  buffer: Buffer,
  maxSizeInBytes: number = 1024 * 1024,
): Promise<Buffer> {
  if (!Buffer.isBuffer(buffer)) {
    console.error('Invalid buffer');
    return buffer;
  }

  let firstOptimizedBuffer = null;

  try {
    let quality = 80;
    let optimizedBuffer = await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    firstOptimizedBuffer = optimizedBuffer;

    while (optimizedBuffer.length > maxSizeInBytes && quality > 10) {
      quality -= 5;
      optimizedBuffer = await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
    }

    return optimizedBuffer;
  } catch (error) {
    console.error('Error optimizing image', error);

    // if there is an error, return the first optimized buffer if it exists, otherwise return the original buffer
    return firstOptimizedBuffer ?? buffer;
  }
}

export const uploadSingleFile = async (
  payload: IAwsUploadFile,
): Promise<{ secureUrl: string; blurHash?: string }> => {
  const { fileName, buffer, mimetype } = payload;

  if (!fileName || !buffer || !mimetype) {
    throw new BadRequestException(
      'File name, buffer and mimetype are required',
    );
  }

  if (fileName && !BaseHelper.isValidFileNameAwsUpload(fileName)) {
    throw new BadRequestException('Invalid file name');
  }

  let optimizedBuffer = buffer;
  if (mimetype.startsWith('image/')) {
    optimizedBuffer = await optimizeImage(buffer);
  }

  const uploadParams = {
    Bucket: ENVIRONMENT.AWS.BUCKET_NAME,
    Key: fileName,
    Body: optimizedBuffer,
    ContentType: mimetype,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const secureUrl = `${ENVIRONMENT.AWS.BUCKET_URL}/${fileName}`;

    return {
      secureUrl: secureUrl,
    };
  } catch (error) {
    console.log('uploadSingleFile error', error);
    return {
      secureUrl: '',
    };
  }
};

export const deleteSingleFile = async (fileName: string) => {
  if (!fileName) {
    throw new BadRequestException('File name is required');
  }

  const deleteParams = {
    Bucket: ENVIRONMENT.AWS.BUCKET_NAME,
    Key: fileName,
  };

  try {
    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
  } catch (error) {
    console.log('deleteSingleFile error', error);
    throw new BadRequestException('Unable to delete file');
  }
};
