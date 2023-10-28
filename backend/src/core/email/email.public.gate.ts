import { SuccessResponse } from '../request-response';
import { ResourceName } from '../resource-name';

// tslint:disable: variable-name
export const EmailPublicGate = {
  resource: ResourceName.email,
  actions: {
    submitStudentRegistration: 'submit-student-registration',
    submitStudentHomework: 'submit-student-homework',
  },
};

export type EmailPublicTypes = {
  submitStudentRegistration: {
    request: SubmitStudentRegistrationRequest;
    response: SuccessResponse;
  };
  submitStudentHomework: {
    request: SubmitStudentHomeworkRequest;
    response: SuccessResponse;
  };
};

export interface SubmitStudentRegistrationRequest {
  fullName: string;
  phone?: string;
  email: string;
  others?: string;
  courseName: string;
}

export interface SubmitStudentHomeworkRequest {
  fullName: string;
  email: string;
  others?: string;
  fileUrl: string;
}
