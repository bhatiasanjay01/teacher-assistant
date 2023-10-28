import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

import { NzUploadChangeParam, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-drag',
  templateUrl: './upload-drag.component.html',
  styleUrls: ['./upload-drag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDragComponent implements OnInit {
  constructor(private msg: NzMessageService) {}

  ngOnInit(): void {}

  @Input() text: string = 'Click or drag a file to this area to upload';

  @Input() uploadFileHandler!: (item: NzUploadXHRArgs) => Subscription;

  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;
    if (status !== 'uploading') {
      console.log(file, fileList);
    }
    if (status === 'done') {
      this.msg.success(`${file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      this.msg.error(`${file.name} file upload failed.`);
    }
  }
}
