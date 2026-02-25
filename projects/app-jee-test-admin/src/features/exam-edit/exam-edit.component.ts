import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { PageToolbarComponent, ToolbarActionComponent } from "lib-core";
import { ExamEditService } from "./exam-edit.service";
import { ExamConfig, ExamSectionConfig } from "../../type";
import { TopicSO } from "@jee-common/util/master-data-types";
import { TopicBrowserComponent } from "./components/topic-browser/topic-browser.component";

@Component({
  selector: 'exam-edit',
  imports: [
    PageToolbarComponent,
    ToolbarActionComponent,
    TopicBrowserComponent
  ],
  templateUrl: './exam-edit.component.html',
  styleUrl: './exam-edit.component.css'
})
export class ExamEditComponent {

  router = inject( Router ) ;
  editSvc = inject( ExamEditService ) ;

  examId : number = 0 ;
  examCfg : ExamConfig|null = null ;
  topicMap : Record<string, TopicSO[]> = {} ;
  sectionMap : Record<string, ExamSectionConfig[]> = {};

  constructor( private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.paramMap.subscribe( pm => {
      this.examId = Number( pm.get( 'examId' ) ) ;
      if( !isNaN( this.examId ) ){
        console.log( 'Exam ID = ' + this.examId ) ;
        this.editSvc.fetchExamDetails( this.examId ).then( exam => {
          this.examCfg = exam ;
          this.topicMap = exam.topics ;

          exam.sections.forEach( section => {
            if( !this.sectionMap[section.syllabusName] ) {
              this.sectionMap[section.syllabusName] = [];
            }
            this.sectionMap[section.syllabusName].push( section );
          } ) ;
          console.log( this.sectionMap ) ;
          console.log( this.examCfg ) ;
        }) ;
      }
    })
  }

  protected isExamConfigValid() {
    return false;
  }

  protected saveExam() {
  }

  protected cancelEdit() {
  }

  protected topicChanged( topic: TopicSO | null ) {
    console.log( topic ) ;
  }
}