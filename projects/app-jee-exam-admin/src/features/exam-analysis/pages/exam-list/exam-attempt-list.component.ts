import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DatePipe, DecimalPipe, NgIf } from "@angular/common";
import { DurationPipe } from "lib-core";
import { ColumnSorterComponent } from "@jee-common/widgets/column-sorter.component";
import { ExamAttemptSO } from "@jee-common/util/exam-data-types";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { JeeBaseService } from "@jee-common/services/jee-base.service";

@Component({
  selector: 'exam-list',
  imports: [
    FormsModule,
    DatePipe,
    ColumnSorterComponent,
    DurationPipe,
    DecimalPipe,
  ],
  templateUrl: './exam-attempt-list.component.html',
  styleUrl: './exam-attempt-list.component.css'
})
export class ExamAttemptListComponent {

  private router = inject( Router ) ;
  private route = inject( ActivatedRoute ) ;
  private apiSvc = inject( ExamApiService ) ;
  private examSvc = inject( JeeBaseService ) ;

  attemptList : ExamAttemptSO[]|null = null ;
  sortDirMap : Record<string, number> = {
    'type' : 0,
    'date' : 0,
    'duration' : 0,
    'numPhyQ' : 0,
    'numChemQ' : 0,
    'numMathQ' : 0,
    'score' : 0,
    'totalMarks' : 0,
    'avoidableLossPct' : 0,
    'note' : 0,
  };

  ngOnInit() {
    this.apiSvc.getListOfExamAttempts().then((attemptList) => {
      this.attemptList = attemptList ;
    }) ;
    this.examSvc.loadRootCauses() ;
  }

  sortByColumn( columnName: string ) {
    let sortDir = this.sortDirMap[columnName] ;
    sortDir = sortDir == 2 ? 0 : ++sortDir ;
    this.sortDirMap[columnName] = sortDir ;

    Object.keys( this.sortDirMap ).forEach( key => {
      if( key !== columnName ) {
        this.sortDirMap[key] = 0;
      }
    } ) ;

    if( this.attemptList && sortDir != 0 ) {
      const direction = this.sortDirMap[columnName] == 1 ? 1 : -1;
      this.attemptList.sort( ( a, b ) => {
        const aVal = ( a as any )[columnName];
        const bVal = ( b as any )[columnName];
        if( aVal < bVal ) return -1 * direction;
        if( aVal > bVal ) return 1 * direction;
        return 0;
      } );
    }

  }

  protected analyzeAttempt( attempt: ExamAttemptSO ) {
    this.router.navigate( [ '../analysis-screen', attempt.id ], {relativeTo: this.route} ).then() ;
  }
}
