import { Component, computed, input } from '@angular/core';
import { CardGridComponent } from '../../shared/card-grid/card-grid.component';
import { CardComponent } from '../../shared/card/card.component';
import { PageShellComponent } from '../../shared/page-shell/page-shell.component';
import { Category, Trainer, Workout } from '../../shared/types/workout-library.types';

@Component({
  selector: 'app-workout-list',
  imports: [PageShellComponent, CardGridComponent, CardComponent],
  template: `
    <app-page-shell [heading]="heading()" [backLink]="['/', category().id]">
      <app-card-grid>
        @for (workout of trainer().workouts; track workout.id) {
          <app-card
            [link]="['/', category().id, trainer().id, workout.id]"
            [heading]="workout.title"
            [detail]="durationLabel(workout)"
            actionLabel="Pradėti"
          />
        }
      </app-card-grid>
    </app-page-shell>
  `,
})
export class WorkoutListComponent {
  /** From the route resolvers. */
  readonly category = input.required<Category>();
  readonly trainer = input.required<Trainer>();

  /** e.g. "Presas su Greta" */
  protected readonly heading = computed(
    () => `${this.category().shortTitle} su ${this.trainer().nameInstrumental}`,
  );

  /** e.g. "51 min" */
  protected durationLabel(workout: Workout): string {
    return `${workout.durationMinutes} min`;
  }
}
