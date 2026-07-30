import { Injectable } from '@angular/core';
import { JeeBaseService } from "@jee-common/services/jee-base.service";
import { ExamQuestion, ExamSection } from "../../common/so-wrappers";

@Injectable()
export class JeeAdvancedService extends JeeBaseService {

  async loadExamConfig( examId: number ) {

    this.examConfig = await this.apiSvc.getExamDetails( examId ) ;
    this.timeLeftInSeconds.set( this.examConfig.duration ) ;

    const sectionSeqBySyllabus = new Map<string, number>() ;
    let lastQuestion: ExamQuestion | null = null ;

    for( let section of this.examConfig.sections ) {

      // Unlike JEE Main, every section stays distinct - none are clubbed together.
      const seq = ( sectionSeqBySyllabus.get( section.syllabusName ) ?? 0 ) + 1 ;
      sectionSeqBySyllabus.set( section.syllabusName, seq ) ;

      const examSection = new ExamSection(
        `${this.convertSyllabusNameToShortName( section.syllabusName )} Sec ${seq}`,
        section.syllabusName ) ;

      this.sections.push( examSection ) ;

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
        examSection.questions.push( examQuestion ) ;
        lastQuestion = examQuestion ;

        // Track the first question of the section to enable jumps
        if( examSection.firstQuestion == null ) {
          examSection.firstQuestion = examQuestion ;
        }
      }
    }

    // Activate the first question so the initial state matches what a
    // section-tab click produces (NOT_VISITED -> NOT_ANSWERED) and
    // activeSection gets derived. When createExamAttempt() is wired in,
    // its own activateQuestion( questions[0] ) will simply early-return.
    this.activateQuestion( this.questions[0] ) ;
  }

  // activeSection is not set here directly - activateQuestion() derives
  // it from the question being activated, keeping tab clicks consistent
  // with every other navigation source.
  activateSection( section: ExamSection ) {
    this.activateQuestion( section.firstQuestion ) ;
  }

  private convertSyllabusNameToShortName( syllabusName : string ) {
    switch( syllabusName ) {
      case "IIT Physics" : return "Phy" ;
      case "IIT Chemistry" : return "Chem" ;
      case "IIT Maths" : return "Math" ;
    }
    return syllabusName ;
  }

  getPaperTitle(): string {
    if( !this.examConfig ) {
      return 'JEE Advanced' ;
    }
    const paperText = this.getPaperText( this.examConfig.note ) ;
    return `JEE Advanced ${this.getExamYear()}${ paperText ? ' ' + paperText : '' }` ;
  }

  private getExamYear(): number {
    return new Date() < new Date( 2027, 4, 1 ) ? 2027 : 2028 ;
  }

  private getPaperText( note: string ): string {
    const match = note?.match( /Paper [\d]/ ) ;
    return match ? match[0] : '' ;
  }
}
