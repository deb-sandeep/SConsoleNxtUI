import { Component, inject } from '@angular/core';
import { ExamSetupService } from "../exam-setup.service";
import { NgForOf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

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

  router = inject( Router ) ;
  svc = inject( ExamSetupService ) ;

  examTypeOptions = [
    { label: 'JEE Main', value: 'MAIN' },
    { label: 'JEE Advanced', value: 'ADV' }
  ] ;

  ngOnInit() {
    this.svc.resetSectionConfig() ;
  }

  showNextDialog() {
    this.svc.incrementCurrentWizardStep() ;
    this.router.navigateByUrl( "/exam-config/exam-setup/sel-exam-subjects" ).then() ;
  }
}
