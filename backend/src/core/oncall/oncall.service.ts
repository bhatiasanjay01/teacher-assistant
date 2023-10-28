import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { injectable } from 'inversify';
import { Id } from '../../../../frontend/src/app/shared/id/id';
import { environment } from '../../environments/environment';

export enum SourceType {
  Website = 'Website',
  Slack = 'Slack',
}

export enum EndType {
  frontend = 'Frontend',
  backend = 'Backend',
}

@injectable()
export class OncallService {
  private sesClient = new SESClient({ region: 'us-east-2' });

  async sendEmail({ log, err, sourceType, endType }: { log: string; err: string; sourceType: SourceType; endType: EndType }) {
    const stage = environment.isProd ? 'PROD' : 'BETA';
    const subject = `[${stage}][${endType}] MindCraft ${sourceType} Error: ${err} - ${this.randomSuffix()}`;
    await this.sendEmailToOncalls({
      subject,
      html: this.wrapToHtml(log),
    });
  }

  private randomSuffix() {
    return Id.easyReading.generate(8).toUpperCase();
  }

  private wrapToHtml(log: string) {
    const style =
      // eslint-disable-next-line @typescript-eslint/quotes
      "font-family: 'JetBrains Mono', Menlo, monospace; " + 'border-radius: 10px; ' + 'background-color: #F8F8F8; ' + 'padding: 20px;';
    return `<code><pre style="${style}">${log}</pre></code>`;
  }

  private async sendEmailToOncalls({ subject, html }) {
    try {
      const params = {
        Destination: { ToAddresses: environment.oncallList },
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
        Source: environment.oncallEmailSender,
      };
      const command = new SendEmailCommand(params);
      return await this.sesClient.send(command);
    } catch (e) {
      console.error(`Send error message to ${environment.oncallList} fails.`);
    }
  }
}
