import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

// https://github.com/moment/luxon/blob/master/docs/formatting.md
@Pipe({ name: 'toLocaleFormat' })
export class ToLocaleFormat implements PipeTransform {
  transform(dateTime: DateTime | undefined, format: string): string | undefined {
    return dateTime?.toLocal().toFormat(format);
  }
}
