import { monitoredAsyncExecution, monitoredExecution } from './execution-monitor';

export function monitorExecution() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalFunc = descriptor.value;
    const resource = `${target.constructor.name}::${originalFunc.name}`;
    descriptor.value = originalFunc.constructor.name === 'AsyncFunction'
      ? monitoredAsyncExecution(resource, originalFunc)
      : monitoredExecution(resource, originalFunc);
    return descriptor;
  };
}
