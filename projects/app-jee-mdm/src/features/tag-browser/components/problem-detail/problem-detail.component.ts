import { Component, input } from '@angular/core';
import { AttemptHistoryComponent } from "@jee-common/widgets/attempt-history/attempt-history.component";
import { TopicProblemSO } from "@jee-common/util/master-data-types";

// Thin wrapper around the existing attempt-history widget (same one
// problem-history/solve-pigeons use) — a selected Problem leaf gets its full
// attempt table, tag badges, and difficulty rating for free.
@Component({
  selector: 'problem-detail',
  imports: [ AttemptHistoryComponent ],
  templateUrl: './problem-detail.component.html',
  styleUrl: './problem-detail.component.css'
})
export class ProblemDetailComponent {
  problem = input.required<TopicProblemSO | null>() ;
}
