import { GlobalJsonToJsonOption } from './../../../../frontend/src/app/shared/global-json/global-json';
import GlobalPrinter from './../../../../frontend/src/app/shared/global-printer/global-printer';

import { ExecutionHistory } from './execution-history';
import { ExecutionNode } from './execution-history.model';

export class ExecutionHistoryCoder {
  public static toPrettyString(history: ExecutionHistory, options?: GlobalJsonToJsonOption) {
    const globalPrinter = new GlobalPrinter();
    for (const node of history.roots) {
      this.printNode(globalPrinter, node, options);
    }
    return globalPrinter.result;
  }

  private static printNode(printer: GlobalPrinter, node: ExecutionNode, options?: GlobalJsonToJsonOption) {
    if (!node) {
      return;
    }
    // head
    printer.print(`${node.resource} (`);
    printer.nextLine();

    // params
    printer.indented(() => {
      for (const param of node.params) {
        printer.printData(param, options);
        printer.print(',');
        printer.nextLine();
      }
    });

    // head end
    printer.print(')');
    printer.nextLine();

    // children
    printer.indented(() => {
      for (const child of node.children) {
        this.printNode(printer, child, options);
      }
    });

    // return
    printer.print(`<< `);
    if (node.returnValue !== undefined) {
      printer.printData(node.returnValue, options);
    } else if (node.err) {
      printer.print(node.err.constructor.name);
    }
    printer.nextLine();
  }
}
