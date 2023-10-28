import { DateTime } from 'luxon';

export class DateTimeUtils {
  static isSameDay(a: DateTime, b: DateTime) {
    return a.year === b.year && a.month === b.month && a.day === b.day;
  }
}
