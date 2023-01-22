import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  private _timer: any;
  private _defaultDelay: number = 60 * 1000 * 5; // 5 minutes

  constructor(private configurationService: ConfigurationService) { }

  start = (delay?: number) => {
    this.stop();
    this._timer = setTimeout(() => {
      this.configurationService.redirectToFrontPage();
    }, delay || this._defaultDelay);
  }

  stop = () => {
    
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }
}
