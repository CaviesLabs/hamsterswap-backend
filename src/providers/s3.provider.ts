import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import slugify from 'slugify';

/**
 * @dev Import deps
 */
import { RegistryProvider } from './registry.provider';

/**
 * @dev S3 Storage service provider.
 */
@Injectable()
export class StorageProvider {
  private readonly S3: AWS.S3;
  private readonly bucketName: string;
  private readonly bucketRegion: string;

  /**
   * @dev Constructor that initialize storage provider.
   * @param registryProvider
   */
  constructor(private registryProvider: RegistryProvider) {
    const config = this.registryProvider.getConfig();
    this.S3 = new AWS.S3({
      // Your config options
      accessKeyId: config.AWS_SECRET_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
    this.bucketName = config.AWS_BUCKET_NAME;
    this.bucketRegion = config.AWS_BUCKET_REGION;
  }

  /**
   * @dev Get default params.
   */
  private getDefaultParams() {
    return {
      Bucket: this.bucketName,
      ACL: 'public-read',
      ContentDisposition: 'inline',
    };
  }

  /**
   * @dev Get file url.
   * @param key
   * @private
   */
  private getFileUrl(key: string): { url: string } {
    return {
      url: `https://${this.bucketName}.s3.${this.bucketRegion}.amazonaws.com/${key}`,
    };
  }

  /**
   * @dev Upload file at once.
   * @param blobName
   * @param blob
   */
  public async putBlob(
    blobName: string,
    blob: Buffer,
  ): Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>> {
    const params = {
      ...this.getDefaultParams(),
      Bucket: this.bucketName,
      Key: blobName,
      Body: blob,
    };
    return this.S3.putObject(params).promise();
  }

  /**
   * @dev Upload and return file url.
   * @param key
   * @param buffer
   */
  public async upload(key: string, buffer: Buffer): Promise<{ url: string }> {
    const validKey = `${this.registryProvider.getConfig().DOMAIN}/${slugify(
      key,
    )}`;

    return new Promise<{ url: string }>(async (resolve, reject) => {
      const handleError = (error) => {
        reject(error);
      };

      try {
        await this.putBlob(validKey, buffer);
        resolve(this.getFileUrl(validKey));
      } catch (error) {
        handleError(new InternalServerErrorException(error));
      }
    });
  }
}
