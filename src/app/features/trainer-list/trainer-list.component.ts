import { Component, input } from '@angular/core';
import { CardGridComponent } from '../../shared/card-grid/card-grid.component';
import { CardComponent } from '../../shared/card/card.component';
import { CardActionTextSize } from '../../shared/constants/card-action-text-size.constants';
import { PageShellComponent } from '../../shared/page-shell/page-shell.component';
import { Category } from '../../shared/types/workout-library.types';

@Component({
  selector: 'app-trainer-list',
  imports: [PageShellComponent, CardGridComponent, CardComponent],
  template: `
    <app-page-shell [heading]="category().title" [backLink]="['/']">
      <app-card-grid>
        @for (trainer of category().trainers; track trainer.id) {
          <app-card
            [link]="['/', category().id, trainer.id]"
            [heading]="trainer.name"
            actionLabel="Pasirinkti"
            [actionTextSize]="CardActionTextSize.SMALL"
          />
        }
      </app-card-grid>
    </app-page-shell>
  `,
})
export class TrainerListComponent {
  /** From the route resolver. */
  readonly category = input.required<Category>();

  protected readonly CardActionTextSize = CardActionTextSize;
}
