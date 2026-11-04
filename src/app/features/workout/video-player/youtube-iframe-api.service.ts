import { DOCUMENT, RendererFactory2, Service, inject } from '@angular/core';

const YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';

/** The globals YouTube's script adds to `window`. */
type WindowWithYoutube = Window & {
  YT?: typeof YT;
  onYouTubeIframeAPIReady?: () => void;
};

/** Loads YouTube's IFrame API script once per page and hands back its API (`YT`). */
@Service()
export class YoutubeIframeApiService {
  private readonly document = inject(DOCUMENT);
  // Services can't inject Renderer2 directly; the factory gives a renderer not tied to a component.
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private loading: Promise<typeof YT> | undefined;

  /** Resolves with YouTube's API once it's ready. Safe to call many times; the script loads once. */
  load(): Promise<typeof YT> {
    this.loading ??= this.loadScript().catch((error: unknown) => {
      this.loading = undefined; // allow a retry next time
      throw error;
    });
    return this.loading;
  }

  private loadScript(): Promise<typeof YT> {
    return new Promise<typeof YT>((resolve, reject) => {
      const youtubeWindow = this.document.defaultView as WindowWithYoutube;
      if (youtubeWindow.YT?.Player) {
        resolve(youtubeWindow.YT);
        return;
      }

      // YouTube's script calls this global when it's ready. Keep any callback set before us.
      const previousReadyCallback = youtubeWindow.onYouTubeIframeAPIReady;
      youtubeWindow.onYouTubeIframeAPIReady = () => {
        previousReadyCallback?.();
        if (youtubeWindow.YT) {
          resolve(youtubeWindow.YT);
        } else {
          reject(new Error('YouTube reported ready, but its API is missing'));
        }
      };

      const script: HTMLScriptElement = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'src', YOUTUBE_IFRAME_API_URL);
      this.renderer.setAttribute(script, 'async', '');
      const removeErrorListener = this.renderer.listen(script, 'error', () => {
        removeErrorListener();
        // Undo our ready callback, so a retry doesn't wrap it again.
        youtubeWindow.onYouTubeIframeAPIReady = previousReadyCallback;
        this.renderer.removeChild(this.document.head, script);
        reject(new Error(`Could not load ${YOUTUBE_IFRAME_API_URL}`));
      });
      this.renderer.appendChild(this.document.head, script);
    });
  }
}
