export class NumberUtils {
  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * @param min inclusive
   * @param max inclusive
   * @returns
   */
  static getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static guardNumberInRange(curValue: number, minValue = Number.MIN_SAFE_INTEGER, maxValue = Number.MAX_SAFE_INTEGER) {
    return Math.min(maxValue, Math.max(minValue, curValue));
  }

  static equals(num1?: number, num2?: number, precision: number = 2) {
    if (!num1) {
      return false;
    }

    if (!num2) {
      return false;
    }

    if (num1.toFixed(precision) === num2.toFixed(precision)) {
      return true;
    }

    return false;
  }
}
