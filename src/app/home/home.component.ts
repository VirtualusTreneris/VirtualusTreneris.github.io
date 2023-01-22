import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { IPage } from '../models/configuration.model';
import { TimerService } from '../timer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  pageActive: boolean = true;

  constructor(private configurationService: ConfigurationService, private timerService: TimerService) { }

  ngOnInit(): void {
    this.configurationService.pageChanged$.subscribe((page: IPage) => {
      this.pageActive = page === this.configurationService.pages[0];

      if(page === this.configurationService.pages[0] || page === this.configurationService.pages[3]) {
        this.timerService.stop();
      } else {
        this.timerService.start();
      }
    })
  }

  ngOnDestroy(): void { }

  handleClick = () => {
    this.configurationService.title = 'Virtualus Treneris';
    this.configurationService.page = this.configurationService.pages[1];
    this.pageActive = this.configurationService.page === this.configurationService.pages[0];
  }
}
