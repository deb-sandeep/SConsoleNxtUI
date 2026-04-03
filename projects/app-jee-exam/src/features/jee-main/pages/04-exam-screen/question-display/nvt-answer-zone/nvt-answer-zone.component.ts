import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExamQuestion } from "../../../../../../common/so-wrappers";

@Component({
  selector: 'nvt-answer-zone',
  templateUrl: './nvt-answer-zone.component.html',
  styleUrl: './nvt-answer-zone.component.css'
})
export class NVTAnswerZoneComponent {

  @Input({ required: true })
  question!: ExamQuestion ;

  @Output()
  answerEntered = new EventEmitter<ExamQuestion>() ;

  protected appendDigit( digit: string ) {
    this.setAnswer( `${ this.currentValue }${ digit }`, true ) ;
  }

  protected appendDecimalPoint() {
    if( this.currentValue.includes( "." ) ) {
      return ;
    }
    this.setAnswer( `${ this.currentValue }.` ) ;
  }

  protected toggleNegativeSign() {
    if( this.currentValue === "" ) {
      this.setAnswer( "-" ) ;
      return ;
    }

    if( this.currentValue.startsWith( "-" ) ) {
      this.setAnswer( this.currentValue.slice( 1 ) ) ;
      return ;
    }
    this.setAnswer( `-${ this.currentValue }` ) ;
  }

  protected backspace() {
    if( this.currentValue === "" ) {
      return ;
    }
    this.setAnswer( this.currentValue.slice( 0, -1 ) ) ;
  }

  protected clearAnswer() {
    this.setAnswer( "" ) ;
  }

  protected get displayValue() {
    return this.currentValue ;
  }

  private get currentValue() {
    return this.question.answer ?? "" ;
  }

  private setAnswer( nextValue: string, emitAnswerEntered: boolean = false ) {
    const normalizedValue = nextValue === "" ? null : nextValue ;
    if( normalizedValue === this.question.answer ) {
      return ;
    }

    this.question.answer = normalizedValue ;

    if( emitAnswerEntered ) {
      this.answerEntered.emit( this.question ) ;
    }
  }
}
