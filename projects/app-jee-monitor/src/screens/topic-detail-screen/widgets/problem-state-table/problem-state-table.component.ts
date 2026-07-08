import { Component, computed, input } from '@angular/core';
import { ProblemStateBreakdown } from "../../../../service/response-payload.types";

type StateRow = {
  label: string,
  colorClass: string,
  all: number,
  today: number,
}

@Component({
  selector: 'problem-state-table',
  imports: [],
  templateUrl: './problem-state-table.component.html',
  styleUrl: './problem-state-table.component.css'
})
export class ProblemStateTableComponent {

  allTime = input.required<ProblemStateBreakdown>() ;
  today = input.required<ProblemStateBreakdown>() ;

  private rows = computed<StateRow[]>( () => {
    const a = this.allTime() ;
    const t = this.today() ;
    return [
      { label: 'Correct',  colorClass: 'correct',  all: a.numCorrect,                        today: t.numCorrect                        },
      { label: 'Wrong',    colorClass: 'wrong',    all: a.numIncorrect + a.numPigeonsExplained, today: t.numIncorrect + t.numPigeonsExplained },
      { label: 'Later',    colorClass: '',         all: a.numLater,                          today: t.numLater                          },
      { label: 'Redo',     colorClass: '',         all: a.numRedo,                           today: t.numRedo                           },
      { label: 'Pigeon',   colorClass: 'pigeon',   all: a.numPigeons + a.numPigeonsSolved,      today: t.numPigeons + t.numPigeonsSolved      },
      { label: 'Purged',   colorClass: '',         all: a.numPurged,                         today: t.numPurged                         },
      { label: 'Reassign', colorClass: '',         all: a.numReassign,                       today: t.numReassign                       },
    ] ;
  } ) ;

  leftColumn = computed( () => this.rows().slice( 0, Math.ceil( this.rows().length / 2 ) ) ) ;
  rightColumn = computed( () => this.rows().slice( Math.ceil( this.rows().length / 2 ) ) ) ;
}
