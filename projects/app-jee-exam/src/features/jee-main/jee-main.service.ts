import { inject, Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { ExamConfig, ExamSectionConfig } from "@jee-common/util/exam-data-types" ;
import { ExamApiService } from "../../services/exam-api.service";
import { ExamQuestion, ExamSection } from "../../common/so-wrappers";

@Injectable()
export class JeeMainService {

  private apiSvc = inject( ExamApiService ) ;

  examConfig: ExamConfig ;

  sections: ExamSection[] = [] ;
  questions: ExamQuestion[] = [] ;

  constructor() {
  }

  async loadExamConfig( examId: number ) {

    this.examConfig = await this.apiSvc.getExamDetails( examId ) ;

    console.log( 'Fetched exam configuration' ) ;
    console.log( this.examConfig ) ;

    let currentSection : ExamSection | null = null ;
    let lastQuestion: ExamQuestion | null = null ;

    for( let section of this.examConfig.sections ) {
      // Club the questions belonging to a subject into one section.
      // For JEE Main, SCA and NVT are clubbed into one section
      if( currentSection === null ||
          currentSection.subjectName !== section.syllabusName ) {

          currentSection = new ExamSection(
            this.convertSyllabusNameToSectionName( section.syllabusName ),
            section.syllabusName ) ;

          this.sections.push( currentSection ) ;
      }

      // Wrap the questions into an object instance (they are types)
      // as of now and thread them into a double-linked list.
      for( let question of section.questions ) {
        let examQuestion = new ExamQuestion(
                                    this.questions.length+1, question ) ;

        examQuestion.prevQuestion = lastQuestion ;
        if( lastQuestion != null ) {
          lastQuestion.nextQuestion = examQuestion ;
        }

        this.questions.push( examQuestion ) ;
        lastQuestion = examQuestion ;

        // Track the first question of the section to enable jumps
        if( currentSection.firstQuestion == null ) {
          currentSection.firstQuestion = examQuestion ;
        }
      }
    }

    // Link the head and tail to make a cyclic list
    this.questions[0].prevQuestion = this.questions[ this.questions.length - 1 ] ;
    this.questions[ this.questions.length - 1 ].nextQuestion = this.questions[0] ;
  }

  private convertSyllabusNameToSectionName( syllabusName : string ) {
    switch( syllabusName ) {
      case "IIT Physics" : return "PHYSICS" ;
      case "IIT Chemistry" : return "CHEMISTRY" ;
      case "IIT Maths" : return "MATHEMATICS" ;
    }
    return syllabusName ;
  }
}