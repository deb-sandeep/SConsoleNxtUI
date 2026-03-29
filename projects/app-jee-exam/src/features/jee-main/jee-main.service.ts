import { Injectable } from '@angular/core';
import { ExamQuestion, ExamSection } from "../../common/so-wrappers";
import { JeeBaseService } from "@jee-common/services/jee-base.service";
import { ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";

@Injectable()
export class JeeMainService extends JeeBaseService {

  async loadExamConfig( examId: number ) {

    this.examConfig = await this.apiSvc.getExamDetails( examId ) ;
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

        examQuestion.answer = question.question.answer ;

        this.questions.push( examQuestion ) ;
        lastQuestion = examQuestion ;

        // Track the first question of the section to enable jumps
        if( currentSection.firstQuestion == null ) {
          currentSection.firstQuestion = examQuestion ;
        }
      }
    }

    this.loadRootCauses() ;

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
