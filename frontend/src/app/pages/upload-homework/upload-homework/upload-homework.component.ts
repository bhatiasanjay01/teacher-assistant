import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { map, of, take } from 'rxjs';
import { EmailService } from '../../../core/email/email.service';
import { FileService } from '../../../core/file/file.service';

@Component({
  selector: 'app-upload-homework',
  templateUrl: './upload-homework.component.html',
  styleUrls: ['./upload-homework.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadHomeworkComponent {
  // https://webapp.mindcraftsmart.com/register-student/pre-algebra-basics-course

  courseType!: Signal<string | null | undefined>;

  fullName?: string;
  phone?: string;
  email?: string;
  others?: string;

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private msg: NzMessageService,
    private fileService: FileService,
    private modal: NzModalService,
    private ref: ChangeDetectorRef
  ) {
    this.courseType = toSignal(
      this.route.paramMap.pipe(
        map((params) => {
          const name = params.get('name');
          return name;
        })
      )
    );
  }

  ngOnInit() {}

  fileUrl = signal<string>('');

  fileLoaded = signal(false);

  uploadFileHandler(item: NzUploadXHRArgs) {
    if (item.file.size) {
      if (item.file.size > 5 * 1024 * 1024) {
        this.msg.error('The file must be smaller than 5mb!');
        return of(false)
          .pipe(take(1))
          .subscribe(() => {});
      }
    }

    return this.fileService
      .saveFileToS3$((item.postFile as File).name, item.postFile as File)
      .pipe(take(1))
      .subscribe((response) => {
        this.fileUrl.set(response.url);

        this.ref.detectChanges();

        this.fileLoaded.set(true);
      });
  }

  getCourseName() {
    if (this.courseType() === 'pre-algebra-basics-course') {
      return 'Prealgebra Basics Course';
    }
    return '';
  }

  isLoading = signal<boolean>(false);
  isSuccess = signal<boolean | undefined | null>(undefined);

  onDemoHomeworkClick() {
    this.modal.info({
      nzTitle: 'Demo',
      nzWidth: 1000,
      nzContent: '<img width="900px" src="/assets/images/demo_homework.png">',
      nzOnOk: () => console.log('Info OK'),
    });
  }

  onSubmitClick() {
    if (!this.fullName) {
      this.msg.error('Please enter the full name.');
      return;
    }

    if (!this.email) {
      this.msg.error('Please enter the email.');
      return;
    }

    if (!this.fileUrl) {
      this.msg.error('Please upload your homework.');
      return;
    }

    this.isLoading.set(true);

    this.emailService
      .submitStudentHomework$({
        fullName: this.fullName,
        email: this.email,
        others: this.others,
        fileUrl: this.fileUrl(),
      })
      .pipe(take(1))
      .subscribe((data) => {
        this.isLoading.set(false);

        if (data.isSuccess === false) {
          this.msg.error('Unexpected Error: please try again.');
        }

        this.isSuccess.set(data.isSuccess);
      });
  }
}
