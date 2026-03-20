import { inject, Injectable } from '@angular/core';

import { ExamConfig } from "@jee-common/util/exam-data-types" ;
import { ExamApiService } from "../../services/exam-api.service";
import { ExamQuestion, ExamSection } from "../../common/so-wrappers";
import { EventLogService } from "../../services/event-log.service";

@Injectable()
export class JeeMainService {

  private apiSvc = inject( ExamApiService ) ;
  private eventLogService = inject( EventLogService ) ;

  examConfig: ExamConfig ;

  sections: ExamSection[] = [] ;
  questions: ExamQuestion[] = [] ;

  examAttemptId: number = 0 ;

  activeQuestion: ExamQuestion ;
  timeLeftInSeconds: number = 0 ;

  async loadExamConfig( examId: number ) {

    this.examConfig = await this.apiSvc.getExamDetails( examId ) ;

    console.log( 'Fetched exam configuration' ) ;
    console.log( this.examConfig ) ;

    this.timeLeftInSeconds = this.examConfig.duration ;

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
  }

  private convertSyllabusNameToSectionName( syllabusName : string ) {
    switch( syllabusName ) {
      case "IIT Physics" : return "PHYSICS" ;
      case "IIT Chemistry" : return "CHEMISTRY" ;
      case "IIT Maths" : return "MATHEMATICS" ;
    }
    return syllabusName ;
  }

  public activateQuestion( examQuestion: ExamQuestion ) {
    if( this.activeQuestion != null ) {
      this.activeQuestion.deactivate() ;
    }
    this.activeQuestion = examQuestion ;
    this.activeQuestion.activate() ;
    this.eventLogService.logQuestionActivation( this.activeQuestion ) ;
  }

  public getNumQuestions( state: string) {
    let numQuestions = 0 ;
    for( let question of this.questions ) {
      if( question.state === state ) {
        numQuestions++ ;
      }
    }
    return numQuestions ;
  }

  public async createExamAttempt() {
    await this.apiSvc.createExamAttempt( this.examConfig )
        .then( res => {

          for( let question of this.questions ) {
            let questionId = question.questionConfig.id ;
            question.examQuestionAttemptId = res.questionAttemptIds[ questionId ] ;
          }

          this.examAttemptId = res.examAttemptId ;
          this.eventLogService.examAttemptId = res.examAttemptId ;
          this.eventLogService.startTime = new Date() ;
          this.eventLogService.logExamStartEvent() ;

          // Set the first question as active question
          this.activateQuestion( this.questions[0] ) ;

          return ;
      }) ;
  }

  countdown() {
    setTimeout( () => {
      this.timeLeftInSeconds-- ;
      if( this.timeLeftInSeconds > 0 ) {
        this.countdown() ;
      }
      else {
      }
    }, 1000 ) ;
  }
}