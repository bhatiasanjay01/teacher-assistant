import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

import { injectable } from 'inversify';

@injectable()
export class EmailService {
  private sesClient = new SESClient({ region: 'us-east-2' });

  async sendEmail({ subject, html, from, toList }: { subject: string; html: string; from?: string; toList: string[] }) {
    if (!from) {
      from = 'support@mindcraftsmart.com';
    }

    try {
      const params = {
        Destination: { ToAddresses: toList },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: html,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
        Source: from,
      };
      const command = new SendEmailCommand(params);

      return await this.sesClient.send(command);
    } catch (e) {
      console.error(`Send error message ${e} fails.`);
    }
  }
}
