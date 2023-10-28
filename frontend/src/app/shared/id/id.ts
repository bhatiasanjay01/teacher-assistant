import * as uuid from 'uuid';
import { NumberUtils } from '../utils/number-utils';

export enum IdVersion {
  taskApp,
  unknown,
}

let autoIncrementIdCurrent = 0;
function autoIncrementId(): string {
  autoIncrementIdCurrent += 1;
  return `${autoIncrementIdCurrent}`;
}

function randomId(size: number): string {
  const str = '23456789abcdefghjkmnpqrstuvwxyz';
  const resultList = [];
  for (let i = 0; i < size; i += 1) {
    const randomIndex = Math.floor(Math.random() * str.length);
    resultList.push(str.charAt(randomIndex));
  }

  return resultList.join('');
}

export type IdAndCoreType = {
  id: string;
};

/*
 * MARK - UUID
 */

function uuidGenerate(): string {
  return uuid.v4();
}

function uuidGenerate2(): string {
  const id = uuid.v4();

  let no = 0;
  const chars = [];

  for (let i = 0; i < id.length; i += 1) {
    const c = id.charAt(i);

    if (c === '-') {
      // eslint-disable-next-line no-continue
      continue;
    }

    chars.push(c);
    no += 1;

    if (no === 8) {
      chars.push('-');
      no = 0;
    }
  }

  chars.pop();

  return chars.join('');
}

function uuidBase62(): string {
  const id = uuid.v4() as string;

  const idWithoutDash = id.replaceAll(/-/g, '');

  const base16 = '0123456789abcdef';
  const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let bigInt = 0n;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < idWithoutDash.length; i++) {
    const char16 = idWithoutDash[i];
    const index16 = base16.indexOf(char16);
    bigInt += BigInt(index16);
    bigInt *= 16n;
  }

  const results = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 22; i++) {
    const index22 = bigInt % 62n;
    results.push(base62.charAt(Number(index22)));
    bigInt /= 62n;
  }

  return results.join('');
}

function generateFrontendId() {
  return NumberUtils.getRandomInt(0, 1000000);
}

export const Id = {
  autoIncrement: {
    generate: autoIncrementId,
  },
  easyReading: {
    generate: randomId,
  },
  uuid: {
    generate: uuidGenerate,
    generateEvenlySeparated: uuidGenerate2,
    generateInBase62: uuidBase62,
  },
  frontend: {
    generate: generateFrontendId,
  },
  upper4: {
    generate: () => {
      const str = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
      const resultList = [];
      for (let i = 0; i < 4; i += 1) {
        const randomIndex = Math.floor(Math.random() * str.length);
        resultList.push(str.charAt(randomIndex));
      }
      return resultList.join('');
    },
  },
  readonlyVersion: 'readonly-no-version',
};
