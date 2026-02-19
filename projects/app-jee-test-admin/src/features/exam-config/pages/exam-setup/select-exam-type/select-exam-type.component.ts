import { Component, inject } from '@angular/core';
import { ExamSetupService } from "../exam-setup.service";
import { NgForOf } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'select-exam-type',
  imports: [
    NgForOf,
    FormsModule
  ],
  templateUrl: './select-exam-type.component.html',
  styleUrl: './select-exam-type.component.css'
})
export class SelectExamTypeComponent {

  examSetupSvc = inject( ExamSetupService ) ;

  examTypeOptions = [
    { label: 'JEE Main', value: 'MAIN' },
    { label: 'JEE Advanced', value: 'ADV' }
  ] ;

  showNextDialog() {
    // TODO: Navigate
  }
}
