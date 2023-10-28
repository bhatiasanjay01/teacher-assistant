import * as Lodash from 'lodash';
import { HyperJs } from '../hyper-js/hyper-js';
import { GlobalError } from './global-error';
import { GlobalErrorDefinition } from './global-error-definition';

function matchKey({
  actual,
  expected,
  expectedList,
}: {
  actual: GlobalError | GlobalErrorDefinition;
  expected?: GlobalError | GlobalErrorDefinition;
  expectedList?: (GlobalError | GlobalErrorDefinition)[];
}) {
  if (expectedList) {
    return Lodash.some(expectedList, (e) => matchKey({ actual, expected: e }));
  }

  if (HyperJs.isNullOrUndefined(actual?.key) || HyperJs.isNullOrUndefined(expected?.key)) {
    return false;
  }

  return actual.key === expected.key;
}

export const GlobalErrorFuncs = { matchKey };
