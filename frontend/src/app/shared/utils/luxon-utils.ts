import { DateTime, Settings } from 'luxon';

export class LuxonUtils {
  static getGreetings(dateTime: DateTime) {
    const { hour } = dateTime;
    if (hour >= 6 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Night';
    }
  }

  static toJSDateKeepLocalTime(dateTime?: DateTime) {
    return dateTime?.setZone('local', { keepLocalTime: true }).toJSDate();
  }

  static toDateTimeKeepLocalTime(date?: Date) {
    if (!date) {
      return undefined;
    }
    return DateTime.fromJSDate(date).setZone('local').setZone(Settings.defaultZone, { keepLocalTime: true });
  }
}
