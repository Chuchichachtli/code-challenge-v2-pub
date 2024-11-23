import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
  GetObjectCommandOutput,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private bucketName = process.env.BUCKET_NAME || 'test-bucket';
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      credentials: {
        // It is enough to have dummy vals so leaving this here.
        accessKeyId: 'ACCESS_KEY_ID',
        secretAccessKey: 'ACCESS_KEY_SECRET',
      },
      endpoint: process.env.S3_ENDPOINT,
      region: 'eu-central-1',
      forcePathStyle: true,
    });
  }

  async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
  async getFile(path): Promise<GetObjectCommandOutput> {
    const params = {
      Bucket: this.bucketName,
      Key: path,
    };

    try {
      let s3Response = await this.s3.send(new GetObjectCommand(params));
      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }

  async uploadFile(file, path: String) {
    const { originalname } = file;

    return await this.s3_upload(
      file.buffer,
      path + '/' + originalname,
      file.mimetype,
    );
  }

  async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3.send(command);

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateFileName(oldKey, newKey: string) {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${oldKey}`,
        Key: newKey,
      });

      await this.s3.send(command).then(() => {
        this.deleteFile(oldKey);
      });

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async s3_upload(file, path: string, mimetype) {
    const params = {
      Bucket: this.bucketName,
      Key: path,
      Body: file,
      ACL: 'public-read' as ObjectCannedACL,
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'eu-central-1',
      },
    };

    try {
      let s3Response = await this.s3.send(new PutObjectCommand(params));
      return s3Response;
    } catch (e) {
      throw new InternalServerErrorException(e, 'Error while uploading file');
    }
  }
}
