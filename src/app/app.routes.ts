import { Routes } from '@angular/router';
import { categoryResolver } from './shared/resolvers/category.resolver';
import { trainerResolver } from './shared/resolvers/trainer.resolver';
import { workoutResolver } from './shared/resolvers/workout.resolver';
import { ScreenMode } from './shared/constants/screen-mode.constants';
import { ScreenModeRouteData } from './shared/types/screen-mode.types';

/*
 * Resolvers turn the ids in the URL into the matching category / trainer / workout and pass them to
 * the component as inputs. An unknown id redirects Home (FR-7).
 * `data.screenMode` tells the auto-return service which timer rules apply on each screen.
 *
 * The routes are flat on purpose (not nested category → trainer → workout). With three levels and
 * a small in-memory list, repeating the parent lookups costs nothing, and explicit back links
 * (`['/', category.id]`) are clearer than relative `['..']` links from nested empty-path routes.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    data: { screenMode: ScreenMode.HOME } satisfies ScreenModeRouteData,
    loadComponent: () =>
      import('./features/category-list/category-list.component').then(
        (m) => m.CategoryListComponent,
      ),
  },
  {
    path: ':categoryId',
    data: { screenMode: ScreenMode.BROWSING } satisfies ScreenModeRouteData,
    resolve: { category: categoryResolver },
    loadComponent: () =>
      import('./features/trainer-list/trainer-list.component').then((m) => m.TrainerListComponent),
  },
  {
    path: ':categoryId/:trainerId',
    data: { screenMode: ScreenMode.BROWSING } satisfies ScreenModeRouteData,
    resolve: { category: categoryResolver, trainer: trainerResolver },
    loadComponent: () =>
      import('./features/workout-list/workout-list.component').then((m) => m.WorkoutListComponent),
  },
  {
    path: ':categoryId/:trainerId/:workoutId',
    data: { screenMode: ScreenMode.PLAYER } satisfies ScreenModeRouteData,
    resolve: { category: categoryResolver, trainer: trainerResolver, workout: workoutResolver },
    loadComponent: () =>
      import('./features/workout/workout.component').then((m) => m.WorkoutComponent),
  },
  { path: '**', redirectTo: '' },
];
