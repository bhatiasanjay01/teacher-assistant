/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */

import { GlobalError } from '../../../../frontend/src/app/shared/global-error/global-error';

export enum ErrorLocation {
  controller = 'controller',
  database = 'database',
  server = 'server',
  ui = 'ui',
  input = 'input',
}

type ValueChangedErrorProps = {
  frontendVersion: string;
  databaseVersion: string;
  resource: string;
  location: ErrorLocation;
};

export class ValueChangedError extends GlobalError {
  public static of(props: ValueChangedErrorProps): ValueChangedError {
    return new ValueChangedError({ data: props });
  }
}

type DataInconsistentErrorProps = {
  message: string;
  location: ErrorLocation;
};

export class DataInconsistentError extends GlobalError {
  public static of(props: DataInconsistentErrorProps): DataInconsistentError {
    return new DataInconsistentError({ data: props });
  }
}

type ValueShouldExistButNotErrorProps = { [x: string]: any } & {
  message: string;
  location: ErrorLocation;
};
export class ValueShouldExistButNotError extends GlobalError {
  public static of(props: ValueShouldExistButNotErrorProps): ValueShouldExistButNotError {
    return new ValueShouldExistButNotError({ data: props });
  }
}

type ValueShouldNotExistButExistErrorProps = {
  message: string;
  location: ErrorLocation;
};
export class ValueShouldNotExistButExistError extends GlobalError {
  public static of(props: ValueShouldNotExistButExistErrorProps): ValueShouldNotExistButExistError {
    return new ValueShouldNotExistButExistError({ data: props });
  }
}

type ValueConstraintErrorProps = {
  message: string;
  location: ErrorLocation;
};
export class ValueConstraintError extends GlobalError {
  public static of(props: ValueConstraintErrorProps): ValueConstraintError {
    return new ValueConstraintError({ message: props.message, data: { location: props.location } });
  }
}

type InsufficientPermissionErrorProps = {
  target: string;
  location: ErrorLocation;
};
export class InsufficientPermissionError extends GlobalError {
  public static of(props: InsufficientPermissionErrorProps): InsufficientPermissionError {
    return new InsufficientPermissionError({ data: props });
  }
}
