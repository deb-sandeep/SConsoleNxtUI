import { Component } from '@angular/core' ;
import { FormsModule } from '@angular/forms' ;
import { Output, EventEmitter } from '@angular/core' ;
import { ViewChild, ElementRef } from '@angular/core' ;
import { Question } from '../../question'
import { QuestionGenerator } from "./question-generator";

@Component({
  selector: 'test-play',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './test-play.component.html',
  styleUrl: './test-play.component.css'
})
export class TestPlayComponent {

  private qGen:QuestionGenerator ;

  @ViewChild( 'answerTextField' )
  private answerTextField:ElementRef<HTMLInputElement> ;

  @Output()
  private endTestEvent = new EventEmitter<Question[]>() ;

  private answeredQuestions:Question[] = [] ;
  private curQDisplayStartTime:number = 0 ;

  timeLeft:number = 0 ;
  numCorrect:number = 0 ;
  currentQuestion:Question|undefined ;
  typedAnswer:number|undefined ;

  startGame( cfg : any ) {
    this.answeredQuestions.length = 0 ;
    this.timeLeft = cfg.duration ;
    this.numCorrect = 0 ;
    this.qGen = new QuestionGenerator( cfg ) ;
    this.currentQuestion = this.qGen.getNextQuestion() ;
    this.curQDisplayStartTime = Date.now() ;
    setTimeout( ()=>{ this.decrementTimeLeft() ; }, 1000 ) ;
  }

  answerTyped( enteredNumber:any ) {

    this.typedAnswer = enteredNumber ;
    if( this.typedAnswer === this.currentQuestion?.getAnswer() ) {
      this.numCorrect++ ;
      this.typedAnswer = undefined ;
      this.answerTextField.nativeElement.value = '' ;

      if( this.currentQuestion !== undefined ) {
        this.currentQuestion.timeTakenMillis = Date.now() - this.curQDisplayStartTime ;
        this.answeredQuestions.push( this.currentQuestion ) ;
      }

      this.currentQuestion = this.qGen.getNextQuestion() ;
    }
  }

  private decrementTimeLeft() {
    this.timeLeft-- ;
    if( this.timeLeft > 0 && this.currentQuestion !== undefined ) {
      setTimeout( ()=>{
        this.decrementTimeLeft()
      }, 1000 ) ;
    }
    else {
      this.endTestEvent.emit( this.answeredQuestions ) ;
    }
  }
}
