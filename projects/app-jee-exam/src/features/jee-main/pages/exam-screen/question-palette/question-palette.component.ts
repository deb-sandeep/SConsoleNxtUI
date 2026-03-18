import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";
import { ExamQuestion } from "../../../../../common/so-wrappers";

@Component({
  selector: 'question-palette',
  imports: [],
  templateUrl: './question-palette.component.html',
  styleUrl: './question-palette.component.css'
})
export class QuestionPaletteComponent {

  examSvc = inject( JeeMainService ) ;

  protected displayQuestion( q: ExamQuestion ) {
    console.log( q.index ) ;
  }
}
