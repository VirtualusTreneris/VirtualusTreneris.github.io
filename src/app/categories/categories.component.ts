import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { ICategory } from '../models/configuration.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, OnDestroy {

  categories: ICategory[] | null = [];
  isCategorySelected: boolean = false;

  constructor(private configurationService: ConfigurationService) { }

  ngOnInit(): void {
    this.categories = this.configurationService.categories;

    this.configurationService.categorySet$.subscribe((category: ICategory | null) => {
      setTimeout(() => {
        this.isCategorySelected = category !== null;
      }, 1)
    });


    if (this.configurationService.title.length === 0) {
      this.configurationService.title = 'Virtualus Treneris'
    }
  }

  ngOnDestroy(): void {
    this.configurationService.title = '';
  }

  handleClick = (category: ICategory) => {
    this.configurationService.category = category;
    this.configurationService.title = category.name;
    this.configurationService.page = this.configurationService.pages[2];
  }

}
