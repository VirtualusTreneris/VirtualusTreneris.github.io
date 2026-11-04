import { TestBed } from '@angular/core/testing';
import { WorkoutLibraryService } from './workout-library.service';

describe('workouts.json (C-1: editable content stays valid)', () => {
  // The file is edited by hand to add or remove videos, so these tests check that it's valid,
  // not what's in it. Adding, removing or reordering videos must never break them.
  const categories = () => TestBed.inject(WorkoutLibraryService).categories;
  const trainers = () => categories().flatMap((category) => category.trainers);
  const workouts = () => trainers().flatMap((trainer) => trainer.workouts);
  const hasUniqueIds = (items: readonly { id: string }[]) =>
    new Set(items.map((item) => item.id)).size === items.length;
  // Ids appear in the URL: lowercase letters, digits and "-".
  const urlSafeId = /^[a-z0-9-]+$/;

  it('has at least one category, every category has trainers, every trainer has workouts', () => {
    expect(categories().length).toBeGreaterThan(0);
    for (const category of categories()) {
      expect(category.trainers.length, category.id).toBeGreaterThan(0);
    }
    for (const trainer of trainers()) {
      expect(trainer.workouts.length, trainer.id).toBeGreaterThan(0);
    }
  });

  it('uses URL-safe ids, unique within their parent', () => {
    expect(hasUniqueIds(categories())).toBe(true);
    for (const category of categories()) {
      expect(hasUniqueIds(category.trainers), category.id).toBe(true);
      for (const trainer of category.trainers) {
        expect(hasUniqueIds(trainer.workouts), `${category.id}/${trainer.id}`).toBe(true);
      }
    }
    for (const item of [...categories(), ...trainers(), ...workouts()]) {
      expect(item.id).toMatch(urlSafeId);
    }
  });

  it('has no empty texts', () => {
    for (const category of categories()) {
      expect(category.title.trim(), category.id).not.toBe('');
      expect(category.shortTitle.trim(), category.id).not.toBe('');
    }
    for (const trainer of trainers()) {
      expect(trainer.name.trim(), trainer.id).not.toBe('');
      expect(trainer.nameInstrumental.trim(), trainer.id).not.toBe('');
    }
    for (const workout of workouts()) {
      expect(workout.title.trim(), workout.id).not.toBe('');
    }
  });

  it('has a positive whole-minute duration and a valid YouTube video id for every workout', () => {
    for (const workout of workouts()) {
      expect(
        Number.isInteger(workout.durationMinutes) && workout.durationMinutes > 0,
        workout.id,
      ).toBe(true);
      // YouTube video ids are 11 characters: letters, digits, "-" and "_".
      expect(workout.youtubeVideoId, workout.id).toMatch(/^[A-Za-z0-9_-]{11}$/);
    }
  });
});
