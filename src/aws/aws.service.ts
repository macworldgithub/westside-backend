import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsService {
  private s3: AWS.S3;
  private readonly bucket: string;

  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.bucket = process.env.AWS_BUCKET_NAME;
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    folder = 'uploads',
    mimeType: string,
  ): Promise<string> {
    const fileKey = `${folder}/${uuidv4()}-${originalName}`;

    const result = await this.s3
      .upload({
        Bucket: this.bucket,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: mimeType,
      })
      .promise();

    return fileKey;
  }

  async uploadMultipleFiles(
    //@ts-ignore
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.buffer, file.originalname, folder, file.mimetype),
    );

    return Promise.all(uploadPromises); // array of S3 URLs
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: fileKey,
      })
      .promise();

    return true;
  }

  async getSignedUrl(fileKey: string): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: fileKey,
      Expires: 60 * 60 * 24 * 7,
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }

  async extractKeyFromSignedUrl(signedUrl: string): Promise<string | null> {
    try {
      const url = new URL(signedUrl);
      return decodeURIComponent(url.pathname.slice(1)); // removes leading '/'
    } catch {
      return null;
    }
  }
}
