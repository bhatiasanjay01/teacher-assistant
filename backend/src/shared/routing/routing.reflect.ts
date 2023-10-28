import 'reflect-metadata';

const resourceMetadataKey = 'routing:resource';

function setResourceName(name: string, classInstance) {
  Reflect.defineMetadata(resourceMetadataKey, name, classInstance);
}

function getResourceName(classInstance): string {
  return Reflect.getMetadata(resourceMetadataKey, classInstance);
}

const actionMetadataKey = 'routing:action';

function setActionName(name: string, instancePrototye, methodName: string) {
  Reflect.defineMetadata(actionMetadataKey, name, instancePrototye, methodName);
}

function getActionName(instancePrototye, methodName: string): string {
  return Reflect.getMetadata(actionMetadataKey, instancePrototye, methodName);
}

const executorInputsMetadataKey = 'routing:executor-inputs';

enum ExecutorInputSource {
  payload,
  headers,
}

type ExecutorInputInfo = { source: ExecutorInputSource; key?: string };

function setExecutorInput(instancePrototype, methodName: string, parameterIndex, info: { source: ExecutorInputSource; key?: string }) {
  const inputs = getExecutorInputs(instancePrototype, methodName) || [];
  inputs[parameterIndex] = info;
  Reflect.defineMetadata(executorInputsMetadataKey, inputs, instancePrototype, methodName);
}

function getExecutorInputs(instancePrototype, methodName: string): ExecutorInputInfo[] {
  return Reflect.getMetadata(executorInputsMetadataKey, instancePrototype, methodName) || [];
}

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
const RoutingReflect = {
  setResourceName,
  getResourceName,
  setActionName,
  getActionName,
  ExecutorInputSource,
  setExecutorInput,
  getExecutorInputs,
};

export default RoutingReflect;
