import { DateTime } from 'luxon';

export const DateTimeConverter = {
  toFrontend(backend?: string): DateTime | undefined {
    if (!backend) {
      return undefined;
    }
    return DateTime.fromISO(backend).toLocal();
  },
  toBackend(frontend?: DateTime): string | undefined {
    if (!frontend) {
      return undefined;
    }
    return frontend.toUTC().toISO();
  },
};
