import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoControlsComponent } from './video-controls.component';

describe('VideoControlsComponent: video controls', () => {
  // From the functional requirements (VC-4), not from the code.
  const HIDE_AFTER_MS = 4000;
  let fixture: ComponentFixture<VideoControlsComponent>;

  const element = () => fixture.nativeElement as HTMLElement;
  const buttonsVisible = () => !element().querySelector('.controls')!.classList.contains('hidden');
  const button = (name: string) => element().querySelector<HTMLButtonElement>(`.button-${name}`)!;
  const rewindButton = () => button('rewind');
  const togglePlayButton = () => button('toggle-play');
  const fastForwardButton = () => button('fast-forward');
  const tapVideo = () => {
    element().querySelector<HTMLElement>('.tap-area')!.click();
    fixture.detectChanges();
  };
  const advance = (ms: number) => {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  };
  const setPlaying = (playing: boolean) => {
    fixture.componentRef.setInput('playing', playing);
    fixture.detectChanges();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(VideoControlsComponent);
    setPlaying(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('VC-1: tapping the video plays or pauses it', () => {
    const togglePlay = vi.fn();
    fixture.componentInstance.togglePlay.subscribe(togglePlay);
    tapVideo();
    expect(togglePlay).toHaveBeenCalledTimes(1);
  });

  it('VC-2: the buttons rewind, play/pause and fast forward', () => {
    const rewind = vi.fn();
    const togglePlay = vi.fn();
    const fastForward = vi.fn();
    fixture.componentInstance.rewind.subscribe(rewind);
    fixture.componentInstance.togglePlay.subscribe(togglePlay);
    fixture.componentInstance.fastForward.subscribe(fastForward);
    rewindButton().click();
    togglePlayButton().click();
    fastForwardButton().click();
    expect(rewind).toHaveBeenCalledTimes(1);
    expect(togglePlay).toHaveBeenCalledTimes(1);
    expect(fastForward).toHaveBeenCalledTimes(1);
  });

  it('VC-3: while paused, the buttons are always visible', () => {
    setPlaying(false);
    advance(60 * 60_000);
    expect(buttonsVisible()).toBe(true);
  });

  it('VC-4: while playing, the buttons are hidden until the video is tapped', () => {
    expect(buttonsVisible()).toBe(false);
    tapVideo();
    expect(buttonsVisible()).toBe(true);
  });

  it('VC-4: while playing, the buttons hide 4 s after the last tap', () => {
    tapVideo();
    advance(HIDE_AFTER_MS - 1);
    expect(buttonsVisible()).toBe(true);
    advance(1);
    expect(buttonsVisible()).toBe(false);
  });

  it('VC-4: every tap or button press restarts the 4 s', () => {
    tapVideo();
    advance(HIDE_AFTER_MS - 1000);
    fastForwardButton().click();
    fixture.detectChanges();
    advance(HIDE_AFTER_MS - 1);
    expect(buttonsVisible()).toBe(true);
    advance(1);
    expect(buttonsVisible()).toBe(false);
  });
});
