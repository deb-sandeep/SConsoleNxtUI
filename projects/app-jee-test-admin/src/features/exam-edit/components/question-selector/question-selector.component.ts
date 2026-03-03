import { Component, inject, input, output } from '@angular/core';
import { ExamSectionConfig, QuestionSO } from "../../../../type";
import { ExamEditService } from "../../exam-edit.service";

@Component({
  selector: 'div[questionSelector]',
  imports: [],
  templateUrl: './question-selector.component.html',
  styleUrl: './question-selector.component.css'
})
export class QuestionSelectorComponent {

  editSvc = inject( ExamEditService ) ;

  sectionCfg = input<ExamSectionConfig>() ;

  showQuestion = output<QuestionSO>() ;
  hideQuestion = output<void>() ;
  
  protected selectQuestion( index: number ) {
    let availableQuestions: QuestionSO[] ;
    let selectedQuestion: QuestionSO;
    let problemType = this.sectionCfg()!.problemType ;

    availableQuestions = this.editSvc.selTopicQuestions[ problemType ] ;
    selectedQuestion = availableQuestions[ index ] ;

    this.sectionCfg()?.questions.push( {
      id: -1,
      sequence: -1,
      questionId: selectedQuestion.id,
      sectionId: this.sectionCfg()!.id,
      question: selectedQuestion
    }) ;
  }

  protected showQuestionInView( q: QuestionSO ) {
    this.showQuestion.emit( q ) ;
  }

  protected removeQuestionFromView( q: QuestionSO ) {
    this.hideQuestion.emit() ;
  }

  protected questionAssigned( q: QuestionSO ) {
    for( let question of this.sectionCfg()!.questions ) {
      if( question.question.id == q.id ) {
        return true ;
      }
    }
    return false ;
  }
}
