import { Component, input } from '@angular/core';
import { QuestionImageSO, QuestionSO } from "@jee-common/util/exam-data-types";
import { environment } from "@env/environment";

@Component({
  selector: 'div[selectedQuestionDisplay]',
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {

  question = input<QuestionSO|null>() ;

  getImgURL( img:QuestionImageSO ) {
    return `${ environment.apiRoot }/question-img/${ this.question()?.sourceId }/${ img.fileName }` ;
  }
}
