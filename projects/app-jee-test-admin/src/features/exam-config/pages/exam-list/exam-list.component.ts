import { Component, inject } from '@angular/core';
import { PageToolbarComponent, ToolbarActionComponent } from "lib-core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'exam-list',
  imports: [
    FormsModule,
    PageToolbarComponent,
    ToolbarActionComponent
  ],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css'
})
export class ExamListComponent {

  private router = inject( Router );

  newExamSetup() {
    this.router.navigateByUrl( "/exam-config/exam-setup" ).then() ;
  }
}
