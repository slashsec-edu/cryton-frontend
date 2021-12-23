import { Theme } from '../../template-creator/models/interfaces/theme';
import { TimeMark } from './time-mark';

describe('TimeMark', () => {
  let timemark: TimeMark;

  it('should create', () => {
    timemark = new TimeMark({
      totalSeconds: 0
    });

    expect(timemark).toBeTruthy();
  });

  it('should correctly calculate text when using UTC seconds', () => {
    const timezoneOffset = new Date().getTimezoneOffset() * 60;
    timemark = new TimeMark({
      totalSeconds: timezoneOffset,
      useUTC: true
    });
    const testingDates: { seconds: number; date: string }[] = [
      { seconds: 0, date: '01. 01. 1970 - 00:00:00' },
      { seconds: 10000, date: '01. 01. 1970 - 02:46:40' },
      { seconds: 100000, date: '02. 01. 1970 - 03:46:40' },
      { seconds: 15678910, date: '01. 07. 1970 - 11:15:10' },
      { seconds: 16519181951, date: '21. 06. 2493 - 06:39:11' }
    ];

    testingDates.forEach(scenario => {
      timemark.recalculate(scenario.seconds + timezoneOffset, false);
      expect(timemark.text()).toEqual(scenario.date);
    });
  });

  it('should correctly calculate text when not using UTC seconds', () => {
    timemark = new TimeMark({
      totalSeconds: 0
    });
    const testingDates: { seconds: number; date: string }[] = [
      { seconds: 0, date: '00:00:00' },
      { seconds: 10000, date: '02:46:40' },
      { seconds: 100000, date: '27:46:40' },
      { seconds: 15678910, date: '4355:15:10' },
      { seconds: 16519181951, date: '4588661:39:11' }
    ];

    testingDates.forEach(scenario => {
      timemark.recalculate(scenario.seconds, false);
      expect(timemark.text()).toEqual(scenario.date);
    });
  });

  it('should correctly set the theme', () => {
    const textColor = '#7777';
    timemark = new TimeMark({
      totalSeconds: 0,
      theme: { templateCreator: { timemarkText: textColor } } as Theme
    });

    expect(timemark.fill()).toEqual('#7777');
  });

  it('should use constant text if provided', () => {
    const constantText = 'Testing text';
    timemark = new TimeMark({
      totalSeconds: 0,
      constantText
    });

    expect(timemark.text()).toEqual(constantText);
    timemark.recalculate(50, false);
    expect(timemark.text()).toEqual(constantText);
  });

  it('should center the text when using center coords', () => {
    timemark = new TimeMark({
      totalSeconds: 0,
      useCenterCoords: true
    });

    expect(timemark.x()).toEqual(-timemark.width() / 2);
    expect(timemark.y()).toEqual(-timemark.height() / 2);
  });
});
