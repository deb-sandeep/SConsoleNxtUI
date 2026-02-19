import { Component, inject } from '@angular/core';
import { ExamSetupService } from "../exam-setup.service";

@Component({
  selector: 'select-exam-sections',
  imports: [],
  templateUrl: './select-exam-sections.component.html',
  styleUrl: './select-exam-sections.component.css'
})
export class SelectExamSectionsComponent {

  examSetupSvc = inject( ExamSetupService ) ;

  examSectionsOptions = [
    { label: 'JEE Main', value: 'MAIN' },
    { label: 'JEE Advanced', value: 'ADV' }
  ] ;
}
