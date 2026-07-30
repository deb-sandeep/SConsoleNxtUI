import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ExamQuestion } from "../../../../../../common/so-wrappers";

@Component({
  selector: 'nvt-answer-zone',
  templateUrl: './nvt-answer-zone.component.html',
  styleUrl: './nvt-answer-zone.component.css'
})
export class NVTAnswerZoneComponent {

  @ViewChild('answerBox')
  private answerBox?: ElementRef<HTMLDivElement> ;

  @Input({ required: true })
  question!: ExamQuestion ;

  @Output()
  answerEntered = new EventEmitter<ExamQuestion>() ;

  // Position, within the answer string, where the next digit/decimal/sign
  // gets inserted. Reset to end-of-string whenever the active question
  // changes (ngOnChanges), since this is local editing state, not answer data.
  cursorPosition = 0 ;

  ngOnChanges() {
    this.cursorPosition = this.currentValue.length ;
  }

  protected appendDigit( digit: string ) {
    const pos = this.cursorPosition ;
    const nextValue = this.currentValue.slice( 0, pos ) + digit + this.currentValue.slice( pos ) ;
    this.setAnswer( nextValue, pos + 1, true ) ;
  }

  protected appendDecimalPoint() {
    if( this.currentValue.includes( "." ) ) {
      return ;
    }
    const pos = this.cursorPosition ;
    const nextValue = this.currentValue.slice( 0, pos ) + "." + this.currentValue.slice( pos ) ;
    this.setAnswer( nextValue, pos + 1 ) ;
  }

  protected toggleNegativeSign() {
    if( this.currentValue === "" ) {
      this.setAnswer( "-", 1 ) ;
      return ;
    }

    if( this.currentValue.startsWith( "-" ) ) {
      this.setAnswer( this.currentValue.slice( 1 ), Math.max( 0, this.cursorPosition - 1 ) ) ;
      return ;
    }
    this.setAnswer( `-${ this.currentValue }`, this.cursorPosition + 1 ) ;
  }

  protected backspace() {
    const pos = this.cursorPosition ;
    if( pos === 0 ) {
      return ;
    }
    const nextValue = this.currentValue.slice( 0, pos - 1 ) + this.currentValue.slice( pos ) ;
    this.setAnswer( nextValue, pos - 1, true ) ;
  }

  protected clearAnswer() {
    this.setAnswer( "", 0 ) ;
  }

  protected moveCursorLeft() {
    this.cursorPosition = Math.max( 0, this.cursorPosition - 1 ) ;
    this.focusAnswerBox() ;
  }

  protected moveCursorRight() {
    this.cursorPosition = Math.min( this.currentValue.length, this.cursorPosition + 1 ) ;
    this.focusAnswerBox() ;
  }

  protected get beforeCursor(): string {
    return this.currentValue.slice( 0, this.cursorPosition ) ;
  }

  protected get afterCursor(): string {
    return this.currentValue.slice( this.cursorPosition ) ;
  }

  protected get displayValue() {
    return this.currentValue ;
  }

  private get currentValue() {
    return this.question.answer ?? "" ;
  }

  private setAnswer( nextValue: string, cursorPosition: number, emitAnswerEntered: boolean = false ) {
    this.cursorPosition = cursorPosition ;

    const normalizedValue = nextValue === "" ? null : nextValue ;
    if( normalizedValue !== this.question.answer ) {
      this.question.answer = normalizedValue ;

      if( emitAnswerEntered ) {
        this.answerEntered.emit( this.question ) ;
      }
    }

    this.focusAnswerBox() ;
  }

  // Every keypad button click moves DOM focus onto the button itself, so the
  // answer box needs to be re-focused after each action to keep reading as
  // the focused control (and keep showing its cursor) between clicks. It is
  // deliberately never focused on load/question-change - auto-focusing was
  // distracting when a question first appears.
  private focusAnswerBox() {
    this.answerBox?.nativeElement.focus() ;
  }
}
