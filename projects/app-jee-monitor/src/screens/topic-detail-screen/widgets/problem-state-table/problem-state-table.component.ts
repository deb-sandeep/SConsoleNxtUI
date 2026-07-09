import { Component, computed, input, output } from '@angular/core';
import { ProblemStateBreakdown } from "../../../../service/response-payload.types";

type StateRow = {
  label: string,
  colorClass: string,
  all: number,
  today: number,
  filterKey: string,
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

  rowClicked = output<string>() ;

  private rows = computed<StateRow[]>( () => {
    const a = this.allTime() ;
    const t = this.today() ;
    return [
      { label: 'Correct',  colorClass: 'correct',  all: a.numCorrect,                        today: t.numCorrect,                        filterKey: 'correct'  },
      { label: 'Wrong',    colorClass: 'wrong',    all: a.numIncorrect + a.numPigeonsExplained, today: t.numIncorrect + t.numPigeonsExplained, filterKey: 'wrong'    },
      { label: 'Later',    colorClass: '',         all: a.numLater,                          today: t.numLater,                          filterKey: 'later'    },
      { label: 'Redo',     colorClass: '',         all: a.numRedo,                           today: t.numRedo,                           filterKey: 'redo'     },
      { label: 'Pigeon',   colorClass: 'pigeon',   all: a.numPigeons + a.numPigeonsSolved,      today: t.numPigeons + t.numPigeonsSolved,      filterKey: 'pigeon'   },
      { label: 'Purged',   colorClass: '',         all: a.numPurged,                         today: t.numPurged,                         filterKey: 'purged'   },
      { label: 'Reassign', colorClass: '',         all: a.numReassign,                       today: t.numReassign,                       filterKey: 'reassign' },
    ] ;
  } ) ;

  leftColumn = computed( () => this.rows().slice( 0, Math.ceil( this.rows().length / 2 ) ) ) ;
  rightColumn = computed( () => this.rows().slice( Math.ceil( this.rows().length / 2 ) ) ) ;
}
