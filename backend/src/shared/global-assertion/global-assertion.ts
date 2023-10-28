import { Checker } from '../../../../frontend/src/app/shared/checker/checker';

import { ErrorOrGlobalError, GlobalError } from '../../../../frontend/src/app/shared/global-error/global-error';
import {
  ErrorLocation,
  ValueConstraintError,
  ValueShouldExistButNotError,
  ValueShouldNotExistButExistError,
} from './global-assertion.error';

export class GlobalAssertion {
  public static assertTrue({
    value,
    message,
    key,
    skipOnCall,
    location,
  }: {
    value: boolean;
    message?: string;
    key?: string;
    skipOnCall?: boolean;
    location?: ErrorLocation;
  }) {
    if (!value) {
      throw new GlobalError({ message, key, skipOnCall, data: { location } });
    }
  }

  public static assertFalse({ value, message, location }: { value: boolean; message?: string; location?: ErrorLocation }) {
    if (value) {
      throw new GlobalError({ message, data: { location } });
    }
  }

  public static oldAssertTrue(value: boolean, error: ErrorOrGlobalError) {
    if (!value) {
      throw error;
    }
  }

  public static assertExistInInput(value: any, message: string) {
    GlobalAssertion.oldAssertTrue(
      Checker.valueIsNotEmpty(value),
      ValueShouldExistButNotError.of({ message, location: ErrorLocation.controller })
    );
  }

  public static assertExistInDatabase(value: any, message: string) {
    GlobalAssertion.oldAssertTrue(
      Checker.valueIsNotEmpty(value),
      ValueShouldExistButNotError.of({ message, location: ErrorLocation.database })
    );
  }

  public static assertEmptyInDatabase(value: any, message: string) {
    GlobalAssertion.oldAssertTrue(
      Checker.valueIsEmpty(value),
      ValueShouldNotExistButExistError.of({ message, location: ErrorLocation.database })
    );
  }

  public static assertEmptyArrayInDatabase(value: any, message: string) {
    GlobalAssertion.oldAssertTrue(
      Checker.arrayIsEmpty(value),
      ValueShouldNotExistButExistError.of({ message, location: ErrorLocation.database })
    );
  }

  public static assertTooManyItemsInDatabase(actualValue: number, maxValue: number, message: string) {
    GlobalAssertion.oldAssertTrue(
      actualValue <= maxValue,
      ValueShouldNotExistButExistError.of({ message, location: ErrorLocation.database })
    );
  }

  public static assertMeetConstraintInInput(meetConstraint: boolean, message: string) {
    GlobalAssertion.oldAssertTrue(meetConstraint, ValueConstraintError.of({ message, location: ErrorLocation.input }));
  }
}
