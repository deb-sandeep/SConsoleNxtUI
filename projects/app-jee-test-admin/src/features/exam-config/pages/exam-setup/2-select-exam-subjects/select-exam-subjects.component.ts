import { Component, inject } from '@angular/core';
import { Router } from "@angular/router";
import { ExamSetupService } from "../exam-setup.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-configure-subjects',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './select-exam-subjects.component.html',
  styleUrl: './select-exam-subjects.component.css'
})
export class SelectExamSubjectsComponent {

  router = inject( Router ) ;
  svc = inject( ExamSetupService ) ;

  syllabusOptions = [
    { label: 'Physics',     value: 'IIT Physics' },
    { label: 'Chemistry',   value: 'IIT Chemistry' },
    { label: 'Mathematics', value: 'IIT Maths' }
  ] ;

  selectedSubjects : Record<string, boolean> = {};

  ngOnInit(): void {
    for( let syllabus of this.syllabusOptions ) {
      this.selectedSubjects[ syllabus.value ] = true ;
    }
  }

  anySyllabusSelected() {
    for( let key of Object.keys( this.selectedSubjects ) ) {
      if( this.selectedSubjects[key] ) {
        return true ;
      }
    }
    return false ;
  }

  showNextDialog() {
    for( let key of Object.keys( this.selectedSubjects ) ) {
      if( this.selectedSubjects[key] ) {
        this.svc.setupConfig.selectedSubjects.push( key ) ;
      }
    }
    this.svc.incrementCurrentWizardStep() ;
    this.svc.recomputeTotalWizardSteps() ;
    this.router.navigateByUrl( "/exam-config/exam-setup/sel-exam-sections" ).then() ;
  }
}
