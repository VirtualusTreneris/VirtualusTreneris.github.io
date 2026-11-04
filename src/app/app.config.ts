import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { BrowserActionBlockerService } from './shared/services/browser-action-blocker.service';
import { AutoReturnHomeService } from './shared/services/auto-return-home.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideAppInitializer(() => {
      inject(BrowserActionBlockerService).start();
      inject(AutoReturnHomeService).start();
    }),
  ],
};
