import { Component, inject } from '@angular/core';
import { ExamSection, ExamSetupService } from "../exam-setup.service";
import { Router } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ExamSectionTemplate } from "../exam-section.config";
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-configure-exam-sections',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgIf
  ],
  templateUrl: './configure-exam-sections.component.html',
  styleUrl: './configure-exam-sections.component.css'
})
export class ConfigureExamSectionsComponent {

  examSetupSvc = inject( ExamSetupService ) ;
  router = inject( Router ) ;

  templateMap : Record<string, ExamSectionTemplate> = {} ;
  sections : ExamSection[] = [] ;

  ngOnInit(): void {
    for( let template of this.examSetupSvc.examSetupConfig.selectedSectionTemplates ) {
      this.templateMap[ template.problemType ] = template ;
      this.sections.push( {
        problemType: template.problemType,
        title: template.title,
        correctMarks: template.correctMarks,
        wrongPenalty: template.wrongPenalty,
        numQuestions: template.numQuestions,
        numCompulsoryQuestions: template.numCompulsoryQuestions,
        instructions: template.instructions
      } ) ;
    }
  }

  protected showNextDialog() {
  }

  protected isConfigurationInvalid() {
    return false ;
  }

  protected numQuestionChanged( section: ExamSection ) {
    if( this.templateMap[ section.problemType ].allQuestionsCompulsory ) {
      section.numCompulsoryQuestions = section.numQuestions ;
    }
  }

  protected getTotalQuestions() {
    let total = 0;
    for( let section of this.sections ) {
      total += section.numCompulsoryQuestions ;
    }
    return total;
  }

  protected moveRowUp( index: number ) {
    if( index < 0 ) return ;
    let targetSection = this.sections[ index-1 ] ;
    this.sections[index-1] = this.sections[ index ];
    this.sections[ index ] = targetSection;
  }

  protected moveRowDown( index: number ) {
    if( index > this.sections.length-1 ) return ;
    let targetSection = this.sections[ index+1 ] ;
    this.sections[index+1] = this.sections[ index ];
    this.sections[ index ] = targetSection;
  }
}
