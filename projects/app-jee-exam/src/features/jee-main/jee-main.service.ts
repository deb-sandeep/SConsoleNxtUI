import { inject, Injectable, signal } from '@angular/core';

import { ExamConfig, ExamQuestionSubmitStatus, LapName } from "@jee-common/util/exam-data-types" ;
import { ExamApiService } from "../../services/exam-api.service";
import { ExamQuestion, ExamSection } from "../../common/so-wrappers";
import { EventLogService } from "../../services/event-log.service";

@Injectable()
export class JeeMainService {

  readonly LAP_TRANSITIONS: Record<LapName, LapName|null> = {
    "L1"   : "L2P",
    "L2P"  : "L2",
    "L2"   : "AMR",
    "AMR"  : "L3P",
    "L3P"  : "L3.1",
    "L3.1" : "L3.2",
    "L3.2" : null,
  } ;

  readonly LAP_CLASSES: Record<LapName, string> = {
    "L1"   : "q-not-visited",
    "L2P"  : "q-marked-for-review",
    "L2"   : "q-marked-for-review",
    "AMR"  : "q-ans-marked-for-review",
    "L3P"  : "q-not-answered",
    "L3.1" : "q-marked-for-review",
    "L3.2" : "q-not-answered",
  }

  private apiSvc = inject( ExamApiService ) ;
  private eventLogService = inject( EventLogService ) ;

  examConfig: ExamConfig ;

  sections: ExamSection[] = [] ;
  questions: ExamQuestion[] = [] ;

  examAttemptId: number = 0 ;

  timeLeftInSeconds = signal<number>( 0 ) ;

  activeQuestion: ExamQuestion ;
  currentLap: LapName = "L1" ;

  async loadExamConfig( examId: number ) {

    this.examConfig = await this.apiSvc.getExamDetails( examId ) ;

    console.log( 'Fetched exam configuration' ) ;
    console.log( this.examConfig ) ;

    this.timeLeftInSeconds.set( this.examConfig.duration ) ;

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

  public getNumQuestions( state: ExamQuestionSubmitStatus ) {
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

          console.log( res ) ;

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
          this.countdown() ;

          return ;
      }) ;
  }

  countdown() {
    if( this.timeLeftInSeconds() > 0 ) {
      setTimeout( () => {
        this.timeLeftInSeconds.set( this.timeLeftInSeconds()-1 ) ;
        this.activeQuestion.timeSpentInCurrentLap++ ;
        this.countdown() ;
      }, 1000 ) ;
    }
    else {
      this.submitExam() ;
    }
  }

  getNextLapName(): LapName|null {
    return this.LAP_TRANSITIONS[this.currentLap] ;
  }

  saveLapSnapshot() {

    let snapshots : {
      examQuestionId: number,
      timeSpentInCurrentLap: number,
      attemptState: string
    }[] = [] ;

    for( let question of this.questions ) {
      snapshots.push({
        examQuestionId : question.questionConfig.id,
        timeSpentInCurrentLap : question.timeSpentInCurrentLap,
        attemptState : question.state
      }) ;
      question.timeSpentInCurrentLap = 0 ;
    }

    this.apiSvc.saveLapSnapshot( this.examAttemptId, this.currentLap, snapshots )
        .then( ()=> console.log( 'Snapshots inserted' ) ) ;

    const nextLapName = this.getNextLapName() ;
    this.eventLogService.logLapChange( this.currentLap, nextLapName ) ;
    if( nextLapName != null ) {
      this.currentLap = nextLapName ;
    }
  }

  submitExam() {
    this.timeLeftInSeconds.set( 0 ) ;
  }
}