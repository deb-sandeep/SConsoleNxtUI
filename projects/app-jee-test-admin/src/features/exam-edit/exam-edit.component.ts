import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'exam-edit',
  imports: [],
  templateUrl: './exam-edit.component.html',
  styleUrl: './exam-edit.component.css'
})
export class ExamEditComponent {

  router = inject( Router ) ;

  examId : number = 0 ;

  constructor( private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.paramMap.subscribe( pm => {
      this.examId = Number( pm.get( 'examId' ) ) ;
      if( !isNaN( this.examId ) ){
        console.log( 'Exam ID = ' + this.examId ) ;
      }
    })
  }
}