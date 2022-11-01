import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { ICategory, IExercise, IPage } from './models/configuration.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  pages: IPage[] = [
    {id:'virtualusTreneris',name: 'Virtualus Treneris'},
    {id:'category',name: 'Kategorija'},
    {id:'exercise',name: 'Pratimas'},
    {id:'video',name: 'Video'},
  ];
  
  private data$ = new Subject<ICategory[]>();
  private page$ = new Subject<IPage>();
  private category$ = new Subject<ICategory | null>();
  private exercise$ = new Subject<IExercise | null>();
  private title$ = new Subject<string>();

  private _configuration: ICategory[] = [];
  private _page: IPage = this.pages[0];
  private _category: ICategory | null = null;
  private _exercise: IExercise | null = null;
  private _title: string = '';

  dataLoaded$ = this.data$.asObservable();
  pageChanged$ = this.page$.asObservable();
  categorySet$ = this.category$.asObservable();
  exerciseSet$ = this.exercise$.asObservable();
  titleSet$ = this.title$.asObservable();

  
  constructor() { }

  setConfiguration = (config: ICategory[]) => {
    this._configuration = config;
    this.data$.next(config);
  }

  public get categories(): ICategory[] | null {
    return this._configuration;
  }

  public get category(): ICategory | null {
    return this._category;
  }

  public set category(category: ICategory | null) {
    this._category = category;
    this.category$.next(category);
  }

  public get exercise(): IExercise | null {
    return this._exercise;
  }

  public set exercise(exercise: IExercise | null) {
    this._exercise = exercise;
    this.exercise$.next(exercise);
  }

  public get title(): string {
    return this._title;
  }

  public set title(title: string) {
    this._title = title;
    this.title$.next(title);
  }

  public get page(): IPage {
    return this._page;
  }

  public set page(page: IPage) {
    this._page = page;
    this.page$.next(page);
  }

}
