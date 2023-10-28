import { inject, injectable } from 'inversify';
import { Id } from '../../../../frontend/src/app/shared/id/id';
import { environment } from '../../environments/environment';
import { action, payload, resource } from '../../shared/routing/routing.decorator';
import { FileGate, GetPresignedUrlRequest, GetPresignedUrlResponse, SaveS3FileRequest, SaveS3FileResponse } from './file.gate';
import { S3Repository } from './s3.repository';

@resource(FileGate.resource)
@injectable()
export class FileController {
  @inject(S3Repository)
  private s3Repository: S3Repository;

  @action(FileGate.actions.getPresignedUrlToUpload)
  async getPresignedUrlToUpload(@payload() request: GetPresignedUrlRequest): Promise<GetPresignedUrlResponse> {
    const fileName = request.fileName;
    const fileMetadataId = `${Id.uuid.generateInBase62()}_${fileName}`;
    const url = await this.s3Repository.getSignedUrl(fileMetadataId);

    return {
      url,
    };
  }

  @action(FileGate.actions.saveS3File)
  async saveS3File(@payload() request: SaveS3FileRequest): Promise<SaveS3FileResponse> {
    const fileBuffer = Buffer.from(request.base64Content, 'base64');
    const fileName = request.fileName;
    // tslint:disable-next-line: variable-name

    const nameList = fileName?.split('.');

    let ext = 'bin';

    if (nameList.length > 0) {
      ext = nameList[nameList.length - 1];
    }

    const fileMetadataId = `${Id.uuid.generateInBase62()}_${fileName}`;
    // raw
    await this.s3Repository.putObject(fileMetadataId, fileBuffer, ext);

    const url = `${environment.loadFileUrl}/${fileMetadataId}`;

    return { url };
  }
}
