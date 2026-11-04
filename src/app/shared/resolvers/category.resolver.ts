import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { WorkoutLibraryService } from '../services/workout-library.service';
import { Category } from '../types/workout-library.types';

/** Resolves `:categoryId` to its category, or redirects Home if it doesn't exist. */
export const categoryResolver: ResolveFn<Category> = (route) => {
  const category = inject(WorkoutLibraryService).findCategory(route.paramMap.get('categoryId'));
  return category ?? new RedirectCommand(inject(Router).parseUrl('/'));
};
