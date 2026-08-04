import { Component, inject, input } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { QuestionImageSO, QuestionSO } from "@jee-common/util/exam-data-types";
import { environment } from "@env/environment";
import { QuestionBrowserService } from "../../question-browser.service";

@Component({
  selector: 'question-display',
  imports: [
    FormsModule
  ],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {

  private qBrowserSvc : QuestionBrowserService = inject( QuestionBrowserService ) ;

  question = input<QuestionSO>() ;

  getImgURL( img:QuestionImageSO ) {
    return `${ environment.apiRoot }/question-img/${ this.question()?.sourceId }/${ img.fileName }` ;
  }

  getTopicsForQuestion() {
    return this.qBrowserSvc.getTopicsForSyllabus( this.question()!.syllabusName ) ;
  }

  topicChanged( event: Event ) {
    const newTopicId = Number( ( event.target as HTMLSelectElement ).value ) ;
    const newTopic = this.getTopicsForQuestion().find( t => t.id === newTopicId ) ;
    if( !newTopic || newTopic.id === this.question()!.topicId ) {
      return ;
    }
    this.qBrowserSvc.updateQuestionTopic( this.question()!, newTopic ).then() ;
  }
}
