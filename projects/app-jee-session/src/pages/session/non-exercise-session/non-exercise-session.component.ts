import { Component, signal } from '@angular/core';
import { Session } from "../../../service/session";
import { NgOptimizedImage } from "@angular/common";
import { AbstractSession } from "../abstract-session";
import { TimerComponent } from "../widgets/timer/timer.component";

@Component({
  selector: 'non-exercise-session',
  imports: [
    NgOptimizedImage,
    TimerComponent
  ],
  templateUrl: './non-exercise-session.component.html',
  styleUrl: './non-exercise-session.component.css'
})
export class NonExerciseSessionComponent extends AbstractSession {

  constructor() {
    super() ;
    this.session = this.getMockSession() ;
    //this.session = this.stateSvc.session ;
    //this.stateSvc.startNewSession().then() ;
  }

  private getMockSession() {
    return {
      sessionType : {
        sessionType : 'Theory',
        color: '#fdfda6',
        iconName: 'session-type-theory.png'
      },
      syllabus : signal({
        syllabusName: 'IIT - Physics',
        subjectName: 'Physics',
        color: '#FFC468',
        iconName: 'syllabus-physics.png'
      }),
      topic: signal( {
        sectionName: 'Mechanics',
        topicName: 'States of Matter - Gases and Liquids',
      })
    } as Session ;
  }
}
