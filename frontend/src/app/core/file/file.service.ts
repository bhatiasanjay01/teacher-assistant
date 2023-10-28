import { Injectable } from '@angular/core';
import { Observable, mergeMap } from 'rxjs';
import { ResourceName } from '../../../../../backend/src/core/resource-name';
import { LambdaService } from '../../shared/core/lambda.service';
import { GlobalFile } from '../../shared/global-file';
import {
  FileGate,
  GetPresignedUrlRequest,
  SaveS3FileRequest,
} from './../../../../../backend/src/core/file/file.gate';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private _pictureMimeTypes = [
    'image/gif',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  constructor(private lambdaService: LambdaService) {}

  private _resourceName = ResourceName.file;

  saveFileToS3$(fileName: string, fileData: File): Observable<{ url: string }> {
    return GlobalFile.readAsString$(fileData).pipe(
      mergeMap((base64Content) => {
        const noHeadContent = base64Content.split(',')[1];

        const request: SaveS3FileRequest = {
          fileName,
          base64Content: noHeadContent,
        };
        return this.lambdaService.run$(
          this._resourceName,
          FileGate.actions.saveS3File,
          request,
          { isPublicUrl: true }
        );
      })
    );
  }

  // Have not tested yet.
  getPresignedUrlToUpload$(fileName: string) {
    const request: GetPresignedUrlRequest = {
      fileName,
    };

    // GetPresignedUrlResponse
    return this.lambdaService.run$(
      this._resourceName,
      FileGate.actions.getPresignedUrlToUpload,
      request,
      { isPublicUrl: true }
    );
  }
}
