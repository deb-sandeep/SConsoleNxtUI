import { Component, input } from '@angular/core';
import { QuestionImageSO, QuestionSO } from "../../../../type";
import { environment } from "@env/environment";

@Component({
  selector: 'question-display',
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {

  question = input<QuestionSO>() ;

  getImgURL( img:QuestionImageSO ) {
    return `${ environment.apiRoot }/question-img/${ this.question()?.sourceId }/${ img.fileName }` ;
  }
}
