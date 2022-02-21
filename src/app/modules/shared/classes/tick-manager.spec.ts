import Konva from 'konva';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { Theme } from '../../template-creator/models/interfaces/theme';
import { TimelineParams } from '../models/interfaces/timeline-params.interface';
import { Tick, TICK_NAME } from './tick';
import { TickManager } from './tick-manager';
import { TimeMark, TIME_MARK_NAME } from './time-mark';
import { LTICK_DIST, RECYCLER_RADIUS, TICK_WIDTH } from './timeline-constants';

const DEFAULT_TIMELINE_PADDING: [number, number, number, number] = [0, 0, 0, 0];
const DEFAULT_TICK_SECONDS = 1;
const DEFAULT_WIDTH = TICK_WIDTH * 10;
const DEFAULT_HEIGHT = 10;

describe('TickManager', () => {
  let tickManager: TickManager;
  let tickLayer: Konva.Layer;
  let timeMarkLayer: Konva.Layer;

  const getTicks = (): Tick[] => [...tickLayer.find(`.${TICK_NAME}`)] as Tick[];

  const getXCoords = (): number[] =>
    getTicks()
      .map(tick => tick.x())
      .sort((a, b) => a - b);

  const getTimeMarks = (): TimeMark[] => [...timeMarkLayer.find(`.${TIME_MARK_NAME}`)] as TimeMark[];

  const testPreRenderedBreakingPoint = (tickSeconds: number, leftPadding: number) => {
    const startXCoords = getXCoords();
    const renderStartX = (RECYCLER_RADIUS - 0.5) * TICK_WIDTH + leftPadding;

    tickManager.renderTicks(DEFAULT_HEIGHT, -renderStartX, tickSeconds, mockTheme);

    expectTickAppend(startXCoords);
  };

  const testTickRendering = (): void => {
    tickManager.createTicks(DEFAULT_HEIGHT, DEFAULT_TICK_SECONDS, mockTheme);
    let testingX = (RECYCLER_RADIUS - 1) * TICK_WIDTH;
    let xCoordsBefore: number[];

    // Move forward by 100 ticks, expect 100x append
    for (let i = 0; i < 100; i++) {
      xCoordsBefore = getXCoords();
      testingX += TICK_WIDTH;
      tickManager.renderTicks(DEFAULT_HEIGHT, -testingX, DEFAULT_TICK_SECONDS, mockTheme);
      expectTickAppend(xCoordsBefore);
    }

    // Move backward by 100 ticks, expect 100x prepend
    for (let i = 0; i < 100; i++) {
      xCoordsBefore = getXCoords();
      testingX -= TICK_WIDTH;
      tickManager.renderTicks(DEFAULT_HEIGHT, -testingX, DEFAULT_TICK_SECONDS, mockTheme);
      expectTickPrepend(xCoordsBefore);
    }
  };

  const expectTickAppend = (originalXCoords: number[]): void => {
    const expectedXCoords = originalXCoords.map(coord => coord + TICK_WIDTH);
    expect(getXCoords()).toEqual(expectedXCoords);
  };

  const expectTickPrepend = (originalXCoords: number[]): void => {
    const expectedXCoords = originalXCoords.map(coord => coord - TICK_WIDTH);
    expect(getXCoords()).toEqual(expectedXCoords);
  };

  const createTickManager = (padding = DEFAULT_TIMELINE_PADDING, useUTC = false): void => {
    tickLayer = new Konva.Layer();
    timeMarkLayer = new Konva.Layer();

    const timelineWidth = DEFAULT_WIDTH;
    const timelineParams: TimelineParams = {
      tickSeconds: DEFAULT_TICK_SECONDS,
      secondsAtZero: 0,
      padding
    };
    tickManager = new TickManager(timelineWidth, tickLayer, timeMarkLayer, timelineParams, useUTC);
  };

  beforeEach(() => {
    createTickManager();
  });

  it('should create', () => {
    expect(tickManager).toBeTruthy();
  });

  it('should correctly initialize ticks', () => {
    tickManager.createTicks(DEFAULT_HEIGHT, DEFAULT_TICK_SECONDS, mockTheme);

    // We expect that there are ticks for the whole width + pre-rendered ticks for both sides
    const expectedTickCount = DEFAULT_WIDTH / TICK_WIDTH + 2 * RECYCLER_RADIUS;
    const tickXCoords = getXCoords();

    expect(tickXCoords.length).toEqual(expectedTickCount);
    let expectedTickX = DEFAULT_TIMELINE_PADDING[3];

    // We expect ticks to be evenly distributed by TICK_WIDTH starting at the end of timeline's left padding.
    tickXCoords.forEach(tickX => {
      expect(tickX).toEqual(expectedTickX);
      expectedTickX += TICK_WIDTH;
    });
  });

  describe('Tick rendering tests', () => {
    it('should not render new ticks until the pre-rendered ticks are hidden evenly from both sides', () => {
      tickManager.createTicks(DEFAULT_HEIGHT, DEFAULT_TICK_SECONDS, mockTheme);
      const renderStartX = (RECYCLER_RADIUS - 1) * TICK_WIDTH + DEFAULT_TIMELINE_PADDING[0];
      const startXCoords = getXCoords();

      const testingPoints = [
        renderStartX * 0.2,
        renderStartX * 0.5,
        renderStartX * 0.7,
        renderStartX * 0.9,
        renderStartX * 0.95,
        renderStartX * 0.99
      ];

      testingPoints.forEach(point => {
        tickManager.renderTicks(DEFAULT_HEIGHT, -point, DEFAULT_TICK_SECONDS, mockTheme);

        // Expect ticks to stay the same.
        expect(startXCoords).toEqual(getXCoords());
      });
    });

    it('should render a new tick after stageX passes pre-rendered ticks', () => {
      const tickSecondOptions = [1, 5, 10, 50, 100, 1000, 10000, 100000, 1000000, 10000000];
      const leftPaddingOptions = [0, 10, 100, 1000, 10000, 100000];

      // Test with every combination of tick seconds and left padding.
      tickSecondOptions.forEach(tickSeconds => {
        leftPaddingOptions.forEach(leftPadding => {
          createTickManager([0, 0, 0, leftPadding]);
          tickManager.createTicks(DEFAULT_HEIGHT, tickSeconds, mockTheme);
          testPreRenderedBreakingPoint(tickSeconds, leftPadding);
        });
      });
    });

    it('should correctly add new ticks when useUTC = false', () => {
      testTickRendering();
    });

    it('should correctly add new ticks when useUTC = true', () => {
      createTickManager(DEFAULT_TIMELINE_PADDING, true);
      testTickRendering();
    });
  });

  describe('Time mark rendering tests', () => {
    it('should render a time mark above every LTICK_DIST-th tick', () => {
      tickManager.createTicks(DEFAULT_HEIGHT, DEFAULT_TICK_SECONDS, mockTheme);

      const ticks = getTicks().sort((a, b) => a.x() - b.x());
      const timeMarks = getTimeMarks().sort((a, b) => a.x() - b.x());

      for (let i = 0; i < ticks.length; i += LTICK_DIST) {
        const currentTick = ticks[i];
        const timeMark = currentTick.timeMark();

        expect(timeMark).toEqual(timeMarks[i / LTICK_DIST]);
      }
    });

    it('should correctly set total seconds of time marks', () => {
      tickManager.createTicks(DEFAULT_HEIGHT, DEFAULT_TICK_SECONDS, mockTheme);

      const timeMarks = getTimeMarks().sort((a, b) => a.x() - b.x());

      timeMarks.forEach((timeMark, i) => {
        expect(timeMark.getAttr('totalSeconds')).toEqual(i * LTICK_DIST * DEFAULT_TICK_SECONDS);
      });
    });

    it('should correctly recalculate time marks', () => {
      tickManager.createTicks(DEFAULT_HEIGHT, DEFAULT_TICK_SECONDS, mockTheme);

      const timeMarks = getTimeMarks();

      const tickSecondsOptions = [1, 10, 11.12345, 10000, 333333];
      const startSecondsOptions = [0, 100, 1000000, 33333, 156.542];

      tickSecondsOptions.forEach(tickSeconds => {
        startSecondsOptions.forEach(startSeconds => {
          tickManager.recalculateTimeMarks(tickSeconds, startSeconds);
          const timeMarkSeconds = timeMarks.map(timeMark => Number(timeMark.getAttr('totalSeconds')));

          timeMarkSeconds.forEach((seconds, i) => {
            expect(seconds).toEqual(startSeconds + i * LTICK_DIST * tickSeconds);
          });
        });
      });
    });
  });

  describe('Theme tests', () => {
    it('should correctly change theme', () => {
      tickManager.createTicks(DEFAULT_HEIGHT, DEFAULT_TICK_SECONDS, mockTheme);

      // Create a deep copy of theme object
      const newTheme = JSON.parse(JSON.stringify(mockTheme)) as Theme;
      const newTimeMarkColor = '#77777';
      const newTickColor = '#88888';
      const newLTickColor = '#99999';
      newTheme.templateCreator.timemarkText = newTimeMarkColor;
      newTheme.templateCreator.tick = newTickColor;
      newTheme.templateCreator.leadingTick = newLTickColor;

      const ticks = getTicks();
      const timeMarks = getTimeMarks();

      // Check if ticks and time marks have the default theme color
      ticks.forEach(tick => {
        expect(tick.stroke()).toEqual(
          tick.getAttr('isLeading') ? mockTheme.templateCreator.leadingTick : mockTheme.templateCreator.tick
        );
      });
      timeMarks.forEach(timeMark => {
        expect(timeMark.fill()).toEqual(mockTheme.templateCreator.timemarkText);
      });

      tickManager.changeTheme(newTheme);

      // Check if ticks have the new theme color
      ticks.forEach(tick => {
        expect(tick.stroke()).toEqual(tick.getAttr('isLeading') ? newLTickColor : newTickColor);
      });
      timeMarks.forEach(timeMark => {
        expect(timeMark.fill()).toEqual(newTimeMarkColor);
      });
    });
  });
});
