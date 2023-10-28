import { substring } from 'stringz';

export class StringUtils {
  static isAllSpaces(str?: string) {
    if (!str) {
      return true;
    }

    if (str.trim().length === 0) {
      return true;
    }

    return false;
  }

  static sort(stringList: string[]) {
    stringList.sort((a, b) => this.compare(a, b));
  }

  static compare(a: string, b: string) {
    return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
  }

  static getRandomString(): string {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  static getDistinctRandomString(stringList: string[]) {
    let randomString = StringUtils.getRandomString();

    while (stringList.includes(randomString)) {
      randomString = StringUtils.getRandomString();
    }

    return randomString;
  }

  static getTextIcon(str: string): string {
    if (!str || str.length === 0) {
      return '';
    }

    return substring(str, 0, 1);
  }

  static getFirstChar(str: string): string {
    if (!str || str.length < 2) {
      return str;
    }
    return substring(str, 0, 1);
  }

  static substring(str: string, begin?: number, end?: number): string {
    if (!str) {
      return str;
    }
    return substring(str, begin, end);
  }

  static isEmoji(char: string): boolean {
    if (!char) {
      return false;
    }
    return new Blob([char]).size >= 3;
  }
}
