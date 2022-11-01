import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { ICategory, IExercise, IPage } from './models/configuration.model';
import config from '../assets/config.json'
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  landingPageTitle: string = '';
  title: string = this.landingPageTitle;

  configuration: ICategory[] = config;

  backBtnHidden: boolean = true;

  constructor(private configurationService: ConfigurationService, private router: Router, private location: Location) {

  }

  ngOnInit() {
    this.configurationService.titleSet$.subscribe((data: string) => {
      setTimeout(() => {
        this.title = data;
        this.backBtnHidden = data === this.landingPageTitle;
      }, 0);

    })

    this.configurationService.setConfiguration(this.configuration);
  }

  handleBackClick = () => {
    const activePage: IPage = this.configurationService.page;

    if(activePage === this.configurationService.pages[0]) {
      // do nothing
    } else if(activePage === this.configurationService.pages[1]) {
      this.configurationService.page = this.configurationService.pages[0];
    } else if(activePage === this.configurationService.pages[2]) {
      this.configurationService.page = this.configurationService.pages[1];
      this.configurationService.category = null;
    } else if(activePage === this.configurationService.pages[3]) {
      this.configurationService.page = this.configurationService.pages[2];
      this.configurationService.exercise = null;
    }

  }

}
