import { TestBed } from '@angular/core/testing';
import { YoutubeIframeApiService } from './youtube-iframe-api.service';

describe('YoutubeIframeApiService: loads YouTube’s script once', () => {
  const SCRIPT_URL = 'https://www.youtube.com/iframe_api';
  const youtubeWindow = window as Window & { YT?: unknown; onYouTubeIframeAPIReady?: () => void };
  let api: YoutubeIframeApiService;

  const scripts = () =>
    Array.from(document.head.querySelectorAll<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`));
  const fakeYoutubeApi = { Player: class {} };
  /** What YouTube's script does when it has loaded: adds its API, then calls the ready callback. */
  const youtubeScriptLoads = () => {
    youtubeWindow.YT = fakeYoutubeApi;
    youtubeWindow.onYouTubeIframeAPIReady?.();
  };
  /** What the browser does when the script can't be downloaded. */
  const youtubeScriptFails = () => scripts().at(-1)!.dispatchEvent(new Event('error'));

  beforeEach(() => {
    api = TestBed.inject(YoutubeIframeApiService);
  });

  afterEach(() => {
    for (const script of scripts()) {
      script.remove();
    }
    delete youtubeWindow.YT;
    delete youtubeWindow.onYouTubeIframeAPIReady;
  });

  it('adds the script once, however many times it is asked', () => {
    void api.load();
    void api.load();
    void api.load();
    expect(scripts().length).toBe(1);
  });

  it("hands YouTube's API to every caller once it is ready", async () => {
    const first = api.load();
    const second = api.load();
    youtubeScriptLoads();
    await expect(first).resolves.toBe(fakeYoutubeApi);
    await expect(second).resolves.toBe(fakeYoutubeApi);
  });

  it('hands it over straight away if YouTube is already on the page', async () => {
    youtubeWindow.YT = fakeYoutubeApi;
    await expect(api.load()).resolves.toBe(fakeYoutubeApi);
    expect(scripts().length).toBe(0);
  });

  it('fails if the script cannot load, and removes the broken script', async () => {
    const loading = api.load();
    youtubeScriptFails();
    await expect(loading).rejects.toThrow(SCRIPT_URL);
    expect(scripts().length).toBe(0);
  });

  it('a failed load leaves no ready callback of ours behind', async () => {
    const otherCallback = vi.fn();
    youtubeWindow.onYouTubeIframeAPIReady = otherCallback;
    const loading = api.load();
    youtubeScriptFails();
    await expect(loading).rejects.toThrow();
    expect(youtubeWindow.onYouTubeIframeAPIReady).toBe(otherCallback);
  });

  it('tries again on the next call after a failure', async () => {
    const failed = api.load();
    youtubeScriptFails();
    await expect(failed).rejects.toThrow();

    const retry = api.load();
    expect(scripts().length).toBe(1);
    youtubeScriptLoads();
    await expect(retry).resolves.toBe(fakeYoutubeApi);
  });
});
