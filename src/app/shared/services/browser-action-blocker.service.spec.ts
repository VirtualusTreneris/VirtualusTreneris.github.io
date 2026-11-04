import { TestBed } from '@angular/core/testing';
import { BrowserActionBlockerService } from './browser-action-blocker.service';

describe('BrowserActionBlockerService: kiosk restrictions', () => {
  /** Dispatches the event on the document and tells whether the app blocked it. */
  const isBlocked = (event: Event) => {
    document.dispatchEvent(event);
    return event.defaultPrevented;
  };
  const cancelable = (type: string) => new Event(type, { cancelable: true });
  const touchMove = (fingers: number) => {
    const event = cancelable('touchmove');
    Object.defineProperty(event, 'touches', { value: Array.from({ length: fingers }) });
    return event;
  };

  beforeEach(() => {
    TestBed.inject(BrowserActionBlockerService).start();
  });

  afterEach(() => {
    TestBed.resetTestingModule(); // destroys the service, removing its listeners
  });

  it('K-1: blocks the context menu', () => {
    expect(isBlocked(cancelable('contextmenu'))).toBe(true);
  });

  it('K-2: blocks ctrl+wheel zoom, but not normal wheel scrolling', () => {
    expect(isBlocked(new WheelEvent('wheel', { ctrlKey: true, cancelable: true }))).toBe(true);
    expect(isBlocked(new WheelEvent('wheel', { ctrlKey: false, cancelable: true }))).toBe(false);
  });

  it.each(['gesturestart', 'gesturechange', 'gestureend'])(
    'K-2: blocks pinch gesture %s',
    (type) => {
      expect(isBlocked(cancelable(type))).toBe(true);
    },
  );

  it('K-2: blocks multi-finger touch moves, but not one-finger scrolling', () => {
    expect(isBlocked(touchMove(2))).toBe(true);
    expect(isBlocked(touchMove(1))).toBe(false);
  });

  it('K-3: blocks dragging', () => {
    expect(isBlocked(cancelable('dragstart'))).toBe(true);
  });

  it('stops blocking once destroyed', () => {
    TestBed.resetTestingModule();
    expect(isBlocked(cancelable('contextmenu'))).toBe(false);
  });
});
