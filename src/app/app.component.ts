import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage],
  template: `
    <div class="background">
      <img ngSrc="/images/bg.webp" fill priority />
    </div>
    <div class="bottom-fade"></div>
    <router-outlet />
  `,
  styles: `
    .background {
      position: fixed;
      inset: 0;
      background: #000;
    }
    .background img {
      object-fit: cover;
    }
    .bottom-fade {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 40vh;
      background: linear-gradient(to top, #000 57.55%, rgba(0, 0, 0, 0) 100%);
    }
  `,
})
export class AppComponent {}
