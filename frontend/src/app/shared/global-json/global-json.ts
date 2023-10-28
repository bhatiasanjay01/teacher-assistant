import * as Lodash from 'lodash';

function fromJson(json: string): object {
  return JSON.parse(json);
}

function transformValue(options: { fieldsPickedForCircularObject?: string[]; fieldsPickedForObject?: string[] } = {}) {
  const objects = new Set();

  return (key: string, value: any) => {
    while (true) {
      if (!options.fieldsPickedForObject) {
        break;
      }
      if (key === '') {
        break;
      }
      if (Number.isInteger(parseInt(key, 10))) {
        break;
      }
      if (options.fieldsPickedForObject.includes(key)) {
        break;
      }
      return undefined;
    }

    if (value === null) {
      return value;
    }
    if (typeof value !== 'object') {
      return value;
    }
    if (value instanceof Array) {
      return value;
    }
    if (!objects.has(value)) {
      objects.add(value);
      return value;
    }

    return {
      __circular_to__: Lodash.pick(value, options.fieldsPickedForCircularObject ?? []),
    };
  };
}

function sortContent(obj: any, idPaths: string[]) {
  if (obj === null) {
    return;
  }
  if (obj === undefined) {
    return;
  }
  if (typeof obj !== 'object') {
    return;
  }

  if (obj instanceof Array) {
    for (const item of obj) {
      sortContent(item, idPaths);
    }
  }

  // eslint-disable-next-line guard-for-in
  for (const key in obj) {
    sortContent(obj[key], idPaths);
  }
}

export type GlobalJsonToJsonOption = {
  indentationSize?: number;
  fieldsPickedForCircularObject?: string[];
  fieldsPickedForObject?: string[];
};

// eslint-disable-next-line import/prefer-default-export
export const GlobalJson = {
  fromJson,
  toJson(obj: any, options: GlobalJsonToJsonOption = {}): string {
    return JSON.stringify(obj, transformValue(options), options.indentationSize ?? undefined);
  },

  toContentString(obj: any): string | undefined {
    const objects = new Set();
    function toContentStringRecursive(value: any): string | undefined {
      if (value === null) {
        return undefined;
      }
      if (value === undefined) {
        return undefined;
      }
      if (typeof value !== 'object') {
        return value;
      }
      if (value instanceof Array) {
        return (value as Array<any>)
          .map((item) => toContentStringRecursive(item))
          .filter((item) => item)
          .join(' ');
      }
      if (objects.has(value)) {
        return undefined;
      }
      objects.add(value);
      return toContentStringRecursive(Object.values(value));
    }
    return toContentStringRecursive(obj);
  },

  sortContent,
};
