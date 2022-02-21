import { DateTimeArgs } from '../../../models/interfaces/date-time-args';

export class DateTimeUtils {
  constructor() {}

  static dateFromDateTimeArgs(args: DateTimeArgs): Date | null {
    if (Object.values(args).every(value => value !== null)) {
      const date = new Date();
      date.setFullYear(args.year, args.month - 1, args.day);
      date.setHours(args.hour, args.minute, args.second);
      return date;
    }
    return null;
  }
}
