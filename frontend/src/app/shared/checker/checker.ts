function stringIsEmpty(value: string): boolean {
  if (!value) {
    return true;
  }
  return value.trim() === '';
}

function stringIsNotEmpty(value: string): boolean {
  return !stringIsEmpty(value);
}

function arrayIsEmpty(value: Array<any> | any[] | null | undefined): boolean {
  if (!value) {
    return true;
  }
  return value.length === 0;
}

function arrayIsNotEmpty(value: any[]): boolean {
  return !arrayIsEmpty(value);
}

function valueIsEmpty(value: any): boolean {
  return value === undefined || value === null;
}
function valueIsNotEmpty(value: any): boolean {
  return !valueIsEmpty(value);
}

export const Checker = {
  stringIsEmpty,
  stringIsNotEmpty,
  arrayIsEmpty,
  arrayIsNotEmpty,
  valueIsEmpty,
  valueIsNotEmpty,
};
