import { Component, inject, input, output, resource } from "@angular/core";
import { DurationPipe } from "lib-core";
import { FormsModule } from "@angular/forms";
import { DatePipe, NgClass } from "@angular/common";
import { NgbRating } from "@ng-bootstrap/ng-bootstrap";
import { ProblemApiService } from "@jee-common/services/problem-api.service";
import { ProblemAttemptSO, TopicProblemSO } from "@jee-common/util/master-data-types";
import { SConsoleUtil } from "@jee-common/util/common-util";

@Component({
  selector: 'attempt-history',
  imports: [
    FormsModule,
    NgClass,
    DurationPipe,
    DatePipe,
    NgbRating
  ],
  providers: [ProblemApiService],
  templateUrl: './attempt-history.component.html',
  styleUrl: './attempt-history.component.css'
})
export class AttemptHistoryComponent {

  protected readonly SConsoleUtil = SConsoleUtil;

  private problemApi = inject( ProblemApiService ) ;

  problem = input.required<TopicProblemSO|null>() ;

  problemAttempts = resource<ProblemAttemptSO[], unknown>( {

    request: () => ( { id: this.problem()?.problemId } ),

    loader: async () => {
      return await this.problemApi.getProblemAttempts( this.problem()!.problemId ) ;
    }
  }) ;

  attemptHistoryModified = output<boolean>() ;

  constructor() {}

  refreshProblemAttempts() {
    this.problemAttempts.reload() ;
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
}