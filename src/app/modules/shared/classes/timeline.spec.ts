import { BehaviorSubject } from 'rxjs';
import { Timeline } from './timeline';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { Theme } from '../../template-creator/models/interfaces/theme';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KonvaContainerComponent } from 'src/app/testing/components/konva-container.component';
import { Tick, TICK_NAME } from './tick';
import { TimeMark } from './time-mark';
import { LTICK_DIST } from './timeline-constants';

describe('Timeline', () => {
  let component: KonvaContainerComponent;
  let fixture: ComponentFixture<KonvaContainerComponent>;

  let timeline: Timeline;
  const theme$ = new BehaviorSubject<Theme>(mockTheme);

  const getTicks = (): Tick[] => Array.from(timeline.tickLayer.find(`.${TICK_NAME}`));

  const checkTickSeconds = (tickSeconds: number): void => {
    const ticks = getTicks();

    for (let i = 0; i < ticks.length; i += LTICK_DIST) {
      const currentTick = ticks[i];
      const timeMark = currentTick.timeMark();
      expect(timeMark.getAttr('totalSeconds')).toEqual(i * tickSeconds);
    }
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [KonvaContainerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(KonvaContainerComponent);
    component = fixture.componentInstance;
    timeline = new Timeline();
    component.afterInit = () => timeline.initKonva(component.konvaContainer.nativeElement, theme$.asObservable());
    fixture.detectChanges();
  });

  describe('Initialization tests', () => {
    it('should create', () => {
      expect(timeline).toBeTruthy();
    });

    it('should initialize konva elements', () => {
      expect(timeline.stage).toBeTruthy();
      expect(timeline.paddingMask).toBeTruthy();
      expect(timeline.tickManager).toBeTruthy();
    });

    it('should correctly set start seconds', () => {
      // TODO: check if stage can be dragged below 0.
      timeline.tickSeconds = 5;
      timeline.startSeconds = 50;

      // First tick starts at left padding not 0.
      const startTick = getTicks().find(tick => tick.x() === timeline.timelinePadding[3]);
      const timeMark = startTick.timeMark() as TimeMark;

      // Check if first displayed tick has a time mark with start seconds as total seconds.
      expect(timeMark.getAttr('totalSeconds')).toEqual(timeline.startSeconds);
    });

    describe('should correctly set tick seconds', () => {
      it(`default tick seconds`, () => {
        checkTickSeconds(timeline.tickSeconds);
      });

      for (let i = 1; i < 11; i++) {
        const randomTickSeconds = Math.round(1 + Math.random() * 1000);

        it(`tick seconds randomly set to: ${randomTickSeconds} from range (1 - 1000)`, () => {
          timeline.tickSeconds = randomTickSeconds;
          checkTickSeconds(randomTickSeconds);
        });
      }
    });
  });

  describe('User interaction tests', () => {
    it('should not move below 0 seconds on drag', () => {
      expect(timeline.stageX).toEqual(0);
    });
  });
});
