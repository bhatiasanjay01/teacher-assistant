import { injectable } from 'inversify';
import { GlobalError } from '../../../../frontend/src/app/shared/global-error/global-error';
import { GlobalJsonToJsonOption } from '../../../../frontend/src/app/shared/global-json/global-json';
import GlobalPrinter from '../../../../frontend/src/app/shared/global-printer/global-printer';
import { ExecutionHistoryCoder } from '../../shared/execution-history/execution-history.coder';
import { jsonAllowList } from './per-request-log.allow-list';
import { PerRequestLog } from './per-request-log.model';

@injectable()
export class PerRequestLogService {
  toPrettyString(info: PerRequestLog): string {
    const noValue = 'N/A';

    const printer = new GlobalPrinter();

    // header
    printer.print(info.error ? 'Error' : 'Success');
    printer.nextLine();

    printer.indented(() => {
      // basic
      printer.print('User Id: ');
      printer.print(info.userId || noValue);
      printer.nextLine();
      printer.print('Client Version: ');
      printer.print(info.clientVersion || noValue);
      printer.nextLine();

      // error
      if (info.error) {
        printer.print('Error: ');
        printer.nextLine();
        printer.indented(() => {
          printer.print(GlobalError.toStackTrace(info.error));
        });
        printer.nextLine();
      }

      // request
      printer.print('Request:');
      printer.nextLine();
      printer.indented(() => {
        if (info.request) {
          printer.printData(info.request, options);
        } else {
          printer.print(noValue);
        }
      });
      printer.nextLine();

      // history
      printer.print('History: ');
      printer.nextLine();
      printer.indented(() => {
        if (info.history) {
          printer.print(ExecutionHistoryCoder.toPrettyString(info.history, options));
        } else {
          printer.print(noValue);
        }
      });
      printer.nextLine();

      // response
      printer.print('Response:');
      printer.nextLine();
      printer.indented(() => {
        if (info.response) {
          printer.printData(info.response, options);
        } else {
          printer.print(noValue);
        }
      });
      printer.nextLine();
    });

    return printer.result;
  }
}

const options: GlobalJsonToJsonOption = {
  fieldsPickedForObject: jsonAllowList,
};
