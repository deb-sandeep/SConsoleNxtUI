import { Component, inject, input, resource } from '@angular/core';
import { CloseableBadgeComponent } from "lib-core";
import { QuestionImageSO, QuestionSO } from "@jee-common/util/exam-data-types";
import { TagAssociationApiService } from "@jee-common/services/tag-association-api.service";
import { TagSO } from "@jee-common/util/tag-data-types";
import { environment } from "@env/environment";

// Selected-Question detail view — adapted from app-jee-exam-admin's
// question-display component (renders the actual question image(s) +
// answer + metadata), which lives in a separate SPA project and can't be
// imported directly (no shared source tree between apps — only
// lib-core/@jee-common/@env are shared). Drops question-display's
// admin-only topic-reassign <select>, and adds a tag-badges row (which
// question-display itself doesn't have) using the same
// TagAssociationApiService.getTagsForItem/removeTag pattern
// attempt-history's problem tag badges use.
@Component({
  selector: 'question-detail',
  imports: [ CloseableBadgeComponent ],
  templateUrl: './question-detail.component.html',
  styleUrl: './question-detail.component.css'
})
export class QuestionDetailComponent {

  private tagAssociationApi = inject( TagAssociationApiService ) ;

  question = input.required<QuestionSO | null>() ;

  questionTags = resource<TagSO[], unknown>( {
    request: () => ( { id: this.question()?.id } ),
    loader: async () => {
      return await this.tagAssociationApi.getTagsForItem( 'QUESTION', this.question()!.id ) ;
    }
  } ) ;

  getImgURL( img:QuestionImageSO ) {
    return `${environment.apiRoot}/question-img/${this.question()?.sourceId}/${img.fileName}` ;
  }

  async removeTag( tag:TagSO ) {
    await this.tagAssociationApi.removeTag( 'QUESTION', this.question()!.id, tag.id ) ;
    this.questionTags.reload() ;
  }
}
