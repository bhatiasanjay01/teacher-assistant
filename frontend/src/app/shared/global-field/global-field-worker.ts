import { GlobalAssertion } from '../../../../../backend/src/shared/global-assertion/global-assertion';
import { ValueShouldExistButNotError } from '../../../../../backend/src/shared/global-assertion/global-assertion.error';
import { Checker } from '../checker/checker';
import { GlobalField } from './global-field';

/* eslint-disable lines-between-class-members */
/* eslint-disable import/prefer-default-export */

type StringOrHyperField = string | GlobalField;

export class HyperFieldWorker {
  private obj?: object;
  private field?: string;

  static on(obj: object, field: StringOrHyperField): HyperFieldWorker {
    GlobalAssertion.oldAssertTrue(
      Checker.valueIsNotEmpty(obj),
      new ValueShouldExistButNotError({ message: `expect not null object` })
    );
    const worker = new HyperFieldWorker();
    worker.obj = obj;
    worker.field = field instanceof GlobalField ? field.name : (field as string);
    return worker;
  }

  assertNotEmpty(): HyperFieldWorker {
    /*
    GlobalAssertion.oldAssertTrue(
      Checker.valueIsNotEmpty(this.obj![this.field!]),
      new ValueShouldExistButNotError({ message: `missing prop '${this.field}' in object` })
    );
    return this;
    */
    return this;
  }

  renameTo(newField: StringOrHyperField): HyperFieldWorker {
    /*
    if (this.obj[this.field] === undefined) {
      return this;
    }
    const newName = newField instanceof GlobalField ? newField.name : (newField as string);
    this.obj[newName] = this.obj[this.field];
    delete this.obj[this.field];
    this.field = newName;
    */
    return this;
  }

  // eslint-disable-next-line no-unused-vars
  map(mapper: (v: any) => any): HyperFieldWorker {
    /*
    if (this.obj[this.field] === undefined) {
      return this;
    }
    this.obj[this.field] = mapper(this.obj[this.field]);
    */
    return this;
  }

  omit(): HyperFieldWorker {
    /*
    delete this.obj[this.field];
    */
    return this;
  }

  // eslint-disable-next-line no-unused-vars
  assignIfEmpty<T>(producer: (obj: any) => T): HyperFieldWorker {
    /*
    if (this.obj[this.field] !== undefined) {
      return this;
    }
    this.obj[this.field] = producer(this.obj);
    */
    return this;
  }
}
