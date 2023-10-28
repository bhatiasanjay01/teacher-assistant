import { ResourceName } from '../resource-name';

export const FileGate = {
  resource: ResourceName.file,
  actions: {
    saveS3File: 'save-s3-file',
    getPresignedUrlToUpload: 'get-presigned-url-to-upload',
  },
};

export type FileGateActionTypes = {
  saveS3File: {
    request: SaveS3FileRequest;
    response: SaveS3FileResponse;
  };
  getPresignedUrlToUpload: {
    request: GetPresignedUrlRequest;
    response: GetPresignedUrlResponse;
  };
};

export interface SaveS3FileRequest {
  fileName: string;
  base64Content: string;
}

export interface SaveS3FileResponse {
  url: string;
}

export interface GetPresignedUrlRequest {
  fileName: string;
}

export interface GetPresignedUrlResponse {
  url: string;
}
