export class EnumUtils {
  static getAllValues(enumClass: any): any[] {
    return Object.values(enumClass);
  }

  static getEnumKeyByEnumValue<T extends { [index: string]: string }>(
    myEnum: T,
    enumValue: string
  ): keyof T | null {
    const keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
    return keys.length > 0 ? keys[0] : null;
  }

  static getEnumValueByEnumKey<T extends { [index: string]: string }>(
    myEnum: T,
    enumKey: keyof T
  ): string | null {
    return myEnum[enumKey] || null;
  }

  static isStringInEnum(value: string, enumClass: any): boolean {
    return Object.values(enumClass).includes(value);
  }
}
