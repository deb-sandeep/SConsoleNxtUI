import { Component, computed, inject, input } from '@angular/core';
import { TopicSchedule } from "../../entities/topic-schedule";
import { DatePipe, DecimalPipe, NgIf } from "@angular/common";
import { TopicProblemCounts } from "../../manage-tracks.types";
import { ManageTracksService } from "../../manage-tracks.service";

@Component({
  selector: 'topic-schedule',
  imports: [
    DatePipe,
    DecimalPipe,
    NgIf
  ],
  templateUrl: './topic-schedule.component.html',
  styleUrl: './topic-schedule.component.css'
})
export class TopicScheduleComponent {

  private svc = inject( ManageTracksService ) ;
  protected readonly TopicSchedule = TopicSchedule;

  schedule = input.required<TopicSchedule>() ;
  colors = computed( () => this.schedule().topic.syllabus.colors ) ;

  recomputeExerciseDays() {
    this.schedule().recomputeExerciseDays() ;
    this.schedule().track!.recomputeScheduleSequenceAttributes() ;
  }

  getDefaultNumExerciseDays() {
    return this.schedule().topic.getDefaultExerciseDuration() ;
  }

  getNumExerciseDays() {
    return this.schedule().exerciseNumDays ;
  }

  getProblemCount( problemType:string, pc:TopicProblemCounts ) {
    if( problemType in pc.problemTypeCount ) {
      return `${ pc.remainingProblemTypeCount[problemType] }/${ pc.problemTypeCount[problemType] }`;
    }
    return '0' ;
  }

  moveScheduleToPrevTrack() {
    this.schedule().track!.moveScheduleToPrevTrack( this.schedule() ) ;
    this.svc.notifyTopicScheduleUpdated() ;
  }

  moveScheduleToNextTrack() {
    this.schedule().track!.moveScheduleToNextTrack( this.schedule() ) ;
    this.svc.notifyTopicScheduleUpdated() ;
  }

  moveScheduleUp() {
    this.schedule().track!.moveScheduleUp( this.schedule() ) ;
    this.svc.notifyTopicScheduleUpdated() ;
  }

  moveScheduleDown() {
    this.schedule().track!.moveScheduleDown( this.schedule() ) ;
    this.svc.notifyTopicScheduleUpdated() ;
  }

  removeSchedule() {
    this.schedule().track!.removeSchedule( this.schedule() ) ;
    this.svc.notifyTopicScheduleUpdated() ;
  }
}
