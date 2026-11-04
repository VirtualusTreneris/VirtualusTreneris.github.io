import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { WorkoutLibraryService } from '../services/workout-library.service';
import { Workout } from '../types/workout-library.types';

/** Resolves `:categoryId/:trainerId/:workoutId` to its workout, or redirects Home if it doesn't exist. */
export const workoutResolver: ResolveFn<Workout> = (route) => {
  const workout = inject(WorkoutLibraryService).findWorkout(
    route.paramMap.get('categoryId'),
    route.paramMap.get('trainerId'),
    route.paramMap.get('workoutId'),
  );
  return workout ?? new RedirectCommand(inject(Router).parseUrl('/'));
};
