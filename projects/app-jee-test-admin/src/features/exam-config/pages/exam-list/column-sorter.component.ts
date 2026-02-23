import { Component, inject, input, OnInit } from '@angular/core';
import { PageToolbarComponent, ToolbarActionComponent } from "lib-core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ExamSetupService } from "../exam-setup/exam-setup.service";
import { ExamConfig } from "../../../../type";
import { DatePipe, NgClass, NgIf } from "@angular/common";

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
