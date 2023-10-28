import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResourceName } from '../../../../../backend/src/core/resource-name';
import { LambdaService } from '../../shared/core/lambda.service';
import {
  EmailPublicGate,
  SubmitStudentHomeworkRequest,
  SubmitStudentRegistrationRequest,
} from './../../../../../backend/src/core/email/email.public.gate';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(
    private lambdaService: LambdaService,
    private msg: NzMessageService
  ) {}

  submitStudentRegistration$(request: SubmitStudentRegistrationRequest) {
    return this.lambdaService.run$(
      ResourceName.email,
      EmailPublicGate.actions.submitStudentRegistration,
      request,
      { isPublicUrl: true }
    );
  }

  submitStudentHomework$(request: SubmitStudentHomeworkRequest) {
    return this.lambdaService.run$(
      ResourceName.email,
      EmailPublicGate.actions.submitStudentHomework,
      request,
      { isPublicUrl: true }
    );
  }
}
