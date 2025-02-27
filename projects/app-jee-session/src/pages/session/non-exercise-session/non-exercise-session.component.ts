import { Component, inject } from '@angular/core';
import { Session } from "../../../service/session";
import { NgOptimizedImage } from "@angular/common";
import { AbstractSession } from "../abstract-session";

@Component({
  selector: 'non-exercise-session',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './non-exercise-session.component.html',
  styleUrl: './non-exercise-session.component.css'
})
export class NonExerciseSessionComponent extends AbstractSession {

  constructor() {
    super() ;
    //this.session = this.stateSvc.session ;
    this.session = this.getMockSession() ;
    //this.stateSvc.startNewSession().then() ;
  }

  private getMockSession() {
    return {
      sessionType : {
        sessionType : 'Exercise',
        color: '#8bffec',
        iconName: 'session-type-exercise.png'
      }
    } as Session ;
  }
}
