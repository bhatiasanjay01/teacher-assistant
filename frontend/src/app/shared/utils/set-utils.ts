export class SetUtils {
  static setOrEmpty(set?: Set<any>): Set<any> {
    if (!set) {
      return new Set();
    }
    return set;
  }

  static isSuperset(set: any, subset: any) {
    for (const elem of subset) {
      if (!set.has(elem)) {
        return false;
      }
    }
    return true;
  }

  static toArray<T>(set?: Set<T>) {
    if (!set) {
      return [];
    }
    return [...set];
  }

  static fromArray(arr?: any[]) {
    if (!arr) {
      return new Set();
    }

    return new Set(arr);
  }

  static union(setA?: Set<any>, setB?: Set<any>) {
    if (!setA) {
      return setB;
    }

    if (!setB) {
      return setA;
    }

    const _union = new Set<any>(setA);
    for (const elem of setB) {
      _union.add(elem);
    }
    return _union;
  }

  static intersection(setA?: any, setB?: any) {
    if (!setA) {
      return setB;
    }

    if (!setB) {
      return setA;
    }

    const _intersection = new Set<any>();
    for (const elem of setB) {
      if (setA.has(elem)) {
        _intersection.add(elem);
      }
    }
    return _intersection;
  }

  static symmetricDifference(setA?: any, setB?: any) {
    if (!setA) {
      return setB;
    }

    if (!setB) {
      return setA;
    }

    const difference1 = new Set<any>(setA);
    for (const elem of setB) {
      if (difference1.has(elem)) {
        difference1.delete(elem);
      } else {
        difference1.add(elem);
      }
    }
    return difference1;
  }

  static difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    if (!setA) {
      return setB;
    }

    if (!setB) {
      return setA;
    }

    const difference2 = new Set<any>(setA);
    for (const elem of setB) {
      difference2.delete(elem);
    }
    return difference2;
  }

  static isEqual(setA: Set<any>, setB: Set<any>) {
    if (setA.size !== setB.size) {
      return false;
    }

    for (const c of setA) {
      if (!setB.has(c)) {
        return false;
      }
    }
    return true;
  }
}

/*
// Examples
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([2, 3]);
const setC = new Set([3, 4, 5, 6]);

isSuperset(setA, setB); // returns true
union(setA, setC); // returns Set {1, 2, 3, 4, 5, 6}
intersection(setA, setC); // returns Set {3, 4}
symmetricDifference(setA, setC); // returns Set {1, 2, 5, 6}
difference(setA, setC); // returns Set {1, 2}
*/
