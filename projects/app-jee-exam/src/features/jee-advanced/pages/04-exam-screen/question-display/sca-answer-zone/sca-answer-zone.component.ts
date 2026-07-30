import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ExamQuestion } from "../../../../../../common/so-wrappers";

@Component({
  selector: 'sca-answer-zone',
  imports: [
    FormsModule
  ],
  templateUrl: './sca-answer-zone.component.html',
  styleUrl: './sca-answer-zone.component.css'
})
export class SCAAnswerZoneComponent {

  private readonly SCA_ALPHA_CHOICES = [ "A", "B", "C", "D" ] ;
  private readonly SCA_NUMERIC_CHOICES = [ "1", "2", "3", "4" ] ;

  @Input({ required: true })
  question!: ExamQuestion ;

  @Output()
  answerEntered = new EventEmitter<ExamQuestion>() ;

  ansChoices : string[] ;

  ngOnChanges() {
    const correctAnswer = this.question.questionConfig.question.answer ;
    this.ansChoices = this.SCA_ALPHA_CHOICES.includes( correctAnswer ) ?
                           this.SCA_ALPHA_CHOICES : this.SCA_NUMERIC_CHOICES ;
  }

  protected emitAnswerEntered() {
    this.answerEntered.emit( this.question ) ;
  }
}
