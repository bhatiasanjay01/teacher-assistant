import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { injectable } from 'inversify';
import { environment } from '../../environments/environment';

@injectable()
export class S3Repository {
  private readonly s3Client = new S3Client({ region: 'us-east-2' });

  private readonly _bucketName = `teacher-assistant-files-${environment.environmentName}`;

  async putObject(key: string, fileBuffer: Buffer, mime: string) {
    const params = {
      Body: fileBuffer,
      Key: key,
      Bucket: this._bucketName,
      ContentEncoding: 'base64',
      ContentType: mime,
    };

    const command = new PutObjectCommand(params);

    const result = await this.s3Client.send(command);
    return result;
  }

  async deleteFile(workspaceId: string, coreItemId: string) {
    const listParams = {
      Bucket: this._bucketName,
      Prefix: `${workspaceId}/${coreItemId}`,
    };

    const command = new ListObjectsV2Command(listParams);

    const listedObjects = await this.s3Client.send(command);

    if (listedObjects.Contents.length === 0) {
      return;
    }

    const deleteParams = {
      Bucket: this._bucketName,
      Delete: {
        Objects: [],
      },
    };

    deleteParams.Delete.Objects = listedObjects.Contents.filter((data) => data).map((data) => {
      return { Key: data.Key };
    });

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await this.s3Client.send(deleteCommand);
  }

  async deleteFilesInWorkspace(workspaceId: string) {
    const listParams = {
      Bucket: this._bucketName,
      Prefix: `${workspaceId}/`,
    };

    const command = new ListObjectsV2Command(listParams);
    const listedObjects = await this.s3Client.send(command);

    if (!listedObjects?.Contents || listedObjects.Contents.length === 0) {
      return;
    }

    const deleteParams = {
      Bucket: this._bucketName,
      Delete: {
        Objects: [],
      },
    };

    deleteParams.Delete.Objects = listedObjects.Contents.filter((data) => data).map((data) => {
      return { Key: data.Key };
    });

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await this.s3Client.send(deleteCommand);

    if (listedObjects.IsTruncated) {
      await this.deleteFilesInWorkspace(workspaceId);
    }
  }

  /**
   * Get temporary url for users to upload the large file more than 5MB.
   *
   * @param key
   * @param expiresSeconds
   * @returns
   */
  async getSignedUrl(key: string, expiresSeconds = 3600) {
    const command = new PutObjectCommand({ Bucket: this._bucketName, Key: key });
    return getSignedUrl(this.s3Client, command, { expiresIn: expiresSeconds });
  }
}
