import { CrytonDatetimePipe } from './cryton-datetime.pipe';

describe('CrytonDatetimePipe', () => {
  let pipe: CrytonDatetimePipe;

  beforeAll(() => {
    pipe = new CrytonDatetimePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform any date into format: DD. MM. YYYY - HH:MM:SS', () => {
    const dates: string[] = ['Jun 16, 2000 09:30:00', 'Jul 1, 1111, 23:23:23'];

    expect(pipe.transform(dates[0])).toBe('16. 06. 2000 - 09:30:00');
    expect(pipe.transform(dates[1])).toBe('01. 07. 1111 - 23:23:23');
  });
});
