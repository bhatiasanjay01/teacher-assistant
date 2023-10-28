export class ArrayUtils {
  static arrOrEmpty(arr?: any[]) {
    if (!arr) {
      return [];
    }
    return arr;
  }

  static allKeyValueSame(arr: any[], key: string) {
    if (!arr) {
      return false;
    }

    if (arr.length === 0 || arr.length === 1) {
      return true;
    }

    return arr.every((c) => c[key] === arr[0][key]);
  }

  static isEmpty(arr?: any[]) {
    if (!arr) {
      return true;
    }

    if (arr.length === 0) {
      return true;
    }

    return false;
  }

  static toMap(key: string, arr?: any[]) {
    const tempMap = new Map<any, any>();

    arr?.forEach((c) => {
      tempMap.set(c[key], c);
    });
    return tempMap;
  }

  static toSet(arr?: any[]) {
    const tempSet = new Set();

    arr?.forEach((c) => {
      tempSet.add(c);
    });

    return tempSet;
  }

  static removeOne(arr?: any[], item?: any) {
    if (!arr) return;
    if (!item) return;

    const index = arr.indexOf(item);

    if (index >= 0) {
      arr.splice(index, 1);
    }
  }

  static safeGet(arr?: any[], index?: number, isAscendingSequence = true): any | undefined {
    if (!arr) {
      return undefined;
    }

    if (index === undefined) {
      return undefined;
    }

    // [1,2,3] => 0
    const realIndex = isAscendingSequence ? index : arr.length - 1 - index;

    if (realIndex < 0) {
      return undefined;
    }

    if (realIndex >= arr.length) {
      return undefined;
    }

    return arr[realIndex];
  }
}
