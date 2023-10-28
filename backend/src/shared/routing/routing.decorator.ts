import RoutingReflect from './routing.reflect';

// Class
export function resource(name: string) {
  return (classInstance) => {
    RoutingReflect.setResourceName(name, classInstance);
  };
}

// Method
export function action(name: string) {
  return (instance, methodName, propDescriptor) => {
    RoutingReflect.setActionName(name, instance, methodName);
  };
}

// Method
export function payload(key?: string) {
  return (instance, methodName, i) => {
    RoutingReflect.setExecutorInput(instance, methodName, i, {
      source: RoutingReflect.ExecutorInputSource.payload,
      key,
    });
  };
}

// Method
export function headers(key?: string) {
  return (instance, methodName, i) => {
    RoutingReflect.setExecutorInput(instance, methodName, i, {
      source: RoutingReflect.ExecutorInputSource.headers,
      key,
    });
  };
}
