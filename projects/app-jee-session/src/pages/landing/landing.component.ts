import { Component, inject } from '@angular/core';
import { Alert } from "lib-core";
import { SessionStateService } from "../../service/session-state.service";
import { NgOptimizedImage, NgStyle } from "@angular/common";
import { SessionTypeSO } from "@jee-common/master-data-types";

@Component({
  selector: 'landing',
  imports: [
    NgOptimizedImage,
    NgStyle
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

  stateSvc:SessionStateService = inject( SessionStateService ) ;

  constructor() {
    this.stateSvc.loadMasterData().then() ;
  }

  getSTStyle( st:SessionTypeSO ) {
    const numTypes = this.stateSvc.sessionTypes.length ;
    const sideLength = `calc( (100dvh - var(--session-type-padding)*${numTypes+1} - var(--page-header-height)) / ${numTypes})` ;
    return {
      'background-color':st.color,
      'height': sideLength,
      'width': sideLength,
    }
  }

  getSyllabusStyle( st: any ) {
    const numTypes = this.stateSvc.syllabuses.length ;
    const sideHeight = `calc( (100dvh - var(--session-type-padding)*${numTypes+1} - var(--page-header-height)) / ${numTypes})` ;
    const sideWidth = `calc( ${sideHeight}*2 )` ;
    return {
      'background-color':st.color,
      'height': sideHeight,
      'width': sideWidth,
    }
  }
}
