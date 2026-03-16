import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { ExamService } from "../../exam.service";

@Component({
  selector: 'jee-main',
  imports: [ RouterOutlet ],
  template: `
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class JeeMainComponent {

  private examSvc = inject( ExamService ) ;

  constructor( private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.paramMap.subscribe( pm => {
      const examId = Number( pm.get( 'examId' ) ) ;
      if( !isNaN( examId ) ){
        this.examSvc.loadExamConfig( examId ) ;
      }
    })
  }
}
