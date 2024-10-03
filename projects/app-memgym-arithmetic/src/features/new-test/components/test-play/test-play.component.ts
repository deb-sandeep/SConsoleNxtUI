import { Component } from '@angular/core' ;
import { FormsModule } from '@angular/forms' ;
import { CommonModule } from '@angular/common' ;
import { Output, EventEmitter } from '@angular/core' ;
import { ViewChild, ElementRef } from '@angular/core' ;
import { Question } from '../../question'
import { QuestionGenerator } from "./question-generator";
import { GameConfig } from "../../new-test.config";

@Component({
  selector: 'test-play',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
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
  private virtKeyStates = new Map<string,string>() ;
  private virtualInputSeq:string = "" ;

  gameCfg:GameConfig ;
  timeLeft:number = 0 ;
  numCorrect:number = 0 ;
  currentQuestion:Question|undefined ;
  typedAnswer:number|undefined ;
  useVirtualNumpad:boolean = false ;

  startGame( cfg : any ) {
    this.gameCfg = cfg ;
    this.useVirtualNumpad = cfg.useVirtualNumpad ;
    console.log( "Using virtual keyboard " + this.useVirtualNumpad ) ;
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
      this.virtualInputSeq = '' ;

      if( this.currentQuestion !== undefined ) {
        this.currentQuestion.timeTakenMillis = Date.now() - this.curQDisplayStartTime ;
        this.answeredQuestions.push( this.currentQuestion ) ;
      }

      this.currentQuestion = this.qGen.getNextQuestion() ;
      this.curQDisplayStartTime = Date.now() ;
    }
  }

  vkPressed( key:string ):void {

    this.virtKeyStates.set( key, 'pressed' ) ;
    setTimeout( ()=>{
      this.virtKeyStates.set( key, '' ) ;
    },75 ) ;

    let changed = false ;
    if( key === '<' ) {
      if ( this.virtualInputSeq.length > 0 ) {
        this.virtualInputSeq = this.virtualInputSeq.substring( 0, this.virtualInputSeq.length-1 ) ;
        changed = true ;
      }
    }
    else if( key === '-' && this.virtualInputSeq.length === 0 ) {
      this.virtualInputSeq = this.virtualInputSeq.concat( key ) ;
      changed = true ;
    }
    else {
      this.virtualInputSeq = this.virtualInputSeq.concat( key ) ;
      changed = true ;
    }

    if( changed ) {
      this.answerTextField.nativeElement.value = this.virtualInputSeq ;
      if( this.virtualInputSeq.length > 0 ) {
        const num = parseInt( this.virtualInputSeq ) ;
        this.answerTyped( num ) ;
      }
    }
  }

  getVKClass( key:string ):string {
    let state=this.virtKeyStates.get( key ) ;
    return state??'' ;
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
