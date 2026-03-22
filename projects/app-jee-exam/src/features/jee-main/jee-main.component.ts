import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { JeeMainService } from "./jee-main.service";

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

  private examSvc = inject( JeeMainService ) ;

  constructor( private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.paramMap.subscribe( pm => {
      const examId = Number( pm.get( 'examId' ) ) ;
      if( !isNaN( examId ) ){
        this.examSvc.loadExamConfig( examId ).then() ;
      }
    })
  }
}
