import { Component, inject, input, output, resource } from "@angular/core";
import { CloseableBadgeComponent, DurationPipe } from "lib-core";
import { FormsModule } from "@angular/forms";
import { DatePipe, NgClass } from "@angular/common";
import { NgbRating } from "@ng-bootstrap/ng-bootstrap";
import { ProblemApiService } from "@jee-common/services/problem-api.service";
import { TagAssociationApiService } from "@jee-common/services/tag-association-api.service";
import { ProblemAttemptSO, TopicProblemSO } from "@jee-common/util/master-data-types";
import { TagSO } from "@jee-common/util/tag-data-types";
import { SConsoleUtil } from "@jee-common/util/common-util";

@Component({
  selector: 'attempt-history',
  imports: [
    FormsModule,
    NgClass,
    DurationPipe,
    DatePipe,
    NgbRating,
    CloseableBadgeComponent
  ],
  // Self-provided rather than relying on the host route (unlike
  // tag-association-dialog's services, provided per-route in routes.ts) —
  // this component is used from both problem-history and solve-pigeons,
  // and only the former's route happens to provide TagAssociationApiService.
  providers: [ProblemApiService, TagAssociationApiService],
  templateUrl: './attempt-history.component.html',
  styleUrl: './attempt-history.component.css'
})
export class AttemptHistoryComponent {

  protected readonly SConsoleUtil = SConsoleUtil;

  private problemApi = inject( ProblemApiService ) ;
  private tagAssociationApi = inject( TagAssociationApiService ) ;

  problem = input.required<TopicProblemSO|null>() ;

  problemAttempts = resource<ProblemAttemptSO[], unknown>( {

    request: () => ( { id: this.problem()?.problemId } ),

    loader: async () => {
      return await this.problemApi.getProblemAttempts( this.problem()!.problemId ) ;
    }
  }) ;

  /**
   * Tags currently attached to {@link problem}, shown as closeable badges
   * above the attempt table. Refetched whenever the selected problem
   * changes (same `request`-keyed-on-problemId pattern as
   * {@link problemAttempts}), and manually reloaded after a removal — see
   * {@link removeTag}.
   */
  problemTags = resource<TagSO[], unknown>( {

    request: () => ( { id: this.problem()?.problemId } ),

    loader: async () => {
      return await this.tagAssociationApi.getTagsForItem( 'PROBLEM', this.problem()!.problemId ) ;
    }
  }) ;

  attemptHistoryModified = output<boolean>() ;

  /**
   * Emitted after a tag is successfully removed here, so the host can
   * refresh anything else that depends on tag state (e.g. the per-row tag
   * count/icon in problem-history's list) — mirrors
   * `tag-association-dialog`'s own `tagsChanged` output.
   */
  tagsChanged = output<void>() ;

  constructor() {}

  refreshProblemAttempts() {
    this.problemAttempts.reload() ;
  }

  /**
   * Public command, called by the host after attaching/detaching a tag
   * elsewhere (e.g. via `tag-association-dialog`) — reloads
   * {@link problemTags} so the badges shown here reflect the change without
   * needing to reselect the problem.
   */
  refreshProblemTags() {
    this.problemTags.reload() ;
  }

  problemRatingChanged() {
    this.problemApi.updateProblemDifficultyLevel(
      this.problem()!.problemId,
      this.problem()!.difficultyLevel
    ).then() ;
  }

  async deleteProblemAttempt( pa: ProblemAttemptSO) {
    await this.problemApi.deleteProblemAttempt( pa.id ) ;
    this.refreshProblemAttempts() ;
    this.attemptHistoryModified.emit( true ) ;
  }

  /**
   * Invoked from a tag badge's own close ("x") — detaches that tag from the
   * current problem, reloads {@link problemTags} so the badge disappears,
   * and notifies the host via `tagsChanged`.
   */
  async removeTag( tag:TagSO ) {
    await this.tagAssociationApi.removeTag( 'PROBLEM', this.problem()!.problemId, tag.id ) ;
    this.problemTags.reload() ;
    this.tagsChanged.emit() ;
  }

  getProblemStateDisplayText( text: string ) {
    if( text == 'Pigeon Explained' ) {
      return "P Explained" ;
    }
    else if( text == "Pigeon Solved" ) {
      return "P Solved" ;
    }
    return text ;
  }
}