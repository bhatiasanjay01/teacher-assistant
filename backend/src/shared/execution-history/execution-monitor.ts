import { ExecutionHistory } from './execution-history';

/* eslint-disable @typescript-eslint/ban-types */

export function monitoredExecution(resource: string, func: Function) {
  function newFunc(this: any, ...args) {
    ExecutionHistory.shared.enterChild(resource, args);
    try {
      const returnValue = func.apply(this, args);
      ExecutionHistory.shared.leaveChild({ returnValue });
      return returnValue;
    } catch (err) {
      ExecutionHistory.shared.leaveChild({ err });
      throw err;
    }
  }
  return newFunc;
}

export function monitoredAsyncExecution(resource: string, func: Function) {
  async function newFunc(this: any, ...args) {
    ExecutionHistory.shared.enterChild(resource, args);
    try {
      const returnValue = await func.apply(this, args);
      ExecutionHistory.shared.leaveChild({ returnValue });
      return returnValue;
    } catch (err) {
      ExecutionHistory.shared.leaveChild({ err });
      throw err;
    }
  }
  return newFunc;
}
