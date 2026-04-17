import { Component, inject } from '@angular/core';
import { PageToolbarComponent, ToolbarActionComponent } from "lib-core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ExamSetupService } from "../exam-setup/exam-setup.service";
import { ExamSO } from "@jee-common/util/exam-data-types";
import { DatePipe, NgIf } from "@angular/common";
import { ColumnSorterComponent } from "@jee-common/widgets/column-sorter.component";
import { ExamNoteComponent } from "@jee-common/widgets/exam-note/exam-note.component";

@Component({
  selector: 'exam-list',
  imports: [
    FormsModule,
    PageToolbarComponent,
    ToolbarActionComponent,
    DatePipe,
    ColumnSorterComponent,
    NgIf,
    ExamNoteComponent
  ],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css'
})
export class ExamListComponent {

  readonly DELETE_ALLOWED_STATES = ['DRAFT', 'PUBLISHED'] ;
  readonly EDIT_ALLOWED_STATES = ['DRAFT', 'PUBLISHED'] ;

  private router = inject( Router ) ;
  private svc = inject( ExamSetupService ) ;

  examList : ExamSO[]|null = null ;
  sortDirMap : Record<string, number> = {
    'state' : 0,
    'type' : 0,
    'duration' : 0,
    'numPhyQuestions' : 0,
    'numChemQuestions' : 0,
    'numMathQuestions' : 0,
    'totalMarks' : 0,
    'note' : 0,
  };

  ngOnInit() {
    this.svc.getListOfExams().then((examList) => {
      console.log( examList ) ;
      this.examList = examList ;
    }) ;
  }

  newExamSetup() {
    this.router.navigateByUrl( "/exam-config/exam-setup" ).then() ;
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

    if( this.examList && sortDir != 0 ) {
      const direction = this.sortDirMap[columnName] == 1 ? 1 : -1;
      this.examList.sort( ( a, b ) => {
        const aVal = ( a as any )[columnName];
        const bVal = ( b as any )[columnName];
        if( aVal < bVal ) return -1 * direction;
        if( aVal > bVal ) return 1 * direction;
        return 0;
      } );
    }

  }

  protected editExam( id: number ) {
    this.router.navigateByUrl( "/exam-edit/" + id ).then() ;
  }

  protected deleteExam( id: number ) {
    this.svc.deleteExam( id ).then( () => {
      this.ngOnInit() ;
    })
  }
}
