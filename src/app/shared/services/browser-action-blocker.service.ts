import { DOCUMENT, DestroyRef, RendererFactory2, Service, inject } from '@angular/core';

/** Blocks the browser's own actions on the kiosk: context menu, zoom and dragging. */
@Service()
export class BrowserActionBlockerService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  // Services can't inject Renderer2 directly; the factory gives a renderer not tied to a component.
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);

  /** Starts blocking: adds the document listeners. Call once at app start. */
  start(): void {
    const preventDefault = (event: Event) => {
      event.preventDefault();
    };
    // Browsers ignore preventDefault() in passive listeners, so zoom-related ones must be non-passive.
    const notPassive = { passive: false };

    const removeListeners = [
      // No context menu (right click and touch long-press).
      this.renderer.listen(this.document, 'contextmenu', preventDefault),

      // Nothing can be dragged.
      this.renderer.listen(this.document, 'dragstart', preventDefault),

      // No ctrl+wheel zoom.
      this.renderer.listen(
        this.document,
        'wheel',
        (event: WheelEvent) => {
          if (event.ctrlKey) {
            event.preventDefault();
          }
        },
        notPassive,
      ),

      // No pinch zoom: Safari/WebKit gesture events...
      this.renderer.listen(this.document, 'gesturestart', preventDefault, notPassive),
      this.renderer.listen(this.document, 'gesturechange', preventDefault, notPassive),
      this.renderer.listen(this.document, 'gestureend', preventDefault, notPassive),

      // ...and multi-finger touch on touch screens.
      this.renderer.listen(
        this.document,
        'touchmove',
        (event: TouchEvent) => {
          if (event.touches.length > 1) {
            event.preventDefault();
          }
        },
        notPassive,
      ),
    ];

    this.destroyRef.onDestroy(() => {
      for (const removeListener of removeListeners) {
        removeListener();
      }
    });
  }
}
