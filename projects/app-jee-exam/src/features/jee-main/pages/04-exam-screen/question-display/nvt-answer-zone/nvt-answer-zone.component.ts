import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ExamQuestion } from "../../../../../../common/so-wrappers";

@Component({
  selector: 'nvt-answer-zone',
  imports: [
    FormsModule
  ],
  templateUrl: './nvt-answer-zone.component.html',
  styleUrl: './nvt-answer-zone.component.css'
})
export class NVTAnswerZoneComponent {

  @Input({ required: true })
  question!: ExamQuestion ;

  @Output()
  answerEntered = new EventEmitter<ExamQuestion>() ;

  protected emitAnswerEntered() {
    this.answerEntered.emit( this.question ) ;
  }
}
