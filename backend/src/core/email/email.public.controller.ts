import { injectable } from 'inversify';
import { action, payload, resource } from '../../shared/routing/routing.decorator';
import { SuccessResponse } from '../request-response';
import { EmailPublicGate, SubmitStudentHomeworkRequest, SubmitStudentRegistrationRequest } from './email.public.gate';
import { EmailService } from './email.service';

@resource(EmailPublicGate.resource)
@injectable()
export default class EmailPublicController {
  constructor(private emailService: EmailService) {}

  @action(EmailPublicGate.actions.submitStudentRegistration)
  async submitStudentRegistration(@payload() request: SubmitStudentRegistrationRequest) {
    let response: SuccessResponse = {
      isSuccess: true,
    };

    if (request.email) {
      // 1. Send email to MindCraft.
      await this.emailService.sendEmail({
        subject: `Student Registration for ${request.courseName}`,
        html: `${JSON.stringify(request)}`,
        toList: ['support@mindcraftsmart.com'],
      });

      // 2. Send email to user
      await this.emailService.sendEmail({
        subject: `Registration Confirmation for ${request.courseName}`,
        html: `Dear ${request.fullName}, <br></br><br></br> Thank you for your registration for the ${request.courseName} class. <br></br><br></br> We will soon provide you with detailed instructions on how to access the class. Should you have any additional questions, please don't hesitate to reach out by replying to this email. <br></br><br></br><br></br>Warm regards, <br></br> Sanjay <br></br> https://www.mindcraftsmart.com/`,
        toList: [request.email],
      });

      return response;
    }

    response = {
      isSuccess: false,
      errMessage: 'No email address.',
    };

    return response;
  }

  @action(EmailPublicGate.actions.submitStudentHomework)
  async submitStudentHomework(@payload() request: SubmitStudentHomeworkRequest) {
    let response: SuccessResponse = {
      isSuccess: true,
    };

    if (request.email) {
      // 1. Send email to MindCraft.
      await this.emailService.sendEmail({
        subject: `Student Homework for ${request.email}`,
        html: `${JSON.stringify(request)}`,
        toList: ['support@mindcraftsmart.com'],
      });

      // 2. Send email to user
      await this.emailService.sendEmail({
        subject: `Student Homework for ${request.email}`,
        html: `Dear ${request.fullName}, <br></br><br></br> Thank you for submitting your homework to us. We are currently reviewing it and will provide you with the evaluation within the next 24 hours.<br></br><br></br> We will soon provide you with detailed instructions on how to access the class. Should you have any additional questions, please don't hesitate to reach out by replying to this email. <br></br><br></br><br></br>Warm regards, <br></br> Sanjay <br></br> https://www.mindcraftsmart.com/`,
        toList: [request.email],
      });

      return response;
    }

    response = {
      isSuccess: false,
      errMessage: 'No email address.',
    };

    return response;
  }
}
