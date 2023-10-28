import * as L from 'lodash';
import { GlobalReflect, Instance, Method } from '../../../../frontend/src/app/shared/global-reflect/global-reflect';
import {
  NoExeuctorGroupResponseToResourceNameError,
  NoExeuctorResponseToActionNameInExecutorGroupError,
} from './routing.error';
import { Request } from './routing.model';
import RoutingReflect from './routing.reflect';

type ExecutorGroup = Instance;

export class Router {
  private executorGroups: ExecutorGroup[];

  static of(executorGroups: ExecutorGroup[]): Router {
    const router = new Router();
    router.executorGroups = executorGroups;
    return router;
  }

  async execute(request: Request) {
    const resource = request.headers.resource;
    const instance = this.getInstanceByResourceName(resource);
    if (!instance) {
      throw new NoExeuctorGroupResponseToResourceNameError();
    }

    const action = request.headers.action;
    const methodName = this.getMethodNameByActionName(instance, action);
    if (!methodName) {
      throw new NoExeuctorResponseToActionNameInExecutorGroupError();
    }

    const params = this.getParametersForMethod(instance, methodName, request);
    const result = await this.callMethod(instance, methodName, params);

    return result;
  }

  private getInstanceByResourceName(resourceName: string): ExecutorGroup {
    return L.find(this.executorGroups, (group) => {
      const instance = group;
      const classInstance = GlobalReflect.classInstanceOfInstance(instance);
      return RoutingReflect.getResourceName(classInstance) === resourceName;
    });
  }

  private getMethodNameByActionName(instance: Instance, actionName: string): string {
    const instancePrototype = GlobalReflect.instancePrototypeOfInstance(instance);
    const propNames = Object.getOwnPropertyNames(instancePrototype);
    return L.find(propNames, (propName) => {
      return RoutingReflect.getActionName(instancePrototype, propName) === actionName;
    });
  }

  private getParametersForMethod(instance: Instance, methodName: string, request: Request): any[] {
    const instancePrototype = GlobalReflect.instancePrototypeOfInstance(instance);
    const inputs = RoutingReflect.getExecutorInputs(instancePrototype, methodName) || [];
    const params = L.map(inputs, (input) => {
      const target = (() => {
        switch (input.source) {
          case RoutingReflect.ExecutorInputSource.headers:
            return request.headers;
          case RoutingReflect.ExecutorInputSource.payload:
            return request.payload;
        }
      })();
      return input.key === undefined ? target : target[input.key];
    });
    return params;
  }

  private async callMethod(instance: Instance, methodName: string, params: any[]): Promise<any> {
    const instancePrototype = GlobalReflect.instancePrototypeOfInstance(instance);
    const method = Object.getOwnPropertyDescriptor(instancePrototype, methodName).value as Method;
    return method.apply(instance, params);
  }
}
