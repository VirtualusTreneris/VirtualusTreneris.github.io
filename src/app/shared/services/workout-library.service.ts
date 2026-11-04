import { Service } from '@angular/core';
import workoutsJson from '../data/workouts.json';
import { Category, Trainer, Workout } from '../types/workout-library.types';

/**
 * All categories, trainers and workouts, in display order, with lookups by id.
 * Edit `workouts.json` to add or remove videos.
 */
@Service()
export class WorkoutLibraryService {
  readonly categories: readonly Category[] = workoutsJson.categories;

  findCategory(categoryId: string | null): Category | undefined {
    return this.categories.find((category) => category.id === categoryId);
  }

  findTrainer(categoryId: string | null, trainerId: string | null): Trainer | undefined {
    return this.findCategory(categoryId)?.trainers.find((trainer) => trainer.id === trainerId);
  }

  findWorkout(
    categoryId: string | null,
    trainerId: string | null,
    workoutId: string | null,
  ): Workout | undefined {
    return this.findTrainer(categoryId, trainerId)?.workouts.find(
      (workout) => workout.id === workoutId,
    );
  }
}
