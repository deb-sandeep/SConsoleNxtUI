import { Component, inject } from '@angular/core';
import { ExamSetupService } from "../exam-setup.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ExamSectionTemplate } from "../exam-section.config";
import { NgIf } from "@angular/common";
import { ExamSectionConfig } from "../../../../../type";

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

  svc = inject( ExamSetupService ) ;
  router = inject( Router ) ;

  templateMap : Record<string, ExamSectionTemplate> = {} ;
  sections : ExamSectionConfig[] = [] ;

  constructor( private route: ActivatedRoute ) {}

  ngOnInit(): void {
    for( let template of this.svc.setupConfig.selectedSectionTemplates ) {
      this.templateMap[ template.problemType ] = template ;
      this.sections.push( {
        id: -1,
        examId: -1,
        examSequence: 0,
        syllabusName: "",
        problemType: template.problemType,
        title: template.title,
        correctMarks: template.correctMarks,
        wrongPenalty: template.wrongPenalty,
        numQuestions: template.numQuestions,
        numCompulsoryQuestions: template.numCompulsoryQuestions,
        instructions: template.instructions,
        questions: []
      } ) ;
    }
  }

  protected showNextDialog() {
    let sequence = 1 ;
    for( let subject of this.svc.setupConfig.selectedSubjects ) {
      for( let section of this.sections ) {
        let s = { ...section } ;
        s.syllabusName = subject ;
        s.examSequence = sequence++ ;
        this.svc.setupConfig.examSections.push( s ) ;
      }
    }
    this.svc.incrementCurrentWizardStep() ;
    this.router.navigate(['../select-topics', 0], {relativeTo: this.route}).then() ;
  }

  protected isConfigurationInvalid() {
    return false ;
  }

  protected numQuestionChanged( section: ExamSectionConfig ) {
    if( this.templateMap[ section.problemType ].allQuestionsCompulsory ) {
      section.numCompulsoryQuestions = section.numQuestions ;
    }
  }

  protected getTotalQuestions() {
    let total = 0;
    for( let section of this.sections ) {
      total += section.numCompulsoryQuestions ;
    }
    return total * this.svc.setupConfig.selectedSubjects.length ;
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
