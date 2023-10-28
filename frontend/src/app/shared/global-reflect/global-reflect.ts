// tslint:disable: ban-types

export type Instance = object;
export type ClassInstance = object;
export type InstancePrototype = Function;
export type Method = Function;

export class GlobalReflect {
  static className(obj: Object) {
    return obj.constructor.name;
  }

  static funcName(func: Function) {
    return func.name;
  }

  static isAsyncFunction(func: Function): boolean {
    return GlobalReflect.className(func) === 'AsyncFunction';
  }

  static instancePrototypeOfInstance(instance: Instance): InstancePrototype {
    return Object.getPrototypeOf(instance);
  }

  static classInstanceOfInstancePrototype(instancePrototype: InstancePrototype): ClassInstance {
    return instancePrototype.constructor;
  }

  static classInstanceOfInstance(instance: object): object {
    return GlobalReflect.classInstanceOfInstancePrototype(GlobalReflect.instancePrototypeOfInstance(instance));
  }
}
