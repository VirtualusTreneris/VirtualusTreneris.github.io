import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { WorkoutLibraryService } from '../services/workout-library.service';
import { Trainer } from '../types/workout-library.types';

/** Resolves `:categoryId/:trainerId` to its trainer, or redirects Home if it doesn't exist. */
export const trainerResolver: ResolveFn<Trainer> = (route) => {
  const trainer = inject(WorkoutLibraryService).findTrainer(
    route.paramMap.get('categoryId'),
    route.paramMap.get('trainerId'),
  );
  return trainer ?? new RedirectCommand(inject(Router).parseUrl('/'));
};
