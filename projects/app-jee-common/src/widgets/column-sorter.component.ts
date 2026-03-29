import { Component, input } from '@angular/core';
import { NgClass, NgIf } from "@angular/common";

@Component({
  selector: 'col-sorter',
  imports: [
    NgIf,
    NgClass
  ],
  template: `
    <div class="column-sorter">
      <span *ngIf="sortDir() != 0" 
            [ngClass]="getIconClass()"></span>
    </div>
  `,
  styles: [`
    .column-sorter {
      float: right;
    }
  `]
})
export class ColumnSorterComponent {

  // 0 - No sort, 1 - Ascending, 2 - Descending
  sortDir = input<number>(0) ;

  getIconClass() {
    return this.sortDir() == 1 ? "bi-caret-up-fill" : "bi-caret-down-fill" ;
  }
}
