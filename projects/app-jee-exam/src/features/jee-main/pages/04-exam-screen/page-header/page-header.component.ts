import { Component, inject } from '@angular/core';
import { NgClass, NgOptimizedImage } from "@angular/common";
import { JeeMainService } from "../../../jee-main.service";
import { examConfig } from "../../../../../exam-config.js";

@Component({
  selector: 'page-header',
    imports: [
        NgOptimizedImage,
        NgClass
    ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {

  examSvc = inject( JeeMainService ) ;

  protected getRemainingTime() {

    let timeLeft = this.examSvc.timeLeftInSeconds() ;
    const hours = Math.max( 0, Math.floor( timeLeft / 3600 ) ) ;
    const minutes = Math.max( 0, Math.floor( ( timeLeft % 3600 ) / 60 ) ) ;
    const seconds = Math.max( 0, timeLeft % 60 ) ;

    return `${ hours.toString().padStart( 2, '0' ) }:` +
           `${ minutes.toString().padStart( 2, '0' ) }:` +
           `${ seconds.toString().padStart( 2, '0' ) }`;
  }

  protected readonly examConfig = examConfig;
}
