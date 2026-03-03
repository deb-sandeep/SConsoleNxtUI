import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { PageToolbarComponent, ToolbarActionComponent } from "lib-core";
import { ExamEditService } from "./exam-edit.service";
import { TopicSO } from "@jee-common/util/master-data-types";
import { TopicBrowserComponent } from "./components/topic-browser/topic-browser.component";
import { QuestionSelectorComponent } from "./components/question-selector/question-selector.component";
import { ExamSectionConfig, QuestionSO } from "../../type";
import { QuestionDisplayComponent } from "./components/question-display/question-display.component";

@Component({
  selector: 'exam-edit',
  imports: [
    PageToolbarComponent,
    ToolbarActionComponent,
    TopicBrowserComponent,
    QuestionSelectorComponent,
    QuestionDisplayComponent
  ],
  templateUrl: './exam-edit.component.html',
  styleUrl: './exam-edit.component.css'
})
export class ExamEditComponent {

  router = inject( Router ) ;
  editSvc = inject( ExamEditService ) ;

  examId : number = 0 ;
  topicMap : Record<string, TopicSO[]> = {} ;
  selectedTopic : TopicSO|null = null ;
  activeSyllabus : string|null = null ;
  problemTypeSectionMap : Record<string, ExamSectionConfig> = {} ;

  questionToShow : QuestionSO|null = null ;

  constructor( private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.paramMap.subscribe( pm => {
      this.examId = Number( pm.get( 'examId' ) ) ;
      if( !isNaN( this.examId ) ){
        this.editSvc.fetchExamDetails( this.examId ).then( exam => {
          this.topicMap = this.editSvc.topicMap ;
        }) ;
      }
    })
  }

  getQuestionSelectorWidth() {
    const n = this.editSvc.problemTypes.length;
    if( n < 3 ) {
      return '500px' ;
    }
    else {
      const gap = 5; // px gap between items
      return `calc( ( (100% - ${(n) * gap}px) / ${n} ) )`;
    }
  }

  protected isExamConfigValid() {
    return false;
  }

  protected saveExam() {
  }

  protected cancelEdit() {
  }

  protected topicChanged( topic: TopicSO | null ) {
    this.selectedTopic = topic ;
    this.editSvc.fetchAvailableQuestions( topic ).then() ;
  }

  protected syllabusChanged( $event: string ) {
    this.activeSyllabus = $event ;
    this.problemTypeSectionMap = {} ;
    if( this.editSvc.sectionMap[ this.activeSyllabus ] ) {
      for( let cfg of this.editSvc.sectionMap[ this.activeSyllabus ] ) {
        this.problemTypeSectionMap[ cfg.problemType ] = cfg ;
      }
    }
  }
}