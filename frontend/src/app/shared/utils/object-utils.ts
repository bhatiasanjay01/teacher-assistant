import * as L from 'lodash';
import { ArrayUtils } from './array-utils';

export function getObjectDiffPropertyList(obj1: any, obj2: any) {
  const diff = Object.keys(obj1).reduce((result, key) => {
    if (!obj2.hasOwnProperty(key)) {
      result.push(key);
    } else if (L.isEqual(obj1[key], obj2[key])) {
      const resultKeyIndex = result.indexOf(key);
      result.splice(resultKeyIndex, 1);
    }
    return result;
  }, Object.keys(obj2));

  return diff;
}

export class ObjectUtils {
  private static _removeUndefined(obj: any, cache: Set<any>) {
    if (!obj) {
      return;
    }
    if (obj instanceof Array) {
      (obj as Array<any>).forEach((i) => this._removeUndefined(i, cache));
    } else if (typeof obj === 'object') {
      if (cache.has(obj)) {
        throw new Error('Circular');
      }
      cache.add(obj);
      for (const key of Object.keys(obj)) {
        this._removeUndefined(obj[key], cache);

        if (obj[key] === null || obj[key] === undefined) {
          delete obj[key];
        } else if (obj[key] instanceof Array && ArrayUtils.isEmpty(obj[key])) {
          delete obj[key];
        }
      }
      cache.delete(obj);
    }
  }

  static removeUndefined(obj: any) {
    this._removeUndefined(obj, new Set());
  }
}
