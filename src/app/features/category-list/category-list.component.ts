import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageShellComponent } from '../../shared/page-shell/page-shell.component';
import { WorkoutLibraryService } from '../../shared/services/workout-library.service';

@Component({
  selector: 'app-category-list',
  imports: [PageShellComponent, RouterLink],
  template: `
    <app-page-shell heading="Virtualus treneris">
      <nav>
        @for (category of categories; track category.id) {
          <button type="button" class="category-button glass" [routerLink]="['/', category.id]">
            {{ category.title }}
          </button>
        }
      </nav>
    </app-page-shell>
  `,
  styles: `
    nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(36 * var(--u));
      padding: calc(20 * var(--u)) 0 calc(40 * var(--u));
    }
    .category-button {
      width: calc(500 * var(--u));
      height: calc(144 * var(--u));
      border-radius: calc(20 * var(--u));
      font-weight: 300;
      font-size: calc(35 * var(--u));
      text-transform: uppercase;
    }
  `,
})
export class CategoryListComponent {
  protected readonly categories = inject(WorkoutLibraryService).categories;
}
