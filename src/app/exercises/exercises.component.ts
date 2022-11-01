import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { ICategory, IExercise } from '../models/configuration.model';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css'],
})
export class ExercisesComponent implements OnInit, OnDestroy {

  category: ICategory | null = null;
  categories: ICategory[] = [];

  isExerciseSelected: boolean = false;

  constructor(private configurationService: ConfigurationService) { }

  ngOnInit(): void {
    console.log();
    this.categories = this.configurationService.categories ?? [];
    this.category = this.configurationService.category;

    this.configurationService.exerciseSet$.subscribe((exercise: IExercise | null) => {
      setTimeout(() => {
        this.isExerciseSelected = exercise !== null;
      }, 1);

    });
  }

  ngOnDestroy(): void {
    this.configurationService.title = 'Virtualus Treneris';
    this.configurationService.category = null;
  }

  handleClick = (exercise: IExercise) => {
    this.configurationService.exercise = exercise;
    this.configurationService.title = exercise.name;
    this.configurationService.page = this.configurationService.pages[3];
  }

}
