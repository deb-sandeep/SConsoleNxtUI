import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExamQuestion } from "../../../../../../common/so-wrappers";

@Component({
  selector: 'mca-answer-zone',
  templateUrl: './mca-answer-zone.component.html',
  styleUrl: './mca-answer-zone.component.css'
})
export class MCAAnswerZoneComponent {

  private readonly MCA_ALPHA_CHOICES = [ "A", "B", "C", "D" ] ;
  private readonly MCA_NUMERIC_CHOICES = [ "1", "2", "3", "4" ] ;

  @Input({ required: true })
  question!: ExamQuestion ;

  @Output()
  answerEntered = new EventEmitter<ExamQuestion>() ;

  ansChoices : string[] ;

  ngOnChanges() {
    // The correct answer for an MCA question can itself be comma-separated
    // (e.g. "A,C"), so the alpha/numeric nature of the choices is judged
    // from its first token.
    const correctAnswer = this.question.questionConfig.question.answer ;
    const firstToken = correctAnswer.split( "," )[0] ;
    this.ansChoices = this.MCA_ALPHA_CHOICES.includes( firstToken ) ?
                           this.MCA_ALPHA_CHOICES : this.MCA_NUMERIC_CHOICES ;
  }

  protected isSelected( choice: string ) {
    return this.selectedChoices.includes( choice ) ;
  }

  protected toggleChoice( choice: string ) {
    const sel = this.selectedChoices ;
    const next = sel.includes( choice ) ?
                      sel.filter( c => c !== choice ) :
                      [ ...sel, choice ].sort() ;
    this.question.answer = next.length > 0 ? next.join( "," ) : null ;
    this.answerEntered.emit( this.question ) ;
  }

  // question.answer is the single source of truth for the selection state.
  // Anything that clears question.answer (e.g. Clear Response) clears the
  // checkboxes too - there is no transient selection state to reset.
  private get selectedChoices(): string[] {
    return this.question.answer ? this.question.answer.split( "," ) : [] ;
  }
}
