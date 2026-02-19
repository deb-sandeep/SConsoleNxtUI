import { Component, inject } from '@angular/core';
import { ExamSetupService } from "../exam-setup.service";
import { ExamSectionTemplate, mainSectionTemplates, advancedSectionTemplates } from "../exam-section.config";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'select-exam-sections',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './select-exam-sections.component.html',
  styleUrl: './select-exam-sections.component.css'
})
export class SelectExamSectionsComponent {

  examSetupSvc = inject( ExamSetupService ) ;
  router = inject( Router ) ;

  relevantSectionTemplates : ExamSectionTemplate[] = [] ;
  sectionSelections : Record<string, boolean> = {} ;

  ngOnInit(): void {
    if( this.examSetupSvc.examSetupConfig.examType === 'MAIN' ) {
      this.relevantSectionTemplates = mainSectionTemplates ;
    }
    else {
      this.relevantSectionTemplates = advancedSectionTemplates ;
    }

    for( let template of this.relevantSectionTemplates ) {
      this.sectionSelections[ template.problemType ] = template.defaultSelection ;
    }
  }

  anySectionsSelected() {
    for( let key of Object.keys( this.sectionSelections ) ) {
      if( this.sectionSelections[key] ) {
        return true ;
      }
    }
    return false ;
  }

  showNextDialog() {
    for( let key of Object.keys( this.sectionSelections ) ) {
      if( this.sectionSelections[key] ) {
        for( let template of this.relevantSectionTemplates ) {
          if( template.problemType  === key ) {
            this.examSetupSvc.examSetupConfig.selectedSectionTemplates.push( template ) ;
          }
        }
      }
    }
    this.router.navigateByUrl( "/exam-config/exam-setup/conf-exam-sections" ).then() ;
  }
}
