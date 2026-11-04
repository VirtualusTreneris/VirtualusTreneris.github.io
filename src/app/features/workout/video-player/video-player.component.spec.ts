import { ErrorHandler } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YoutubePlayerState } from '../youtube-player-state.constants';
import { VideoPlayerComponent } from './video-player.component';
import { YoutubeIframeApiService } from './youtube-iframe-api.service';

/** The parts of YouTube's player the component uses, faked so nothing loads from the internet. */
class FakeYoutubePlayer {
  static last: FakeYoutubePlayer;
  currentTime = 0;
  duration = 600;
  pauseVideo = vi.fn();
  playVideo = vi.fn();
  seekTo = vi.fn();
  destroy = vi.fn();
  constructor(
    readonly element: HTMLIFrameElement,
    readonly options: YT.PlayerOptions,
  ) {
    FakeYoutubePlayer.last = this;
  }
  getCurrentTime() {
    return this.currentTime;
  }
  getDuration() {
    return this.duration;
  }
  /** Simulates YouTube's events. */
  reportReady() {
    this.options.events?.onReady?.({ target: this } as unknown as YT.PlayerEvent);
  }
  reportState(state: YoutubePlayerState) {
    this.options.events?.onStateChange?.({
      data: state,
    } as unknown as YT.OnStateChangeEvent);
  }
}

describe('VideoPlayerComponent', () => {
  let fixture: ComponentFixture<VideoPlayerComponent>;
  let loadYoutubeApi: ReturnType<typeof vi.fn>;
  let errorHandler: { handleError: ReturnType<typeof vi.fn> };

  const iframe = () => (fixture.nativeElement as HTMLElement).querySelector('iframe')!;
  const embedUrl = () => new URL(iframe().getAttribute('src')!);
  const controls = () => (fixture.nativeElement as HTMLElement).querySelector('app-video-controls');
  const clickControl = (name: string) => {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>(`.button-${name}`)!
      .click();
  };

  /** Creates the player and lets it render and connect to the (fake) YouTube API. */
  const createPlayer = async (customControls: boolean) => {
    fixture = TestBed.createComponent(VideoPlayerComponent);
    fixture.componentRef.setInput('videoId', 'abcDEF12345');
    fixture.componentRef.setInput('playerVars', { autoplay: 1, start: 1 });
    fixture.componentRef.setInput('customControls', customControls);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(() => {
    loadYoutubeApi = vi.fn().mockResolvedValue({ Player: FakeYoutubePlayer });
    errorHandler = { handleError: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: YoutubeIframeApiService, useValue: { load: loadYoutubeApi } },
        { provide: ErrorHandler, useValue: errorHandler },
      ],
    });
  });

  describe('embed', () => {
    it('plays the given video with the given player settings', async () => {
      await createPlayer(true);
      expect(embedUrl().origin + embedUrl().pathname).toBe(
        'https://www.youtube.com/embed/abcDEF12345',
      );
      expect(embedUrl().searchParams.get('autoplay')).toBe('1');
      expect(embedUrl().searchParams.get('start')).toBe('1');
      expect(embedUrl().searchParams.get('enablejsapi')).toBe('1');
    });

    it('VP-4: links inside the video cannot open popups or leave the app', async () => {
      await createPlayer(true);
      const sandbox = iframe().getAttribute('sandbox')!.split(' ');
      expect(sandbox).toContain('allow-scripts');
      expect(sandbox).not.toContain('allow-popups');
      expect(sandbox).not.toContain('allow-top-navigation');
    });
  });

  describe('both control modes keep working', () => {
    it('custom controls: YouTube controls hidden, ours shown', async () => {
      await createPlayer(true);
      expect(embedUrl().searchParams.get('controls')).toBe('0');
      expect(controls()).not.toBeNull();
    });

    it("YouTube's controls: shown, ours absent", async () => {
      await createPlayer(false);
      expect(embedUrl().searchParams.has('controls')).toBe(false);
      expect(controls()).toBeNull();
    });
  });

  describe('connection to YouTube', () => {
    it('reports every player state change', async () => {
      await createPlayer(true);
      const states: YoutubePlayerState[] = [];
      fixture.componentInstance.stateChange.subscribe((state) => states.push(state));
      FakeYoutubePlayer.last.reportState(YoutubePlayerState.PAUSED);
      FakeYoutubePlayer.last.reportState(YoutubePlayerState.ENDED);
      expect(states).toEqual([YoutubePlayerState.PAUSED, YoutubePlayerState.ENDED]);
    });

    it('if YouTube cannot load, reports the error and keeps the video on screen', async () => {
      const error = new Error('no network');
      loadYoutubeApi.mockRejectedValue(error);
      await createPlayer(true);
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
      expect(iframe()).not.toBeNull();
    });

    it('destroys the YouTube player with the component', async () => {
      await createPlayer(true);
      fixture.destroy();
      expect(FakeYoutubePlayer.last.destroy).toHaveBeenCalled();
    });
  });

  describe('our controls drive the video', () => {
    beforeEach(async () => {
      await createPlayer(true);
      FakeYoutubePlayer.last.reportReady();
    });

    it('play/pause pauses a playing video and plays a paused one', () => {
      FakeYoutubePlayer.last.reportState(YoutubePlayerState.PLAYING);
      fixture.detectChanges();
      clickControl('toggle-play');
      expect(FakeYoutubePlayer.last.pauseVideo).toHaveBeenCalled();

      FakeYoutubePlayer.last.reportState(YoutubePlayerState.PAUSED);
      fixture.detectChanges();
      clickControl('toggle-play');
      expect(FakeYoutubePlayer.last.playVideo).toHaveBeenCalled();
    });

    it('rewind and fast forward jump 10 s', () => {
      FakeYoutubePlayer.last.currentTime = 100;
      clickControl('rewind');
      expect(FakeYoutubePlayer.last.seekTo).toHaveBeenLastCalledWith(90, true);
      clickControl('fast-forward');
      expect(FakeYoutubePlayer.last.seekTo).toHaveBeenLastCalledWith(110, true);
    });

    it('fast forward still works before YouTube knows the video length', () => {
      FakeYoutubePlayer.last.duration = 0; // YouTube reports 0 until the video's details load
      FakeYoutubePlayer.last.currentTime = 0;
      clickControl('fast-forward');
      expect(FakeYoutubePlayer.last.seekTo).toHaveBeenLastCalledWith(10, true);
    });

    it('never seeks before the start or past the end', () => {
      FakeYoutubePlayer.last.currentTime = 4;
      clickControl('rewind');
      expect(FakeYoutubePlayer.last.seekTo).toHaveBeenLastCalledWith(0, true);
      FakeYoutubePlayer.last.currentTime = 595;
      clickControl('fast-forward');
      expect(FakeYoutubePlayer.last.seekTo).toHaveBeenLastCalledWith(600, true);
    });
  });
});
