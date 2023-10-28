import { Duration } from 'luxon';

export const DurationTransformer = {
  toFrontend(backend?: string): Duration | undefined {
    if (!backend) {
      return undefined;
    }
    return Duration.fromISO(backend);
  },
  toBackend(frontend?: Duration): string | undefined {
    if (!frontend) {
      return undefined;
    }
    return frontend.toISO();
  },
};
