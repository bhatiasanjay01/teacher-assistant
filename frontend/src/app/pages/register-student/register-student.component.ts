import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map, take } from 'rxjs';
import { EmailService } from './../../core/email/email.service';

@Component({
  selector: 'app-register-student',
  templateUrl: './register-student.component.html',
  styleUrls: ['./register-student.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterStudentComponent {
  // https://webapp.mindcraftsmart.com/register-student/pre-algebra-basics-course

  courseType!: Signal<string | null | undefined>;

  fullName?: string;
  phone?: string;
  email?: string;
  others?: string;

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private msg: NzMessageService
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

  getCourseName() {
    if (this.courseType() === 'pre-algebra-basics-course') {
      return 'Prealgebra Basics Course';
    }
    return '';
  }

  isLoading = signal<boolean>(false);
  isSuccess = signal<boolean | undefined | null>(undefined);

  onSubmitClick() {
    if (!this.fullName) {
      this.msg.error('Please enter the full name.');
      return;
    }

    if (!this.email) {
      this.msg.error('Please enter the email.');
      return;
    }

    this.isLoading.set(true);

    this.emailService
      .submitStudentRegistration$({
        fullName: this.fullName,
        phone: this.phone,
        email: this.email,
        others: this.others,
        courseName: this.getCourseName(),
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
