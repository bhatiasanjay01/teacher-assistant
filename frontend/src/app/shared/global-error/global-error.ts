import GlobalPrinter from '../global-printer/global-printer';
import { GlobalReflect } from '../global-reflect/global-reflect';

export type ErrorOrGlobalError = Error | GlobalError;

export type GlobalErrorProps = {
  message?: string;
  key?: string;
  statusCode?: any;
  skipOnCall?: boolean;
  data?: any;
  causedBy?: ErrorOrGlobalError;
};

export class GlobalError extends Error {
  key?: string;
  statusCode?: any;
  skipOnCall?: boolean;
  data?: any;
  causedBy?: ErrorOrGlobalError;

  constructor(props: GlobalErrorProps = {}) {
    super(props.message);
    this.key = props.key;
    this.statusCode = props.statusCode;
    this.skipOnCall = props.skipOnCall;
    this.causedBy = props.causedBy;
    this.data = props.data;
  }

  public static toStackTrace(err: ErrorOrGlobalError) {
    const printer = new GlobalPrinter();
    printer.print(`${GlobalReflect.className(err)}:`);
    printer.nextLine();
    printer.indented(() => {
      printer.print('Top - ');
      GlobalError._toStackTrace(printer, err);
    });
    return printer.result;
  }

  private static _toStackTrace(printer: GlobalPrinter, err: ErrorOrGlobalError) {
    printer.print(`${GlobalReflect.className(err)}: ${err.message}`);
    printer.nextLine();

    if (err instanceof GlobalError) {
      if (err.key) {
        printer.print(`Key: ${err.key}`);
        printer.nextLine();
      }

      if (err.data) {
        printer.nextLine();
        printer.indented(() => {
          printer.print('Data: ');
          printer.nextLine();
          printer.indented(() => {
            printer.printData(err.data);
          });
        });
      }
    }

    printer.nextLine();
    printer.indented(() => {
      printer.print(`Stack:${err.stack?.substring(err.stack.indexOf('\n'))}`);
    });

    if (err instanceof GlobalError) {
      if (err.causedBy) {
        printer.nextLine();
        printer.print('Caused by - ');
        this._toStackTrace(printer, err.causedBy);
      }
    }
  }
}
